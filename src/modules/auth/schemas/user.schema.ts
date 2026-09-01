import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  AuthProvider,
  AvatarPresetId,
  DietPreference,
  Gender,
  PreferredLanguage,
  UserRole,
} from '../../../common/constants';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ trim: true })
  fullName: string;

  @Prop({ lowercase: true, trim: true, sparse: true, unique: true })
  email: string;

  @Prop({ trim: true, sparse: true, unique: true })
  phoneNumber?: string;

  @Prop({ select: false })
  passwordHash: string;

  @Prop({ type: String, enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Prop({ sparse: true, unique: true })
  googleId?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.PARENT })
  role: UserRole;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt: Date;

  @Prop({ select: false })
  refreshTokenHash: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: String, enum: AvatarPresetId })
  avatarPresetId?: AvatarPresetId;

  @Prop()
  dateOfBirth?: string;

  @Prop({ type: String, enum: Gender })
  gender?: Gender;

  @Prop({ type: String, enum: PreferredLanguage })
  preferredLanguage?: PreferredLanguage;

  @Prop({ type: String, enum: DietPreference })
  dietPreference?: DietPreference;

  @Prop({ maxlength: 300 })
  nutritionGoal?: string;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  deletionReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

