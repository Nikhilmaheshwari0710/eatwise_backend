const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/maggi\.png/g, 'maggi_noodles.jpg');

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Replaced all maggi.png with valid maggi_noodles.jpg in ScanScreen.tsx!');
