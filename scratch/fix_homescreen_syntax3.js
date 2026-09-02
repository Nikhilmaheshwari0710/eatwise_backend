const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const idx = content.indexOf('const dummyParam');
if (idx >= 0) {
  const endIdx = content.indexOf(';\n', idx);
  console.log('Found dummyParam at', idx);
  // Replace from idx to end of lines
  content = content.replace(/const dummyParam = \{\s*onUnauthorized,\s*\};\s*/g, '');
  content = content.replace(/const dummyParam = \{\s*onUnauthorized,\s*\}\);\s*/g, '');
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Done!');
