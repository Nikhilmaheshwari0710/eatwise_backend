import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommunityTopicDocument = CommunityTopic & Document;

@Schema({ timestamps: true })
export class CommunityTopic {
  @Prop({ required: true, unique: true, trim: true })
  name: string;
}

export const CommunityTopicSchema = SchemaFactory.createForClass(CommunityTopic);
