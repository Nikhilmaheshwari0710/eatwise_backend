import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostCommentDocument = PostComment & Document;

@Schema({ timestamps: true })
export class PostComment {
  @Prop({ type: Types.ObjectId, ref: 'CommunityPost', required: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  authorName: string;

  @Prop()
  authorAvatarUrl?: string;

  @Prop()
  authorAvatarPresetId?: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  text: string;

  @Prop({ default: 0, min: 0 })
  likesCount: number;
}

export const PostCommentSchema = SchemaFactory.createForClass(PostComment);

PostCommentSchema.index({ postId: 1, createdAt: -1 });
