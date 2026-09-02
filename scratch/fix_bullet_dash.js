const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Child [^\s`]+ \$\{child\.gender\}/g, 'Child - ${child.gender}');
content = content.replace(/[^\x00-\x7F]/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed bullet to dash!');
