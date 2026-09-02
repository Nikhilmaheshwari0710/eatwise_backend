const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `          <Text style={styles.selectorChevron}>v</Text>
        </View>`;

content = content.replace(
  /selectorChevron[\s\S]*?<\/View>/,
  'selectorChevron">v</Text>\n        </TouchableOpacity>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed!');
