const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "<Text ? ')[0]}'s Growth</Text>",
  "<Text style={styles.legendTextBold}>{child.name.split(' ')[0]}'s Growth</Text>"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed legend text!');
