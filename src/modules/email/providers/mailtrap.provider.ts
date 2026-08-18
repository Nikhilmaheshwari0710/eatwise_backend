import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as nodemailer from 'nodemailer';
import { EmailProvider, SendEmailOptions } from '../interfaces/email-provider.interface';

@Injectable()
export class MailtrapProvider implements EmailProvider, OnModuleInit {
  private readonly logger = new Logger(MailtrapProvider.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const hasRequiredConfig = this.hasProviderConfig();
    const isProduction = this.configService.get<string>('nodeEnv') === 'production';

    if (isProduction && !hasRequiredConfig) {
      this.logger.error('Mailtrap configuration is missing in production.');
      throw new InternalServerErrorException('Email provider is not configured');
    }

    if (!isProduction && !hasRequiredConfig) {
      this.logger.warn(
        'Mailtrap configuration is missing. Development mock email mode is enabled.',
      );
      return;
    }

    if (this.hasSmtpConfig()) {
      this.logger.log('Mailtrap SMTP provider configured.');
      return;
    }

    this.logger.log('Mailtrap email API provider configured.');
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.hasProviderConfig()) {
      this.handleMockSend(options);
      return;
    }

    if (this.hasSmtpConfig()) {
      await this.sendViaSmtp(options);
      return;
    }

    await this.sendViaApi(options);
  }

  private async sendViaSmtp(options: SendEmailOptions): Promise<void> {
    const host = this.configService.get<string>('email.mailtrap.host') || '';
    const port = this.configService.get<number>('email.mailtrap.port') || 2525;
    const username = this.configService.get<string>('email.mailtrap.username') || '';
    const password = this.configService.get<string>('email.mailtrap.password') || '';
    const fromEmail = this.configService.get<string>('email.mailtrap.fromEmail') || '';
    const fromName = this.configService.get<string>('email.mailtrap.fromName') || 'EatWise';

    const transporter = nodemailer.createTransport({
      host,
      port,
      auth: {
        user: username,
        pass: password,
      },
    });

    try {
      await transporter.sendMail({
        from: {
          name: fromName,
          address: fromEmail,
        },
        to: options.to.map((recipient) =>
          recipient.name ? `"${recipient.name}" <${recipient.email}>` : recipient.email,
        ),
        replyTo: options.replyTo?.email,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(`Mailtrap SMTP send failed (${name}).`);
      throw new ServiceUnavailableException('Unable to send email at this time');
    }
  }

  private async sendViaApi(options: SendEmailOptions): Promise<void> {
    const apiUrl =
      this.configService.get<string>('email.mailtrap.apiUrl') ||
      'https://send.api.mailtrap.io/api/send';
    const apiToken = this.configService.get<string>('email.mailtrap.apiToken') || '';
    const fromEmail = this.configService.get<string>('email.mailtrap.fromEmail') || '';
    const fromName = this.configService.get<string>('email.mailtrap.fromName') || 'EatWise';

    try {
      await firstValueFrom(
        this.httpService.post(
          apiUrl,
          {
            from: {
              email: fromEmail,
              name: fromName,
            },
            to: options.to.map((recipient) => ({
              email: recipient.email,
              name: recipient.name,
            })),
            subject: options.subject,
            text: options.text,
            html: options.html,
            ...(options.replyTo
              ? {
                  reply_to: {
                    email: options.replyTo.email,
                    name: options.replyTo.name,
                  },
                }
              : {}),
          },
          {
            timeout: 10000,
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      const code = error instanceof AxiosError ? error.code : undefined;
      this.logger.error(
        `Mailtrap request failed${status ? ` with status ${status}` : ''}${
          code ? ` (${code})` : ''
        }.`,
      );
      throw new ServiceUnavailableException('Unable to send email at this time');
    }
  }

  private hasProviderConfig(): boolean {
    return this.hasSmtpConfig() || this.hasApiConfig();
  }

  private hasSmtpConfig(): boolean {
    return Boolean(
      this.configService.get<string>('email.mailtrap.host') &&
        this.configService.get<string>('email.mailtrap.username') &&
        this.configService.get<string>('email.mailtrap.password') &&
        this.configService.get<string>('email.mailtrap.fromEmail'),
    );
  }

  private hasApiConfig(): boolean {
    return Boolean(
      this.configService.get<string>('email.mailtrap.apiToken') &&
        this.configService.get<string>('email.mailtrap.apiUrl') &&
        this.configService.get<string>('email.mailtrap.fromEmail'),
    );
  }

  private handleMockSend(options: SendEmailOptions): void {
    const isProduction = this.configService.get<string>('nodeEnv') === 'production';
    if (isProduction) {
      throw new InternalServerErrorException('Email provider is not configured');
    }

    const recipients = options.to.map((recipient) => recipient.email).join(', ');
    this.logger.warn(
      `Mock Mailtrap email send in development for ${recipients} with subject "${options.subject}".`,
    );
  }
}
