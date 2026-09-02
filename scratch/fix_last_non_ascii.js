const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/getBmiCategoryInf\?=/g, 'getBmiCategoryInfo =');
content = content.replace(/categoryInf\?=/g, 'categoryInfo =');
content = content.replace(/childBmi\s*\?\s*"\s*\?\s*"\s*\?\s*/g, 'childBmi !== "—" ? ');
content = content.replace(/\?\?\s*Ped/g, 'Ped');
content = content.replace(/\?\?\s*Bon/g, 'Bon');
content = content.replace(/fontWeight: '700' \}\>\?<\/Text\>/g, "fontWeight: '700' }>✕</Text>");

fs.writeFileSync(file, content, 'utf8');
console.log('Done fixing last non-ASCII!');
