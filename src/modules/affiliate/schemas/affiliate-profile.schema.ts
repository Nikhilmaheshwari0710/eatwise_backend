import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AffiliateBankDetails = {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
};

export type AffiliateProfileDocument = AffiliateProfile & Document;

@Schema({ timestamps: true })
export class AffiliateProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ unique: true, sparse: true })
  affiliateId?: string;

  @Prop({ default: false })
  isEnrolled: boolean;

  @Prop()
  enrolledAt?: Date;

  @Prop({ default: false })
  agreedToTerms: boolean;

  @Prop()
  preferredPlatform?: string;

  @Prop({ type: Object })
  bankDetails?: AffiliateBankDetails;

  @Prop({ default: 0, min: 0 })
  totalClicks: number;

  @Prop({ default: 0, min: 0 })
  totalOrders: number;
}

export const AffiliateProfileSchema = SchemaFactory.createForClass(AffiliateProfile);
