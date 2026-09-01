import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CommunityPost, CommunityPostDocument } from '../schemas/community-post.schema';
import { PostComment, PostCommentDocument } from '../schemas/post-comment.schema';
import { CommunityTopic, CommunityTopicDocument } from '../schemas/community-topic.schema';
import { COMMUNITY_TOPICS } from '../config/community.config';
import {
  COMMUNITY_SEED_COMMENTS,
  COMMUNITY_SEED_POSTS,
} from '../data/community-seed.data';

@Injectable()
export class CommunitySeedService implements OnModuleInit {
  private readonly logger = new Logger(CommunitySeedService.name);
  private readonly seedAuthorId = new Types.ObjectId();

  constructor(
    @InjectModel(CommunityPost.name)
    private postModel: Model<CommunityPostDocument>,
    @InjectModel(PostComment.name)
    private commentModel: Model<PostCommentDocument>,
    @InjectModel(CommunityTopic.name)
    private topicModel: Model<CommunityTopicDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.postModel.countDocuments();
    if (count === 0) {
      await this.seed();
    }
  }

  async seed() {
    for (const name of COMMUNITY_TOPICS) {
      await this.topicModel.findOneAndUpdate(
        { name },
        { name },
        { upsert: true, returnDocument: 'after' },
      );
    }

    const cdnBaseUrl =
      this.configService.get<string>('community.cdnBaseUrl') ||
      'http://localhost:3000/uploads';
    const base = cdnBaseUrl.replace(/\/$/, '');

    const createdPosts: CommunityPostDocument[] = [];

    for (const item of COMMUNITY_SEED_POSTS) {
      const createdAt = new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000);

      let authorAvatarUrl = item.authorAvatarUrl;
      if (!authorAvatarUrl && item.authorAvatarPresetId) {
        authorAvatarUrl = `${base}/avatars/${item.authorAvatarPresetId}.png`;
      }

      const post = await this.postModel.create({
        authorId: this.seedAuthorId,
        authorName: item.authorName,
        authorAvatarUrl,
        authorAvatarPresetId: item.authorAvatarPresetId,
        category: item.category,
        title: item.title,
        body: item.body,
        imageUrl: item.imageUrl,
        topics: item.topics,
        likesCount: item.likesCount,
        commentsCount: item.commentsCount,
        createdAt,
        updatedAt: createdAt,
      });

      createdPosts.push(post);
    }

    for (const comment of COMMUNITY_SEED_COMMENTS) {
      const post = createdPosts[comment.postIndex];
      if (!post) continue;

      const createdAt = new Date(Date.now() - comment.hoursAgo * 60 * 60 * 1000);

      await this.commentModel.create({
        postId: post._id,
        authorId: this.seedAuthorId,
        authorName: comment.authorName,
        text: comment.text,
        likesCount: comment.likesCount,
        createdAt,
        updatedAt: createdAt,
      });
    }

    this.logger.log(
      `Seeded ${COMMUNITY_SEED_POSTS.length} posts, ${COMMUNITY_TOPICS.length} topics`,
    );
  }
}
