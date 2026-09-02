const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<Text style=\{styles\.selectorChevron\}>[\s\S]*?<\/Text>/g, '<Text style={styles.selectorChevron}>v</Text>');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed line 558 chevron!');
