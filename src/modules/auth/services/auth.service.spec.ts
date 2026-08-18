import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../schemas/user.schema';
import { OtpService } from './otp.service';
import { GoogleAuthService } from './google-auth.service';
import { EmailService } from '../../email/email.service';
import { OtpType } from '../../../common/constants';

describe('AuthService email flows', () => {
  let service: AuthService;
  const userModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn().mockReturnValue('token'),
    verify: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'jwt.accessSecret': 'access',
        'jwt.accessExpiresIn': '15m',
        'jwt.refreshSecret': 'refresh',
        'jwt.refreshExpiresIn': '7d',
        nodeEnv: 'test',
      };

      return values[key];
    }),
  };

  const otpService = {
    generateAndStore: jest.fn().mockResolvedValue('123456'),
    verify: jest.fn(),
    storeCode: jest.fn(),
    consumeMatchingToken: jest.fn(),
  };

  const googleAuthService = {
    verifyIdToken: jest.fn(),
  };

  const emailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: OtpService, useValue: otpService },
        { provide: GoogleAuthService, useValue: googleAuthService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should send verification email for authenticated user', async () => {
    userModel.findById.mockResolvedValue({
      _id: { toString: () => 'user-id' },
      email: 'john@example.com',
      fullName: 'John Doe',
      isEmailVerified: false,
    });

    const result = await service.sendVerificationEmail('user-id');

    expect(otpService.generateAndStore).toHaveBeenCalledWith(
      'john@example.com',
      OtpType.EMAIL_VERIFICATION,
      'user-id',
    );
    expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    expect(result.message).toBe('Verification email sent');
  });

  it('should return generic forgot-password success when provider succeeds', async () => {
    userModel.findOne.mockResolvedValue({
      _id: { toString: () => 'user-id' },
      email: 'john@example.com',
      fullName: 'John Doe',
    });

    const result = await service.forgotPassword('john@example.com');

    expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    expect(result.message).toContain('If an account exists for this email');
  });

  it('should fail cleanly when email provider fails during forgot-password', async () => {
    userModel.findOne.mockResolvedValue({
      _id: { toString: () => 'user-id' },
      email: 'john@example.com',
      fullName: 'John Doe',
    });
    emailService.sendPasswordResetEmail.mockRejectedValueOnce(new Error('provider failed'));

    await expect(service.forgotPassword('john@example.com')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
