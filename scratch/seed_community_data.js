const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/Users/Darshan/eatwise_backend/.env' });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eatwise';

const CommunityTopicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  postCount: { type: Number, default: 0 },
  isPopular: { type: Boolean, default: false },
}, { timestamps: true });

const CommunityPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String },
  topics: { type: [String], default: [] },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

const PostCommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

async function runSeed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  const TopicModel = mongoose.model('CommunityTopic', CommunityTopicSchema);
  const PostModel = mongoose.model('CommunityPost', CommunityPostSchema);
  const CommentModel = mongoose.model('PostComment', PostCommentSchema);
  const UserModel = mongoose.model('User', new mongoose.Schema({ fullName: String, email: String }));

  const userDoc = await UserModel.findOne({ email: 'dp150875@gmail.com' });
  const userId = userDoc ? userDoc._id : new mongoose.Types.ObjectId();

  // 1. Seed Topics
  await TopicModel.deleteMany({});
  const topics = await TopicModel.create([
    { name: 'Toddler Nutrition', postCount: 42, isPopular: true },
    { name: 'Picky Eaters', postCount: 29, isPopular: true },
    { name: 'Sugar Warnings', postCount: 18, isPopular: true },
    { name: 'Ask Pediatrician', postCount: 56, isPopular: true },
    { name: 'School Tiffin Recipes', postCount: 35, isPopular: false },
  ]);
  console.log('✅ Seeded 5 Community Topics');

  // 2. Seed Posts
  await PostModel.deleteMany({});
  const posts = await PostModel.create([
    {
      authorId: userId,
      authorName: 'Ritika Sharma',
      category: 'Nutrition',
      title: 'Is whole wheat bread really healthier than white bread for toddlers?',
      body: "I've been trying to make better food choices for my family. But packaged breads often contain refined palm oil and preservatives. What's your experience?",
      imageUrl: 'http://localhost:3000/uploads/posts/bread_nutrition.jpg',
      topics: ['Toddler Nutrition', 'Sugar Warnings'],
      likesCount: 78,
      commentsCount: 32,
    },
    {
      authorId: userId,
      authorName: 'Arjun Patel',
      category: 'Recipe',
      title: 'Quick Spinach & Cheese Oats Pancakes for 2-year-olds 🥞',
      body: 'High protein and calcium packed breakfast option! Takes under 10 minutes to prepare and picky toddlers love the soft cheesy texture.',
      imageUrl: 'http://localhost:3000/uploads/posts/spinach_pancakes.jpg',
      topics: ['School Tiffin Recipes', 'Picky Eaters'],
      likesCount: 142,
      commentsCount: 45,
    },
    {
      authorId: userId,
      authorName: 'Dr. Ananya Mehta (Pediatrician)',
      category: 'Tips',
      title: 'How to identify hidden artificial flavor enhancers (INS 627, INS 631) in child snacks',
      body: 'Disodium Guanylate & Inosinate are often added to packaged potato wafers and noodles to simulate umami flavor. They can cause restlessness in young children under 5.',
      topics: ['Ask Pediatrician', 'Sugar Warnings'],
      likesCount: 215,
      commentsCount: 68,
    },
  ]);
  console.log('✅ Seeded 3 Community Posts');

  // 3. Seed Comments
  await CommentModel.deleteMany({});
  await CommentModel.create([
    {
      postId: posts[0]._id,
      authorId: userId,
      authorName: 'Dr. Ananya Mehta',
      text: 'Always check the fiber per 100g. Genuine whole wheat bread should contain at least 6g fiber and zero added sugars.',
    },
    {
      postId: posts[0]._id,
      authorId: userId,
      authorName: 'Arjun Patel',
      text: 'We switched to sourdough homemade whole wheat loaf, kids adapted in 3 days!',
    },
  ]);
  console.log('✅ Seeded 2 Comments for Post 1');

  await mongoose.disconnect();
  console.log('🎉 Community Database Seeding Complete!');
}

runSeed().catch(err => console.error('Seed Error:', err));
