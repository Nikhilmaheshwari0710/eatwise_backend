import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();


const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eatwise';

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
    phoneNumber: { type: String, trim: true, sparse: true, unique: true },
    passwordHash: { type: String },
    authProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE', 'PHONE'],
      default: 'LOCAL',
    },
    googleId: { type: String, sparse: true, unique: true },
    role: {
      type: String,
      enum: ['PARENT', 'CAREGIVER', 'COMMUNITY'],
      default: 'PARENT',
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    refreshTokenHash: { type: String },
  },
  { timestamps: true },
);

const demoUsers = [
  {
    fullName: 'Darshan Patel',
    email: 'dp150875@gmail.com',
    password: 'Dp@123',
    role: 'PARENT',
    authProvider: 'LOCAL',
    isEmailVerified: true,
  },
  {
    fullName: 'Parshwa Demo Parent',
    email: 'demo.parent@eatwise.app',
    password: 'Demo@1234',
    role: 'PARENT',
    authProvider: 'LOCAL',
    isEmailVerified: true,
  },
  {
    fullName: 'Priya Caregiver',
    email: 'demo.caregiver@eatwise.app',
    password: 'Demo@1234',
    role: 'CAREGIVER',
    authProvider: 'LOCAL',
    isEmailVerified: true,
  },
  {
    fullName: 'Rahul Community',
    email: 'demo.community@eatwise.app',
    password: 'Demo@1234',
    role: 'COMMUNITY',
    authProvider: 'LOCAL',
    isEmailVerified: true,
  },
  {
    fullName: 'Phone User',
    phoneNumber: '+919800000001',
    password: null,
    role: 'PARENT',
    authProvider: 'PHONE',
    isPhoneVerified: true,
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  const UserModel = mongoose.model('User', UserSchema);

  let created = 0;
  let skipped = 0;

  for (const data of demoUsers) {
    const identifier = data.email || data.phoneNumber;
    const query = data.email ? { email: data.email } : { phoneNumber: data.phoneNumber };

    const existing = await UserModel.findOne(query);
    if (existing) {
      console.log(`⊘  Skipped (already exists): ${identifier}`);
      skipped++;
      continue;
    }

    const doc: Record<string, unknown> = {
      fullName: data.fullName,
      role: data.role,
      authProvider: data.authProvider,
      isEmailVerified: data.isEmailVerified ?? false,
      isPhoneVerified: data.isPhoneVerified ?? false,
      isActive: true,
    };

    if (data.email) doc.email = data.email;
    if (data.phoneNumber) doc.phoneNumber = data.phoneNumber;
    if (data.password) {
      doc.passwordHash = await bcrypt.hash(data.password, 12);
    }

    await UserModel.create(doc);
    console.log(`✓  Created: ${identifier} [${data.role}]`);
    created++;
  }

  
  const NotificationModel = mongoose.model('Notification', NotificationSchema);
  const userDoc = await UserModel.findOne({ email: 'dp150875@gmail.com' });
  if (userDoc) {
    const existingNotifs = await NotificationModel.countDocuments({ userId: userDoc._id });
    if (existingNotifs === 0) {
      await NotificationModel.create([
        {
          userId: userDoc._id,
          type: 'growth_milestone',
          title: 'Growth Milestone Alert 📈',
          message: "Time to log luccccy's latest weight & height for this month's growth analysis.",
          isRead: false,
          metadata: { category: 'growth' },
        },
        {
          userId: userDoc._id,
          title: 'High Sugar Alert ⚠️',
          type: 'health_alert',
          message: 'Product "Sweet Cereal" scanned contains 24g added sugar per 100g.',
          isRead: false,
          metadata: { category: 'scans' },
        },
        {
          userId: userDoc._id,
          type: 'ai_tip',
          title: 'Healthy Recipe Suggestion 🥗',
          message: 'Try Spinach & Cheese Oats Pancakes for toddlers - high protein and calcium.',
          isRead: true,
          metadata: { category: 'recipes' },
        },
        {
          userId: userDoc._id,
          type: 'weekly_report',
          title: 'Weekly Health Summary Ready 📊',
          message: 'Your family nutrition summary for this week has been generated.',
          isRead: false,
          metadata: { category: 'updates' },
        },
      ]);
      console.log('✅ Seeded 4 notifications for dp150875@gmail.com');
    }
  }

console.log(`\nSeed complete. Created: ${created}, Skipped: ${skipped}`);

  console.log('\n--- Demo Login Credentials ---');
  console.log('Email    : demo.parent@eatwise.app');
  console.log('Password : Demo@1234');
  console.log('\nEmail    : demo.caregiver@eatwise.app');
  console.log('Password : Demo@1234');
  console.log('\nEmail    : demo.community@eatwise.app');
  console.log('Password : Demo@1234');
  console.log('\nPhone    : +919800000001 (phone OTP login, no password)');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
