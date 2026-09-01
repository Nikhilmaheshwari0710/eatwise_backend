import { PostCategory } from '../../../common/constants';

export interface CommunitySeedPost {
  authorName: string;
  authorAvatarPresetId?: string;
  authorAvatarUrl?: string;
  category: PostCategory;
  title: string;
  body: string;
  imageUrl?: string;
  topics: string[];
  likesCount: number;
  commentsCount: number;
  hoursAgo: number;
}

export const COMMUNITY_SEED_POSTS: CommunitySeedPost[] = [
  {
    authorName: 'Ritika Sharma',
    authorAvatarPresetId: 'ritika',
    category: PostCategory.NUTRITION,
    title: 'Is whole wheat bread really healthier than white bread?',
    body: 'I have been trying to make better choices for my family. What is your take on this?',
    topics: ['Healthy Snacks', 'Sugar Free'],
    likesCount: 78,
    commentsCount: 32,
    hoursAgo: 2,
  },
  {
    authorName: 'Priya Menon',
    category: PostCategory.RECIPE,
    title: 'Healthy oats breakfast bowl recipe my kids love!',
    body: 'Mix rolled oats with banana, almond milk and chia seeds. No sugar needed!',
    imageUrl: 'https://cdn.eatwise.app/posts/oats_bowl.jpg',
    topics: ['Healthy Snacks', 'School Lunch'],
    likesCount: 124,
    commentsCount: 45,
    hoursAgo: 5,
  },
  {
    authorName: 'Sneha Kapoor',
    category: PostCategory.TIPS,
    title: 'How to get picky eaters to try new vegetables',
    body: 'We started with small portions mixed into familiar dishes. Game changer for us!',
    topics: ['Picky Eater', 'Baby Food'],
    likesCount: 56,
    commentsCount: 18,
    hoursAgo: 8,
  },
  {
    authorName: 'Ananya Patel',
    category: PostCategory.PARENTING,
    title: 'School lunch box ideas for busy mornings',
    body: 'Sharing our weekly rotation of easy, nutritious lunch boxes that pack in 10 minutes.',
    topics: ['School Lunch', 'Healthy Snacks'],
    likesCount: 91,
    commentsCount: 27,
    hoursAgo: 12,
  },
  {
    authorName: 'Meera Joshi',
    category: PostCategory.NUTRITION,
    title: 'Best protein sources for vegetarian toddlers',
    body: 'Looking for high-protein vegetarian foods for my 2-year-old. Dal, paneer, what else?',
    topics: ['Baby Food', 'Picky Eater'],
    likesCount: 43,
    commentsCount: 15,
    hoursAgo: 24,
  },
  {
    authorName: 'Kavita Reddy',
    category: PostCategory.RECIPE,
    title: 'Sugar-free date and nut energy balls',
    body: 'Blend dates, almonds, and a pinch of cinnamon. Roll into balls. Kids love them!',
    topics: ['Sugar Free', 'Healthy Snacks'],
    likesCount: 102,
    commentsCount: 38,
    hoursAgo: 30,
  },
];

export const COMMUNITY_SEED_COMMENTS = [
  {
    postIndex: 0,
    authorName: 'Sneha Kapoor',
    text: 'Whole wheat is definitely better due to higher fiber content!',
    likesCount: 5,
    hoursAgo: 1,
  },
  {
    postIndex: 0,
    authorName: 'Ananya Patel',
    text: 'We switched to multigrain bread last month and noticed better digestion.',
    likesCount: 3,
    hoursAgo: 3,
  },
];
