const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "<Text style={styles.childAgeText}>{child.ageText ? 'Child Profile Girl'}</Text>",
  "<Text style={styles.childAgeText}>{child.ageText || (child.gender ? `Child • \${child.gender}\` : 'Child Profile')}</Text>"
);

content = content.replace(
  "<Text style={styles.dobText}>{child.dateOfBirth || child.dob ? 'Not specified'}</Text>",
  "<Text style={styles.dobText}>{child.dateOfBirth || child.dob || 'Not specified'}</Text>"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed child header!');
