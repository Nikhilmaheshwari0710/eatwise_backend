const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/chartMetric\s+\?\s+(['"\w]+)\s+\?/g, "chartMetric === $1 ?");
content = content.replace(/chartMetric\s+\?\s+(['"\w]+)/g, "chartMetric === $1");

content = content.replace(/chartRange\s+\?\s+(['"\w]+)\s+\?/g, "chartRange === $1 ?");
content = content.replace(/chartRange\s+\?\s+(['"\w]+)/g, "chartRange === $1");

content = content.replace(/historyMetricFilter\s+\?\s+(['"\w]+)\s+\?/g, "historyMetricFilter === $1 ?");
content = content.replace(/historyMetricFilter\s+\?\s+(['"\w]+)/g, "historyMetricFilter === $1");

// Fix any style array ternaries missing colon: === 'X' ? style
content = content.replace(/=== (['"\w]+) \? (styles\.\w+)\]/g, "=== $1 && $2]");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed control ternaries!');
