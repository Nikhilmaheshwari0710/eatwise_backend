const fs = require('fs');

const seedFile = 'c:/Users/Darshan/eatwise_backend/src/database/seeds/seed.ts';
let content = fs.readFileSync(seedFile, 'utf8');

if (!content.includes('NotificationSchema')) {
  const notifSchemaCode = `
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
`;

  content = content.replace("const MONGODB_URI", notifSchemaCode + "\nconst MONGODB_URI");

  const seedNotifsCode = `
  const NotificationModel = mongoose.model('Notification', NotificationSchema);
  const userDoc = await UserModel.findOne({ email: 'dp150875@gmail.com' });
  if (userDoc) {
    const existingNotifs = await NotificationModel.countDocuments({ userId: userDoc._id });
    if (existingNotifs === 0) {
      await NotificationModel.create([
        {
          userId: userDoc._id,
          type: 'GROWTH_MILESTONE',
          title: 'Growth Milestone Alert 📈',
          message: "Time to log luccccy's latest weight & height for this month's growth analysis.",
          isRead: false,
          metadata: { category: 'growth' },
        },
        {
          userId: userDoc._id,
          title: 'High Sugar Alert ⚠️',
          type: 'HEALTH_ALERT',
          message: 'Product "Sweet Cereal" scanned contains 24g added sugar per 100g.',
          isRead: false,
          metadata: { category: 'scans' },
        },
        {
          userId: userDoc._id,
          type: 'AI_TIP',
          title: 'Healthy Recipe Suggestion 🥗',
          message: 'Try Spinach & Cheese Oats Pancakes for toddlers - high protein and calcium.',
          isRead: true,
          metadata: { category: 'recipes' },
        },
        {
          userId: userDoc._id,
          type: 'WEEKLY_REPORT',
          title: 'Weekly Health Summary Ready 📊',
          message: 'Your family nutrition summary for this week has been generated.',
          isRead: false,
          metadata: { category: 'updates' },
        },
      ]);
      console.log('✅ Seeded 4 notifications for dp150875@gmail.com');
    }
  }
`;

  content = content.replace("console.log(`\\nSeed complete.", seedNotifsCode + "\nconsole.log(`\\nSeed complete.");
  fs.writeFileSync(seedFile, content, 'utf8');
  console.log('✅ Updated backend seed.ts with sample notifications!');
}
