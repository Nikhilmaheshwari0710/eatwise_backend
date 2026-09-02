const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("if (metric ? 'Weight')", "if (metric === 'Weight')");
content = content.replace("else if (metric ? 'Height')", "else if (metric === 'Height')");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed getY block!');
