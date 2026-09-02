const fs = require('fs');
const file = 'c:/Users/Darshan/eatwise_backend/src/modules/dashboard/services/dashboard.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '    return {\n      id: child._id.toString(),\n      name: child.name,',
  '    return {\n      id: child._id.toString(),\n      name: child.name,\n      dateOfBirth: child.dateOfBirth,\n      gender: child.gender,'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated dashboard.service.ts with dateOfBirth and gender');
