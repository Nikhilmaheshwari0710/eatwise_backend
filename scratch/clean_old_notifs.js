const mongoose = require('mongoose');

async function clean() {
  await mongoose.connect('mongodb://localhost:27017/eatwise');
  const db = mongoose.connection.db;
  await db.collection('notifications').deleteMany({});
  console.log('Cleaned old notifications collection');
  await mongoose.disconnect();
}

clean().catch(console.error);
