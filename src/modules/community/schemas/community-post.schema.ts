import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PostCategory } from '../../../common/constants';

export type CommunityPostDocument = CommunityPost & Document;

@Schema({ timestamps: true })
export class CommunityPost {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  authorName: string;

  @Prop()
  authorAvatarUrl?: string;

  @Prop()
  authorAvatarPresetId?: string;

  @Prop({ type: String, enum: PostCategory, required: true })
  category: PostCategory;

  @Prop({ required: true, trim: true, maxlength: 150 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  body: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [String], default: [] })
  topics: string[];

  @Prop({ default: 0, min: 0 })
  likesCount: number;

  @Prop({ default: 0, min: 0 })
  commentsCount: number;
}

export const CommunityPostSchema = SchemaFactory.createForClass(CommunityPost);

CommunityPostSchema.index({ category: 1, createdAt: -1 });
CommunityPostSchema.index({ title: 'text', body: 'text' });
CommunityPostSchema.index({ topics: 1 });
