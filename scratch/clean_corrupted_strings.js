const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Clean up any corrupted non-ASCII strings causing unterminated string constant errors
content = content.replace(/\?/g, '•');
content = content.replace(/\^"/g, 'v');
content = content.replace(/o /g, '✕');
content = content.replace(/dY[^\s<"']+/g, ''); // strip any broken emoji byte artifacts

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Cleaned up all corrupted string constants in GrowthInfoScreen.tsx!');
