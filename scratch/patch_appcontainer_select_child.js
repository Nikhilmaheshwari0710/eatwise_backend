const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/app/AppContainer.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `          onSelectChild={(child) => {
            setSelectedChild(child);
            setCurrentScreen('growthInfo');
          }}`;

const replacement = `          onSelectChild={(child) => {
            const found = childrenList.find(c => c.id === child.id || c.name === child.name);
            const fullChild = found ? { ...child, ...found } : child;
            setSelectedChild(fullChild);
            setCurrentScreen('growthInfo');
          }}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ AppContainer onSelectChild updated to merge full child profile data!');
} else {
  console.log('ℹ️ Target not found or already replaced');
}
