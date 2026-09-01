import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EMAIL_PROVIDER,
} from './interfaces/email-provider.interface';
import type { EmailProvider } from './interfaces/email-provider.interface';
import { generatePasswordResetEmail } from './templates/password-reset.template';
import { generateVerificationEmail } from './templates/verification.template';
import { generateEmailChangeEmail } from './templates/email-change.template';
import { generateAccountDeleteOtpEmail } from './templates/account-delete-otp.template';
import { generateAccountGoodbyeEmail } from './templates/account-goodbye.template';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(input: {
    to: { email: string; name?: string }[];
    subject: string;
    text: string;
    html: string;
    replyTo?: { email: string; name?: string };
  }): Promise<void> {
    await this.emailProvider.sendEmail(input);
  }

  async sendPasswordResetEmail(input: {
    email: string;
    fullName?: string;
    otp: string;
  }): Promise<void> {
    const expirySeconds = this.configService.get<number>('otp.expirySeconds') || 300;
    const template = generatePasswordResetEmail({
      fullName: input.fullName,
      otp: input.otp,
      expiresInMinutes: Math.ceil(expirySeconds / 60),
    });

    await this.emailProvider.sendEmail({
      to: [{ email: input.email, name: input.fullName }],
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendVerificationEmail(input: {
    email: string;
    fullName?: string;
    otp: string;
  }): Promise<void> {
    const expirySeconds = this.configService.get<number>('otp.expirySeconds') || 300;
    const template = generateVerificationEmail({
      fullName: input.fullName,
      otp: input.otp,
      expiresInMinutes: Math.ceil(expirySeconds / 60),
    });

    await this.emailProvider.sendEmail({
      to: [{ email: input.email, name: input.fullName }],
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendEmailChangeEmail(input: {
    email: string;
    fullName?: string;
    otp: string;
  }): Promise<void> {
    const template = generateEmailChangeEmail({
      fullName: input.fullName,
      otp: input.otp,
      expiresInMinutes: 10,
    });

    await this.emailProvider.sendEmail({
      to: [{ email: input.email, name: input.fullName }],
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendAccountDeleteOtpEmail(input: {
    email: string;
    fullName?: string;
    otp: string;
  }): Promise<void> {
    const template = generateAccountDeleteOtpEmail({
      fullName: input.fullName,
      otp: input.otp,
      expiresInMinutes: 10,
    });

    await this.emailProvider.sendEmail({
      to: [{ email: input.email, name: input.fullName }],
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendAccountGoodbyeEmail(input: {
    email: string;
    fullName?: string;
  }): Promise<void> {
    const template = generateAccountGoodbyeEmail({ fullName: input.fullName });

    await this.emailProvider.sendEmail({
      to: [{ email: input.email, name: input.fullName }],
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
}
