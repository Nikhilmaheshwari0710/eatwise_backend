const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix ternaries where '?' was replaced by non-ASCII bullet symbols
content = content.replace(/active\s+[^\s:?]+\s+(['"#])/g, 'active ? $1');
content = content.replace(/(===?\s*['"\w]+)\s+[^\s:?]+\s+(['"#\w])/g, '$1 ? $2');
content = content.replace(/(!?[\w\.]+)\s+[^\s:?]+\s+(['"#])/g, (match, p1, p2) => {
  if (match.includes(':')) return match; // skip if already valid
  return `${p1} ? ${p2}`;
});

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Fixed ternaries in GrowthInfoScreen.tsx!');
