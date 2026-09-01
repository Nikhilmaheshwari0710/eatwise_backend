import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '../../auth/schemas/user.schema';
import { OtpService } from '../../auth/services/otp.service';
import { EmailService } from '../../email/email.service';
import {
  AvatarPresetId,
  DietPreference,
  Gender,
  PreferredLanguage,
} from '../../../common/constants';

describe('ProfileService', () => {
  let service: ProfileService;
  const userModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  const otpService = {
    generateAndStore: jest.fn().mockResolvedValue('123456'),
    verify: jest.fn(),
  };

  const emailService = {
    sendEmailChangeEmail: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'avatar.cdnBaseUrl') return 'https://cdn.eatwise.app';
      return undefined;
    }),
  };

  const baseUser = {
    _id: { toString: () => 'user-id-1' },
    fullName: 'Ritika Sharma',
    email: 'ritika.sharma@gmail.com',
    phoneNumber: '+919876543210',
    isEmailVerified: true,
    isPhoneVerified: false,
    isActive: true,
    avatarPresetId: AvatarPresetId.RITIKA,
    dateOfBirth: '1994-04-15',
    gender: Gender.FEMALE,
    preferredLanguage: PreferredLanguage.ENGLISH_INDIA,
    dietPreference: DietPreference.VEGETARIAN,
    nutritionGoal: 'Focusing on wholesome sugar-free meals for my children.',
    isPremium: false,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2025-09-01T08:20:00Z'),
    save: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: OtpService, useValue: otpService },
        { provide: EmailService, useValue: emailService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(ProfileService);
    jest.clearAllMocks();
    baseUser.save.mockResolvedValue(baseUser);
    userModel.findById.mockResolvedValue(baseUser);
  });

  it('should return profile response', async () => {
    const result = await service.getProfile('user-id-1');

    expect(result.data.userId).toBe('user-id-1');
    expect(result.data.name).toBe('Ritika Sharma');
    expect(result.data.phone).toBe('+91 98765 43210');
    expect(result.data.avatarUrl).toBe('https://cdn.eatwise.app/avatars/ritika.png');
  });

  it('should update profile fields', async () => {
    userModel.findOne.mockResolvedValue(null);

    const result = await service.updateProfile('user-id-1', {
      name: 'Ritika Sharma Updated',
      phone: '+91 98765 43210',
      gender: Gender.FEMALE,
      avatarPresetId: AvatarPresetId.ARJUN,
    });

    expect(result.message).toBe('Profile updated successfully.');
    expect(result.data.name).toBe('Ritika Sharma Updated');
    expect(baseUser.save).toHaveBeenCalled();
  });

  it('should reject duplicate phone number', async () => {
    userModel.findOne.mockResolvedValue({ _id: 'other-user' });

    await expect(
      service.updateProfile('user-id-1', {
        name: 'Ritika Sharma',
        phone: '+91 99999 99999',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should request email change OTP', async () => {
    userModel.findOne.mockResolvedValue(null);

    const result = await service.requestEmailChange('user-id-1', 'new.email@gmail.com');

    expect(result.message).toContain('OTP sent to new.email@gmail.com');
    expect(emailService.sendEmailChangeEmail).toHaveBeenCalled();
  });

  it('should verify email change', async () => {
    userModel.findOne.mockResolvedValue(null);

    const result = await service.verifyEmailChange('user-id-1', 'new.email@gmail.com', '123456');

    expect(result.message).toBe('Email updated successfully.');
    expect(result.data.email).toBe('new.email@gmail.com');
    expect(result.data.emailVerified).toBe(true);
  });
});
