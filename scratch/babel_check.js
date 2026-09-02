const fs = require('fs');
const parser = require('d:/backup project/eatwise/eatwise_app/node_modules/@babel/parser');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
const code = fs.readFileSync(file, 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
  console.log('🎉 Babel Parse SUCCESS! Zero syntax errors in GrowthInfoScreen.tsx!');
} catch (e) {
  console.error('❌ Babel Parse Error:', e.message, `at line ${e.loc?.line}:${e.loc?.column}`);
}
