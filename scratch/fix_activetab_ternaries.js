const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/activeTab\s+\?\s+(['"\w]+)\s+\?/g, "activeTab === $1 ?");
content = content.replace(/activeTab\s+\?\s+(['"\w]+)/g, "activeTab === $1");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed activeTab ternaries!');
