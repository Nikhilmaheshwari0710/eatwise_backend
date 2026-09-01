import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  AffiliatePlatformId,
  AffiliateTransactionStatus,
} from '../../../common/constants';

export type AffiliateTransactionDocument = AffiliateTransaction & Document;

@Schema({ timestamps: true })
export class AffiliateTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AffiliatePlatformId, required: true })
  platformId: AffiliatePlatformId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({
    type: String,
    enum: AffiliateTransactionStatus,
    default: AffiliateTransactionStatus.PENDING,
  })
  status: AffiliateTransactionStatus;

  @Prop({ default: 0, min: 0 })
  ordersCount: number;

  @Prop({ default: 0, min: 0 })
  clicksCount: number;

  @Prop({ required: true })
  periodStart: Date;

  @Prop({ required: true })
  periodEnd: Date;

  @Prop()
  paidAt?: Date;
}

export const AffiliateTransactionSchema = SchemaFactory.createForClass(AffiliateTransaction);

AffiliateTransactionSchema.index({ userId: 1, createdAt: -1 });
