const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `          <TouchableOpacity
            key={child.id}
            style={styles.childCard}
            activeOpacity={0.8}
          >`;

const replacement = `          <TouchableOpacity
            key={child.id}
            style={styles.childCard}
            activeOpacity={0.8}
            onPress={() => {
              if (onSelectChild) {
                onSelectChild(child);
              }
            }}
          >`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ HomeScreen childCard onPress attached successfully!');
} else {
  console.log('⚠️ Target string not found, trying regex replace...');
  content = content.replace(
    /key=\{child\.id\}\s*style=\{styles\.childCard\}\s*activeOpacity=\{0\.8\}/,
    'key={child.id}\n            style={styles.childCard}\n            activeOpacity={0.8}\n            onPress={() => {\n              if (onSelectChild) {\n                onSelectChild(child);\n              }\n            }}'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Regex replacement applied!');
}
