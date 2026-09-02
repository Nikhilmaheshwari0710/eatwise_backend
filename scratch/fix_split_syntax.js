const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "insightBody: `Tap \"+ Log Measurement\" to record \${child.name.split('[0]}",
  "insightBody: `Tap \"+ Log Measurement\" to record \${child.name.split(' ')[0]}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Fixed child.name.split syntax on line 222!');
