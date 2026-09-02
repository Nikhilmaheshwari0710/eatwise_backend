const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/metric\s+\?\s+['"]Weight['"]/g, "metric === 'Weight'");
content = content.replace(/metric\s+\?\s+['"]Height['"]/g, "metric === 'Height'");
content = content.replace(/metric\s+\?\s+['"]BMI['"]/g, "metric === 'BMI'");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed metric equals!');
