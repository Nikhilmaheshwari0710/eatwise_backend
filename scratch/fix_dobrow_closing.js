const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '              <Text style={styles.dobText}>{child.dateOfBirth || child.dob || \'Not specified\'}</Text>\n            </TouchableOpacity>\n          </View>',
  '              <Text style={styles.dobText}>{child.dateOfBirth || child.dob || \'Not specified\'}</Text>\n            </View>\n          </View>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed dobRow closing tag in GrowthInfoScreen.tsx!');
