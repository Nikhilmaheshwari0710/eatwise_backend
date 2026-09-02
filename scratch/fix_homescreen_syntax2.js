const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const badBlock = `  const dummyParam = {\n    onUnauthorized,\n  });`;
content = content.replace(badBlock, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Done removing dummyParam');
