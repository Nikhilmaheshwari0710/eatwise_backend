import { CommunityTab, PostCategory } from '../../../common/constants';
import {
  resolveCategoryFilter,
  resolvePostImageUrl,
  toPostResponse,
} from './community.util';

describe('community.util', () => {
  describe('resolveCategoryFilter', () => {
    it('returns explicit category when provided', () => {
      expect(resolveCategoryFilter(CommunityTab.FOR_YOU, PostCategory.PARENTING)).toBe(
        PostCategory.PARENTING,
      );
    });

    it('maps nutrition tab to Nutrition category', () => {
      expect(resolveCategoryFilter(CommunityTab.NUTRITION)).toBe(PostCategory.NUTRITION);
    });

    it('returns undefined for for_you tab without category', () => {
      expect(resolveCategoryFilter(CommunityTab.FOR_YOU)).toBeUndefined();
    });
  });

  describe('resolvePostImageUrl', () => {
    it('returns null when imageUrl is missing', () => {
      expect(resolvePostImageUrl(undefined, 'http://localhost:3000/uploads')).toBeNull();
    });

    it('returns absolute URLs unchanged', () => {
      expect(
        resolvePostImageUrl('https://cdn.eatwise.app/posts/oats.jpg', 'http://localhost:3000/uploads'),
      ).toBe('https://cdn.eatwise.app/posts/oats.jpg');
    });
  });

  describe('toPostResponse', () => {
    it('maps recipe posts to View Recipe action text', () => {
      const post = {
        _id: { toString: () => 'post-1' },
        authorName: 'Priya Menon',
        authorAvatarUrl: null,
        authorAvatarPresetId: null,
        createdAt: new Date('2025-09-01T05:00:00Z'),
        category: PostCategory.RECIPE,
        title: 'Healthy oats breakfast bowl',
        body: 'Mix rolled oats with banana.',
        imageUrl: 'https://cdn.eatwise.app/posts/oats_bowl.jpg',
        likesCount: 124,
        commentsCount: 45,
      } as any;

      const response = toPostResponse(post, true, 'http://localhost:3000/uploads');

      expect(response.postId).toBe('post-1');
      expect(response.categoryColor).toBe('#7C3AED');
      expect(response.actionText).toBe('View Recipe');
      expect(response.isLikedByMe).toBe(true);
    });
  });
});
