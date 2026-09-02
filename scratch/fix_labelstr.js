const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const labelStr = metricType ? 'Weight' ? childWeight : metricType ? 'Height' ? childHeight : childBmi;",
  "const labelStr = metricType === 'Weight' ? childWeight : metricType === 'Height' ? childHeight : childBmi;"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed labelStr!');
