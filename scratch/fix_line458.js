const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "{metricType ? 'Weight' ? 'Weight (kg)' : metricType ? 'Height' ? 'Height (cm)' : 'BMI (kg/m2'}",
  "{metricType === 'Weight' ? 'Weight (kg)' : metricType === 'Height' ? 'Height (cm)' : 'BMI (kg/m2)'}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed line 458!');
