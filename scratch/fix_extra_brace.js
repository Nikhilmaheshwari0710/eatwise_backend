const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("      {\n      {/* Switch Child Profile Drawer Modal */}", "      {/* Switch Child Profile Drawer Modal */}");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed extra brace!');
