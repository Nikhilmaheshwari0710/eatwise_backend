const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /if\s*\([^)]*isLoading[^)]*\)\s*\{[\s\S]*?return\s*\([\s\S]*?<\/View>\s*\);\s*\}/;
const declaration = `\n\n  const displayChildren = (dashboard.children && dashboard.children.length > 0)\n    ? dashboard.children\n    : (childrenList || []).map((c: any) => ({\n        id: c.id,\n        name: c.name,\n        details: c.ageText || 'Child Profile',\n        status: c.status || 'Active',\n        weight: c.weight || '—',\n        height: c.height || '—',\n        avatar: c.avatar || (c.gender === 'Girl' ? require('../../../../shared/assets/child_myra.png') : require('../../../../shared/assets/child_aarav.png')),\n      }));`;

if (!content.includes('const displayChildren =')) {
  content = content.replace(regex, (match) => match + declaration);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Regex replacement successful!');
} else {
  console.log('ℹ️ displayChildren already declared');
}
