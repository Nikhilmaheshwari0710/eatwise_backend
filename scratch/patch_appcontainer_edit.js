const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/app/AppContainer.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = 'childrenList={childrenList}';
const addition = '\n          onEditChild={(childToEdit) => {\n            setEditingChild(childToEdit);\n            setCurrentScreen(\'addChild\');\n          }}';

if (content.includes(target) && !content.includes('onEditChild=')) {
  content = content.replace(target, target + addition);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Added onEditChild prop to MyChildrenScreen call in AppContainer.tsx');
} else {
  console.log('ℹ️ Already present or target not found');
}
