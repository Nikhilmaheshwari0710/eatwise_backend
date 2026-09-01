import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AffiliateClickSource, AffiliateDeviceType } from '../../../common/constants';

export type AffiliateClickDocument = AffiliateClick & Document;

@Schema({ timestamps: true })
export class AffiliateClick {
  @Prop({ type: Types.ObjectId, ref: 'AffiliateGeneratedLink' })
  linkId?: Types.ObjectId;

  @Prop({ required: true })
  shortLink: string;

  @Prop({ type: String, enum: AffiliateClickSource, default: AffiliateClickSource.OTHER })
  source: AffiliateClickSource;

  @Prop({ type: String, enum: AffiliateDeviceType, default: AffiliateDeviceType.WEB })
  deviceType: AffiliateDeviceType;
}

export const AffiliateClickSchema = SchemaFactory.createForClass(AffiliateClick);
