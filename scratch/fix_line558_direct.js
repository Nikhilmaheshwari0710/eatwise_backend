const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

lines[557] = '          <Text style={styles.selectorChevron}>v</Text>';

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Fixed line 558 directly by line array index!');
