import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AffiliatePlatformId } from '../../../common/constants';

export type AffiliatePlatformConnectionDocument = AffiliatePlatformConnection & Document;

@Schema({ timestamps: true })
export class AffiliatePlatformConnection {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AffiliatePlatformId, required: true })
  platformId: AffiliatePlatformId;

  @Prop({ required: true, trim: true })
  affiliateTag: string;

  @Prop({ default: true })
  isVerified: boolean;

  @Prop({ default: 0, min: 0 })
  totalEarned: number;

  @Prop({ default: 0, min: 0 })
  totalClicks: number;
}

export const AffiliatePlatformConnectionSchema = SchemaFactory.createForClass(
  AffiliatePlatformConnection,
);

AffiliatePlatformConnectionSchema.index({ userId: 1, platformId: 1 }, { unique: true });
