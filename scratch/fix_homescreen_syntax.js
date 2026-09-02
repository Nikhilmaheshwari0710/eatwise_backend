const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "  const dummyParam = {\n    onUnauthorized,\n  });",
  ""
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error in HomeScreen.tsx!');
