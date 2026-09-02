const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('styles.selectorChevron\\">', 'styles.selectorChevron">');
content = content.replace(/selectorChevron\\"/g, 'selectorChevron');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed chevron backslash!');
