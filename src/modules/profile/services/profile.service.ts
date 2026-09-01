import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import { OtpService } from '../../auth/services/otp.service';
import { EmailService } from '../../email/email.service';
import { OtpType } from '../../../common/constants';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { normalizePhone, toProfileResponse } from '../utils/profile.util';

const EMAIL_CHANGE_OTP_EXPIRY_SECONDS = 600;

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private otpService: OtpService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.findActiveUser(userId);
    const cdnBaseUrl = this.getCdnBaseUrl();

    return {
      message: 'Profile fetched successfully',
      data: toProfileResponse(user, cdnBaseUrl),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findActiveUser(userId);
    const normalizedPhone = normalizePhone(dto.phone);

    if (normalizedPhone !== user.phoneNumber) {
      const existingPhone = await this.userModel.findOne({
        phoneNumber: normalizedPhone,
        _id: { $ne: user._id },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already in use');
      }
      user.phoneNumber = normalizedPhone;
      user.isPhoneVerified = false;
    }

    user.fullName = dto.name;

    if (dto.dateOfBirth !== undefined) user.dateOfBirth = dto.dateOfBirth;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.preferredLanguage !== undefined) user.preferredLanguage = dto.preferredLanguage;
    if (dto.dietPreference !== undefined) user.dietPreference = dto.dietPreference;
    if (dto.nutritionGoal !== undefined) user.nutritionGoal = dto.nutritionGoal;

    if (dto.avatarPresetId !== undefined) {
      user.avatarPresetId = dto.avatarPresetId;
      user.avatarUrl = undefined;
    }

    await user.save();

    return {
      message: 'Profile updated successfully.',
      data: {
        userId: user._id.toString(),
        name: user.fullName,
        updatedAt: user.updatedAt,
      },
    };
  }

  async uploadAvatar(userId: string, avatarUrl: string) {
    const user = await this.findActiveUser(userId);
    user.avatarUrl = avatarUrl;
    user.avatarPresetId = undefined;
    await user.save();

    return {
      message: 'Avatar uploaded successfully',
      data: { avatarUrl },
    };
  }

  async requestEmailChange(userId: string, newEmail: string) {
    const user = await this.findActiveUser(userId);
    const normalizedEmail = newEmail.toLowerCase();

    if (user.email === normalizedEmail) {
      throw new BadRequestException('New email must be different from current email');
    }

    const existing = await this.userModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const otp = await this.otpService.generateAndStore(
      normalizedEmail,
      OtpType.EMAIL_CHANGE,
      user._id.toString(),
      EMAIL_CHANGE_OTP_EXPIRY_SECONDS,
    );

    try {
      await this.emailService.sendEmailChangeEmail({
        email: normalizedEmail,
        fullName: user.fullName,
        otp,
      });
    } catch {
      throw new ServiceUnavailableException('Unable to send email change OTP');
    }

    return {
      message: `OTP sent to ${normalizedEmail}. Valid for 10 minutes.`,
      data: {},
    };
  }

  async verifyEmailChange(userId: string, newEmail: string, otp: string) {
    const user = await this.findActiveUser(userId);
    const normalizedEmail = newEmail.toLowerCase();

    if (user.email === normalizedEmail) {
      throw new BadRequestException('New email must be different from current email');
    }

    const existing = await this.userModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    await this.otpService.verify(normalizedEmail, OtpType.EMAIL_CHANGE, otp);

    user.email = normalizedEmail;
    user.isEmailVerified = true;
    await user.save();

    return {
      message: 'Email updated successfully.',
      data: {
        email: user.email,
        emailVerified: user.isEmailVerified,
      },
    };
  }

  private async findActiveUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private getCdnBaseUrl(): string {
    return this.configService.get<string>('avatar.cdnBaseUrl') || 'https://cdn.eatwise.app';
  }
}
