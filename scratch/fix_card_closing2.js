const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '          <Text style={styles.selectorChevron}>v</Text>\n        </View>\n\n        {/* Flat Tabs bar */}';
const target2 = '          <Text style={styles.selectorChevron}>v</Text>';

const idx = content.indexOf(target2);
if (idx >= 0) {
  const closeIdx = content.indexOf('</View>', idx);
  if (closeIdx >= 0) {
    content = content.slice(0, closeIdx) + '</TouchableOpacity>' + content.slice(closeIdx + 7);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed card closing tag!');
  }
}
