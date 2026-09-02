const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/activeTab === (['"\w]+) \? (styles\.\w+Active)\]/g, "activeTab === $1 && $2]");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed tab style AND operators!');
