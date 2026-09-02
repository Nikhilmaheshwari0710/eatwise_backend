const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace any non-ASCII whitespace/symbol between identifier and identifier/string with '?'
content = content.replace(/([A-Za-z0-9_\)\}\]'"])\s*[^\x00-\x7F]+\s*([A-Za-z0-9_`'"\{\[\(])/g, '$1 ? $2');

// Fix specific broken names
content = content.replace(/getBmiCategoryInf\s*\?/g, 'getBmiCategoryInfo');
content = content.replace(/categoryInf\s*\?/g, 'categoryInfo');
content = content.replace(/N\s*\?\s*Data/g, 'No Data');
content = content.replace(/N\s*\?\s*Growth Data Yet/g, 'No Growth Data Yet');
content = content.replace(/t\s*\?\s*record/g, 'to record');
content = content.replace(/record\s*\?\s*'\)/g, "record ${child.name.split('");

fs.writeFileSync(file, content, 'utf8');
console.log('Done byte-level fix!');
