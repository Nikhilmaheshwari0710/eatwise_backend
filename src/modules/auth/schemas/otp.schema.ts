import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OtpType } from '../../../common/constants';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  identifier: string;

  @Prop({ type: String, enum: OtpType, required: true })
  type: OtpType;

  @Prop({ required: true })
  hashedCode: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: 5 })
  maxAttempts: number;

  @Prop({ default: false })
  isUsed: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ identifier: 1, type: 1 });
