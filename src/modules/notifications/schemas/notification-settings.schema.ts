import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationSettingsDocument = NotificationSettings & Document;

@Schema({ timestamps: true })
export class NotificationSettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Map, of: Boolean, default: {} })
  preferences: Map<string, boolean>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSettingsSchema = SchemaFactory.createForClass(NotificationSettings);
