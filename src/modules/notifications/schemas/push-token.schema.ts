import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PushPlatform } from '../../../common/constants';

export type PushTokenDocument = PushToken & Document;

@Schema({ timestamps: true })
export class PushToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ type: String, enum: PushPlatform, required: true })
  platform: PushPlatform;

  @Prop({ required: true })
  deviceId: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PushTokenSchema = SchemaFactory.createForClass(PushToken);

PushTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
