import { CommunityTab, PostCategory } from '../../../common/constants';

export interface CategoryMeta {
  color: string;
  actionText: string;
}

export const CATEGORY_META: Record<PostCategory, CategoryMeta> = {
  [PostCategory.NUTRITION]: { color: '#10B981', actionText: 'View Discussion' },
  [PostCategory.RECIPE]: { color: '#7C3AED', actionText: 'View Recipe' },
  [PostCategory.TIPS]: { color: '#3B82F6', actionText: 'View Discussion' },
  [PostCategory.PARENTING]: { color: '#F59E0B', actionText: 'View Discussion' },
  [PostCategory.GENERAL]: { color: '#6B7280', actionText: 'View Discussion' },
};

export const TAB_TO_CATEGORY: Partial<Record<CommunityTab, PostCategory>> = {
  [CommunityTab.NUTRITION]: PostCategory.NUTRITION,
  [CommunityTab.RECIPES]: PostCategory.RECIPE,
  [CommunityTab.TIPS]: PostCategory.TIPS,
};

export const COMMUNITY_TOPICS = [
  'Sugar Free',
  'Picky Eater',
  'School Lunch',
  'Baby Food',
  'Healthy Snacks',
] as const;
