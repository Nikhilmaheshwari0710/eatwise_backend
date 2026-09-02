const fs = require('fs');
const parser = require('@babel/parser');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/community/presentation/screens/CommunityScreen.tsx';
const content = fs.readFileSync(file, 'utf8');

try {
  parser.parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
  console.log('✅ 0 AST Syntax Errors in CommunityScreen.tsx!');
} catch (err) {
  console.error('❌ AST Error:', err.message);
  process.exit(1);
}
