import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import { OtpService } from './otp.service';
import { GoogleAuthService } from './google-auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthProvider, OtpType, UserRole } from '../../../common/constants';
import { EmailService } from '../../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
    private googleAuthService: GoogleAuthService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Email or phone number is required');
    }

    if (dto.email && !dto.password) {
      throw new BadRequestException('Password is required for email registration');
    }

    if (dto.password && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirm password must match');
    }

    if (dto.email) {
      const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    if (dto.phoneNumber) {
      const existing = await this.userModel.findOne({ phoneNumber: dto.phoneNumber });
      if (existing) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const user = new this.userModel({
      fullName: dto.fullName,
      email: dto.email?.toLowerCase(),
      phoneNumber: dto.phoneNumber,
      authProvider: dto.phoneNumber && !dto.email ? AuthProvider.PHONE : AuthProvider.LOCAL,
      role: UserRole.PARENT,
    });

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    await user.save();

    if (user.email && user.authProvider === AuthProvider.LOCAL) {
      try {
        await this.sendVerificationEmail(user._id.toString());
      } catch (error) {
        await this.userModel.findByIdAndDelete(user._id);
        throw error;
      }
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'Registration successful',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Email or phone number is required');
    }

    const query: Record<string, string> = {};
    if (dto.email) query.email = dto.email.toLowerCase();
    else if (dto.phoneNumber) query.phoneNumber = dto.phoneNumber;

    const user = await this.userModel.findOne(query).select('+passwordHash');
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'Login successful',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async googleLogin(idToken: string) {
    const googleUser = await this.googleAuthService.verifyIdToken(idToken);

    let user = await this.userModel.findOne({
      $or: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.authProvider = AuthProvider.GOOGLE;
      }
      if (googleUser.emailVerified) {
        user.isEmailVerified = true;
      }
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await this.userModel.create({
        fullName: googleUser.fullName,
        email: googleUser.email,
        googleId: googleUser.googleId,
        authProvider: AuthProvider.GOOGLE,
        isEmailVerified: googleUser.emailVerified,
        role: UserRole.PARENT,
        lastLoginAt: new Date(),
      });
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'Google login successful',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async sendPhoneOtp(phoneNumber: string) {
    const otp = await this.otpService.generateAndStore(phoneNumber, OtpType.PHONE_LOGIN);

    const isDev = this.configService.get<string>('nodeEnv') === 'development';

    return {
      message: 'OTP sent successfully',
      data: {
        ...(isDev ? { otp } : {}),
      },
    };
  }

  async verifyPhoneOtp(phoneNumber: string, otp: string) {
    await this.otpService.verify(phoneNumber, OtpType.PHONE_LOGIN, otp);

    let user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      user = await this.userModel.create({
        phoneNumber,
        authProvider: AuthProvider.PHONE,
        isPhoneVerified: true,
        role: UserRole.PARENT,
        lastLoginAt: new Date(),
      });
    } else {
      user.isPhoneVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'Phone verified successfully',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async forgotPassword(email?: string, phoneNumber?: string) {
    if (!email && !phoneNumber) {
      throw new BadRequestException('Email or phone number is required');
    }

    if (email) {
      const user = await this.userModel.findOne({ email: email.toLowerCase() });
      if (user) {
        const otp = await this.otpService.generateAndStore(email.toLowerCase(), OtpType.PASSWORD_RESET_EMAIL, user._id.toString());
        try {
          await this.emailService.sendPasswordResetEmail({
            email: user.email,
            fullName: user.fullName,
            otp,
          });
        } catch {
          throw new ServiceUnavailableException('Unable to process password reset request');
        }
      }
      return {
        message: 'If an account exists for this email, password reset instructions have been sent.',
        data: {},
      };
    }

    if (phoneNumber) {
      const user = await this.userModel.findOne({ phoneNumber });
      if (user) {
        const otp = await this.otpService.generateAndStore(phoneNumber, OtpType.PASSWORD_RESET_PHONE, user._id.toString());
        const isDev = this.configService.get<string>('nodeEnv') === 'development';
        return { message: 'Reset OTP sent', data: { ...(isDev ? { otp } : {}) } };
      }
      return { message: 'If the phone number exists, a reset OTP has been sent', data: {} };
    }

    return { message: 'Request processed', data: {} };
  }

  async verifyResetOtp(identifier: string, otp: string, type: OtpType) {
    await this.otpService.verify(identifier, type, otp);
    const user = await this.userModel.findOne(
      type === OtpType.PASSWORD_RESET_EMAIL ? { email: identifier } : { phoneNumber: identifier },
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.otpService.storeCode(
      identifier,
      OtpType.PASSWORD_RESET_SESSION,
      resetToken,
      user._id.toString(),
      900,
      false,
    );

    return {
      message: 'OTP verified, use reset token to set new password',
      data: { resetToken },
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const resetSession = await this.otpService.consumeMatchingToken(
      OtpType.PASSWORD_RESET_SESSION,
      resetToken,
    );
    if (!resetSession) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const targetUser = await this.userModel.findById(resetSession.userId).select('+passwordHash');
    if (!targetUser) {
      throw new BadRequestException('User not found');
    }

    targetUser.passwordHash = await bcrypt.hash(newPassword, 12);
    targetUser.refreshTokenHash = '';
    await targetUser.save();

    return { message: 'Password reset successful', data: {} };
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.email) {
      throw new BadRequestException('Email verification is not available for this account');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified', data: {} };
    }

    const otp = await this.otpService.generateAndStore(
      user.email.toLowerCase(),
      OtpType.EMAIL_VERIFICATION,
      user._id.toString(),
    );

    try {
      await this.emailService.sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        otp,
      });
    } catch {
      throw new ServiceUnavailableException('Unable to send verification email');
    }

    return { message: 'Verification email sent', data: {} };
  }

  async verifyEmail(email: string, otp: string) {
    const normalizedEmail = email.toLowerCase();
    await this.otpService.verify(normalizedEmail, OtpType.EMAIL_VERIFICATION, otp);

    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isEmailVerified = true;
    await user.save();

    return {
      message: 'Email verified successfully',
      data: {
        user: this.sanitizeUser(user),
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userModel.findById(payload.sub).select('+refreshTokenHash');
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

      return {
        message: 'Tokens refreshed',
        data: tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: '' });
    return { message: 'Logged out successfully', data: {} };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException();
    return { message: 'User profile', data: { user: this.sanitizeUser(user) } };
  }

  private async generateTokens(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email || '' };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') as any,
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }

  private sanitizeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
