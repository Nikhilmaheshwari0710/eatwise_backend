const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation\screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '          <Text style={styles.selectorChevron}>v</Text>\n        </View>\n\n        {/* Flat Tabs bar */}',
  '          <Text style={styles.selectorChevron}>v</Text>\n        </TouchableOpacity>\n\n        {/* Flat Tabs bar */}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed card closing tag!');
