const mongoose = require('mongoose');

async function seedBalaji() {
  await mongoose.connect('mongodb://localhost:27017/eatwise');
  const db = mongoose.connection.db;

  const categories = await db.collection('productcategories').find({}).toArray();
  const snacksCat = categories.find(c => c.name.includes('Snacks')) || categories[0];

  const balajiDoc = {
    barcode: '8901725112119',
    name: 'Balaji Potato Wafers (Cippi)',
    brand: 'Balaji Wafers',
    categoryId: snacksCat ? snacksCat._id : new mongoose.Types.ObjectId(),
    imageUrl: 'https://cdn.eatwise.app/products/balaji_wafers.jpg',
    netWeight: '30g',
    healthScore: 3.9,
    isVeg: true,
    servingSize: '30g (1 pack)',
    ingredients: 'Potato, Palmolein Oil, Spices & Condiments (Chili, Cumin, Onion, Garlic), Acidity Regulator (INS 330), Flavor Enhancers (INS 627, INS 631).',
    allergens: [],
    nutritionPer100g: {
      calories: 550,
      protein: 6.5,
      carbohydrates: 57.5,
      fat: 32.8,
      saturatedFat: 14.2,
      fiber: 5.4,
      sugar: 6.5,
      sodium: 580,
      calcium: 15,
    },
    highlights: [
      {
        label: 'Flavor Enhancers (INS 627, 631)',
        type: 'danger',
        detail: 'Contains Disodium Inosinate & Guanylate - Not recommended for toddlers',
      },
      {
        label: 'High Saturated Fat',
        type: 'warning',
        detail: '14.2g saturated fat per 100g from Palmolein Oil',
      },
      {
        label: 'Sodium Content',
        type: 'warning',
        detail: '580mg sodium per 100g',
      },
    ],
    suitableFor: {
      toddler: false,
      child: false,
      adult: true,
    },
    alternatives: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection('products').updateOne(
    { barcode: '8901725112119' },
    { $set: balajiDoc },
    { upsert: true }
  );

  console.log('✅ Seeded Balaji Potato Wafers (Cippi) into MongoDB database!');
  await mongoose.disconnect();
}

seedBalaji().catch(console.error);
