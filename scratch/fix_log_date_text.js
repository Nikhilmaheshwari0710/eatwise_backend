const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "{newLogDate ? 'Today' ? 'Today, ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : newLogDate}",
  "{newLogDate === 'Today' ? ('Today, ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })) : newLogDate}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed log date text!');
