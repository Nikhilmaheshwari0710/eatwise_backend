const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/community/presentation/screens/CommunityScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "category: newPostCategory,",
  "category: ['Nutrition', 'Recipe', 'Tips', 'Parenting', 'General'].includes(newPostCategory) ? newPostCategory : 'Nutrition',"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Ensured valid PostCategory enum in CommunityScreen.tsx!');
