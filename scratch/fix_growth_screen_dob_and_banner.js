const fs = require('fs');

const growthFile = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let growth = fs.readFileSync(growthFile, 'utf8');

// 1. Update initial DOB check
growth = growth.replace(
  "const [dobText, setDobText] = useState(child.dob || 'Not specified');",
  "const [dobText, setDobText] = useState(child.dateOfBirth || child.dob || 'Not specified');"
);

growth = growth.replace(
  "<Text style={styles.dobText}>{child.dob || 'Not specified'}</Text>",
  "<Text style={styles.dobText}>{child.dateOfBirth || child.dob || 'Not specified'}</Text>"
);

fs.writeFileSync(growthFile, growth, 'utf8');
console.log('✅ 1. GrowthInfoScreen.tsx updated with child.dateOfBirth || child.dob check');
