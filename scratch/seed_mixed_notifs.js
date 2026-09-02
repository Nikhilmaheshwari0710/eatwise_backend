const mongoose = require('mongoose');

async function seedMixed() {
  await mongoose.connect('mongodb://localhost:27017/eatwise');
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'dp150875@gmail.com' });
  
  if (user) {
    await db.collection('notifications').deleteMany({ userId: user._id });
    await db.collection('notifications').insertMany([
      {
        userId: user._id,
        type: 'growth_milestone',
        title: 'Growth Milestone Alert 📈',
        message: "Time to log luccccy's latest weight & height for this month's growth analysis.",
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        type: 'health_alert',
        title: 'High Sugar Alert ⚠️',
        message: 'Product "Sweet Cereal" scanned contains 24g added sugar per 100g.',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
      },
      {
        userId: user._id,
        type: 'ai_tip',
        title: 'Healthy Recipe Suggestion 🥗',
        message: 'Try Spinach & Cheese Oats Pancakes for toddlers - high protein and calcium.',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        userId: user._id,
        type: 'weekly_report',
        title: 'Weekly Health Summary Ready 📊',
        message: 'Your family nutrition summary for this week has been generated.',
        isRead: false,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
      },
    ]);
    console.log('✅ Re-seeded mixed notifications (3 unread, 1 read)');
  }
  await mongoose.disconnect();
}

seedMixed().catch(console.error);
