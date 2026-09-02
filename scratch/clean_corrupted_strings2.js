const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace any non-ASCII characters between quotes with clean ASCII equivalents
content = content.replace(/1 year [^\s']+/g, 'Child Profile');
content = content.replace(/Routine Pediatric checkup [^\s']+/g, 'Routine Pediatric checkup');
content = content.replace(/Vaccination visit [^\s']+/g, 'Vaccination visit');
content = content.replace(/164 [^\s']+/g, '164 cm');
content = content.replace(/kg\/m[^\s']+/g, 'kg/m2');

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Sanitized all non-ASCII string literals in GrowthInfoScreen.tsx!');
