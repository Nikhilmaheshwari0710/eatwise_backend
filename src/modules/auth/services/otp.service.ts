import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Otp, OtpDocument } from '../schemas/otp.schema';
import { OtpType } from '../../../common/constants';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private configService: ConfigService,
  ) {}

  async generateAndStore(
    identifier: string,
    type: OtpType,
    userId?: string,
    expirySeconds?: number,
  ): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    await this.storeCode(identifier, type, otp, userId, expirySeconds);
    return otp;
  }

  async storeCode(
    identifier: string,
    type: OtpType,
    code: string,
    userId?: string,
    expirySeconds?: number,
    enforceCooldown = true,
  ): Promise<void> {
    const cooldown = this.configService.get<number>('otp.resendCooldownSeconds') || 60;
    if (enforceCooldown) {
      const recent = await this.otpModel.findOne({
        identifier,
        type,
        isUsed: false,
        createdAt: { $gte: new Date(Date.now() - cooldown * 1000) },
      });

      if (recent) {
        throw new BadRequestException('Please wait before requesting another OTP');
      }
    }

    await this.otpModel.updateMany(
      { identifier, type, isUsed: false },
      { isUsed: true },
    );

    const hashedCode = await bcrypt.hash(code, 10);
    const resolvedExpirySeconds =
      expirySeconds || this.configService.get<number>('otp.expirySeconds') || 300;
    const maxAttempts = this.configService.get<number>('otp.maxAttempts') || 5;

    await this.otpModel.create({
      userId: userId || undefined,
      identifier,
      type,
      hashedCode,
      expiresAt: new Date(Date.now() + resolvedExpirySeconds * 1000),
      maxAttempts,
    });
  }

  async verify(identifier: string, type: OtpType, code: string): Promise<boolean> {
    const otpRecord = await this.otpModel.findOne({
      identifier,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      throw new BadRequestException('Maximum attempts exceeded');
    }

    otpRecord.attempts += 1;
    await otpRecord.save();

    const isValid = await bcrypt.compare(code, otpRecord.hashedCode);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    otpRecord.isUsed = true;
    await otpRecord.save();
    return true;
  }

  async consumeMatchingToken(type: OtpType, code: string): Promise<OtpDocument | null> {
    const records = await this.otpModel
      .find({
        type,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 });

    for (const record of records) {
      const isValid = await bcrypt.compare(code, record.hashedCode);
      if (isValid) {
        record.isUsed = true;
        await record.save();
        return record;
      }
    }

    return null;
  }

  async invalidateAll(identifier: string, type: OtpType): Promise<void> {
    await this.otpModel.updateMany(
      { identifier, type, isUsed: false },
      { isUsed: true },
    );
  }
}
