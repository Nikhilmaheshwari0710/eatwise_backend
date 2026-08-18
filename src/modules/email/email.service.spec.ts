import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';

describe('EmailService', () => {
  let service: EmailService;
  const emailProvider = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: EMAIL_PROVIDER,
          useValue: emailProvider,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'otp.expirySeconds') return 300;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate password reset email to the configured provider', async () => {
    await service.sendPasswordResetEmail({
      email: 'john@example.com',
      fullName: 'John Doe',
      otp: '123456',
    });

    expect(emailProvider.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [{ email: 'john@example.com', name: 'John Doe' }],
        subject: 'EatWise Password Reset',
      }),
    );
  });

  it('should delegate verification email to the provider', async () => {
    await service.sendVerificationEmail({
      email: 'john@example.com',
      fullName: 'John Doe',
      otp: '654321',
    });

    expect(emailProvider.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [{ email: 'john@example.com', name: 'John Doe' }],
        subject: 'Verify your EatWise email',
      }),
    );
  });
});
