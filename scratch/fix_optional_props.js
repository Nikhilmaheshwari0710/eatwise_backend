const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace any '•:' or non-ASCII followed by ':' in variable/property declarations with '?:'
content = content.replace(/(\w+)\s*[^\w\s:]+:/g, '$1?:');

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Fixed optional property syntax in GrowthInfoScreen.tsx!');
