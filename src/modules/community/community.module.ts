import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { CommunityPost, CommunityPostSchema } from './schemas/community-post.schema';
import { PostLike, PostLikeSchema } from './schemas/post-like.schema';
import { PostComment, PostCommentSchema } from './schemas/post-comment.schema';
import { CommunityTopic, CommunityTopicSchema } from './schemas/community-topic.schema';
import { CommunityController } from './controllers/community.controller';
import { CommunityService } from './services/community.service';
import { PostImageService } from './services/post-image.service';
import { CommunitySeedService } from './services/community-seed.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CommunityPost.name, schema: CommunityPostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: PostComment.name, schema: PostCommentSchema },
      { name: CommunityTopic.name, schema: CommunityTopicSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, PostImageService, CommunitySeedService],
  exports: [CommunityService, CommunitySeedService],
})
export class CommunityModule {}
