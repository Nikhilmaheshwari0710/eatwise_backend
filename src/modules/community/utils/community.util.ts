import { CommunityTab, PostCategory } from '../../../common/constants';
import { formatTimeAgo } from '../../notifications/config/notification.config';
import { CATEGORY_META, TAB_TO_CATEGORY } from '../config/community.config';
import { CommunityPostDocument } from '../schemas/community-post.schema';
import { PostCommentDocument } from '../schemas/post-comment.schema';

export function resolveCategoryFilter(
  tab?: CommunityTab,
  category?: PostCategory,
): PostCategory | undefined {
  if (category) return category;
  if (tab && tab !== CommunityTab.FOR_YOU) {
    return TAB_TO_CATEGORY[tab];
  }
  return undefined;
}

export function resolvePostImageUrl(
  imageUrl: string | undefined,
  cdnBaseUrl: string,
): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const base = cdnBaseUrl.replace(/\/$/, '');
  return `${base}/${imageUrl.replace(/^\//, '')}`;
}

export function toPostResponse(
  post: CommunityPostDocument,
  isLikedByMe: boolean,
  cdnBaseUrl: string,
) {
  const meta = CATEGORY_META[post.category];

  return {
    postId: post._id.toString(),
    authorName: post.authorName,
    authorAvatarUrl: post.authorAvatarUrl ?? null,
    authorAvatarPresetId: post.authorAvatarPresetId ?? null,
    timeAgo: post.createdAt ? formatTimeAgo(post.createdAt) : null,
    createdAt: post.createdAt,
    category: post.category,
    categoryColor: meta.color,
    title: post.title,
    body: post.body,
    imageUrl: resolvePostImageUrl(post.imageUrl, cdnBaseUrl),
    likesCount: post.likesCount,
    isLikedByMe,
    commentsCount: post.commentsCount,
    actionText: meta.actionText,
  };
}

export function toCommentResponse(comment: PostCommentDocument) {
  return {
    id: comment._id.toString(),
    commentId: comment._id.toString(),
    authorName: comment.authorName,
    authorAvatarUrl: comment.authorAvatarUrl ?? null,
    authorAvatarPresetId: comment.authorAvatarPresetId ?? null,
    text: comment.text,
    timeAgo: comment.createdAt ? formatTimeAgo(comment.createdAt) : null,
    createdAt: comment.createdAt,
    likesCount: comment.likesCount,
  };
}

export function buildPagination(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
