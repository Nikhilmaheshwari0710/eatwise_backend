import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { ServiceUnavailableException } from '@nestjs/common';
import { MailtrapProvider } from './mailtrap.provider';

describe('MailtrapProvider', () => {
  let provider: MailtrapProvider;
  const httpService = {
    post: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        nodeEnv: 'test',
        'email.mailtrap.apiToken': 'token',
        'email.mailtrap.apiUrl': 'https://send.api.mailtrap.io/api/send',
        'email.mailtrap.fromEmail': 'noreply@eatwise.app',
        'email.mailtrap.fromName': 'EatWise',
      };

      return values[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailtrapProvider,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    provider = module.get(MailtrapProvider);
    jest.clearAllMocks();
  });

  it('should send email using Mailtrap API', async () => {
    httpService.post.mockReturnValue(of({ data: {} }));

    await provider.sendEmail({
      to: [{ email: 'john@example.com' }],
      subject: 'Test',
      text: 'Hello',
      html: '<p>Hello</p>',
    });

    expect(httpService.post).toHaveBeenCalled();
  });

  it('should throw clean error when Mailtrap fails', async () => {
    httpService.post.mockReturnValue(
      throwError(() => new AxiosError('Provider unavailable', 'ECONNABORTED')),
    );

    await expect(
      provider.sendEmail({
        to: [{ email: 'john@example.com' }],
        subject: 'Test',
        text: 'Hello',
        html: '<p>Hello</p>',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('should throw clean error for invalid recipient response', async () => {
    const error = new AxiosError('Bad Request');
    error.response = {
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: {} as never,
      data: { errors: ['invalid recipient'] },
    };
    httpService.post.mockReturnValue(throwError(() => error));

    await expect(
      provider.sendEmail({
        to: [{ email: 'invalid-email' }],
        subject: 'Test',
        text: 'Hello',
        html: '<p>Hello</p>',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
