import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CommunityTab, PostCategory } from '../../../common/constants';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import { resolveAvatarUrl } from '../../profile/utils/profile.util';
import { CommunityPost, CommunityPostDocument } from '../schemas/community-post.schema';
import { PostLike, PostLikeDocument } from '../schemas/post-like.schema';
import { PostComment, PostCommentDocument } from '../schemas/post-comment.schema';
import { CommunityTopic, CommunityTopicDocument } from '../schemas/community-topic.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import {
  buildPagination,
  resolveCategoryFilter,
  toCommentResponse,
  toPostResponse,
} from '../utils/community.util';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(CommunityPost.name)
    private postModel: Model<CommunityPostDocument>,
    @InjectModel(PostLike.name) private likeModel: Model<PostLikeDocument>,
    @InjectModel(PostComment.name)
    private commentModel: Model<PostCommentDocument>,
    @InjectModel(CommunityTopic.name)
    private topicModel: Model<CommunityTopicDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async getPosts(
    userId: string,
    tab: CommunityTab = CommunityTab.FOR_YOU,
    category?: PostCategory,
    page = 1,
    limit = 10,
  ) {
    const filter = this.buildPostsFilter(tab, category);
    return this.fetchPosts(userId, filter, page, limit);
  }

  async searchPosts(userId: string, query: string, page = 1, limit = 10) {
    const filter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { body: { $regex: query, $options: 'i' } },
      ],
    };
    return this.fetchPosts(userId, filter, page, limit);
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.findPostOrThrow(postId);
    const userObjectId = new Types.ObjectId(userId);
    const postObjectId = post._id;

    const existingLike = await this.likeModel.findOne({
      userId: userObjectId,
      postId: postObjectId,
    });

    let isLiked: boolean;
    if (existingLike) {
      await existingLike.deleteOne();
      post.likesCount = Math.max(0, post.likesCount - 1);
      isLiked = false;
    } else {
      await this.likeModel.create({ userId: userObjectId, postId: postObjectId });
      post.likesCount += 1;
      isLiked = true;
    }

    await post.save();

    return {
      message: isLiked ? 'Post liked.' : 'Post unliked.',
      data: {
        postId: post._id.toString(),
        isLiked,
        likesCount: post.likesCount,
      },
    };
  }

  async getComments(postId: string, page = 1, limit = 20) {
    await this.findPostOrThrow(postId);

    const postObjectId = new Types.ObjectId(postId);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.commentModel
        .find({ postId: postObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.commentModel.countDocuments({ postId: postObjectId }),
    ]);

    return {
      message: 'Comments fetched successfully.',
      data: {
        comments: comments.map(toCommentResponse),
        pagination: buildPagination(total, page, limit),
      },
    };
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.findPostOrThrow(postId);
    const user = await this.getActiveUser(userId);
    const cdnBaseUrl = this.getCdnBaseUrl();

    const comment = await this.commentModel.create({
      postId: post._id,
      authorId: user._id,
      authorName: user.fullName,
      authorAvatarUrl: resolveAvatarUrl(user, cdnBaseUrl),
      authorAvatarPresetId: user.avatarPresetId,
      text: dto.text.trim(),
    });

    post.commentsCount += 1;
    await post.save();

    return {
      message: 'Comment added.',
      data: toCommentResponse(comment),
    };
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const user = await this.getActiveUser(userId);
    const cdnBaseUrl = this.getCdnBaseUrl();

    const post = await this.postModel.create({
      authorId: user._id,
      authorName: user.fullName,
      authorAvatarUrl: resolveAvatarUrl(user, cdnBaseUrl),
      authorAvatarPresetId: user.avatarPresetId,
      category: dto.category,
      title: dto.title.trim(),
      body: dto.body.trim(),
      imageUrl: dto.imageUrl,
    });

    return {
      message: 'Post created successfully.',
      data: {
        postId: post._id.toString(),
        createdAt: post.createdAt,
      },
    };
  }

  async getTopics() {
    const topics = await this.topicModel.find().sort({ name: 1 });

    const topicsWithCounts = await Promise.all(
      topics.map(async (topic) => {
        const postCount = await this.postModel.countDocuments({
          topics: topic.name,
        });
        return {
          id: topic._id.toString(),
          name: topic.name,
          postCount,
        };
      }),
    );

    return {
      message: 'Topics fetched successfully.',
      data: { topics: topicsWithCounts },
    };
  }

  private async fetchPosts(
    userId: string,
    filter: Record<string, unknown>,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const cdnBaseUrl = this.getCdnBaseUrl();

    const [posts, total] = await Promise.all([
      this.postModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.postModel.countDocuments(filter),
    ]);

    const likedPostIds = await this.getLikedPostIds(
      userId,
      posts.map((post) => post._id),
    );

    return {
      message: 'Posts fetched successfully.',
      data: {
        posts: posts.map((post) =>
          toPostResponse(post, likedPostIds.has(post._id.toString()), cdnBaseUrl),
        ),
        pagination: buildPagination(total, page, limit),
      },
    };
  }

  private buildPostsFilter(tab: CommunityTab, category?: PostCategory) {
    const resolvedCategory = resolveCategoryFilter(tab, category);
    if (!resolvedCategory) return {};
    return { category: resolvedCategory };
  }

  private async getLikedPostIds(userId: string, postIds: Types.ObjectId[]) {
    if (!postIds.length) return new Set<string>();

    const likes = await this.likeModel.find({
      userId: new Types.ObjectId(userId),
      postId: { $in: postIds },
    });

    return new Set(likes.map((like) => like.postId.toString()));
  }

  private async findPostOrThrow(postId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new NotFoundException('Post not found');
    }

    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  private async getActiveUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private getCdnBaseUrl() {
    return (
      this.configService.get<string>('community.cdnBaseUrl') ||
      'http://localhost:3000/uploads'
    );
  }
}

