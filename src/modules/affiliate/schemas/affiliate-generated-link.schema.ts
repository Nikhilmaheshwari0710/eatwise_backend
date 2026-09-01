import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AffiliatePlatformId } from '../../../common/constants';

export type AffiliateGeneratedLinkDocument = AffiliateGeneratedLink & Document;

@Schema({ timestamps: true })
export class AffiliateGeneratedLink {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AffiliatePlatformId, required: true })
  platformId: AffiliatePlatformId;

  @Prop({ required: true, trim: true })
  affiliateTag: string;

  @Prop({ required: true })
  generatedLink: string;

  @Prop({ required: true })
  shortLink: string;

  @Prop({ required: true, unique: true })
  shortCode: string;

  @Prop()
  productUrl?: string;
}

export const AffiliateGeneratedLinkSchema = SchemaFactory.createForClass(AffiliateGeneratedLink);

AffiliateGeneratedLinkSchema.index({ shortLink: 1 });
