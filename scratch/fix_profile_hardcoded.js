const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/ProfileScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix each hardcoded fallback one by one
const fixes = [
  ["name: profile?.name || 'Ritika Sharma',", "name: profile?.name ?? '',"],
  ["email: profile?.email || 'ritika.sharma@gmail.com',", "email: profile?.email ?? '',"],
  ["phone: profile?.phone || '+91 98765 43210',", "phone: profile?.phone || '',"],
  ["dateOfBirth: profile?.dateOfBirth || '15 Apr 1994',", "dateOfBirth: profile?.dateOfBirth || '',"],
  ["gender: profile?.gender || 'Female',", "gender: profile?.gender || '',"],
];

fixes.forEach(([from, to]) => {
  if (content.includes(from)) {
    content = content.replace(from, to);
    console.log('Fixed:', from.slice(0, 40));
  } else {
    console.log('NOT FOUND:', from.slice(0, 40));
  }
});

fs.writeFileSync(file, content, 'utf8');
console.log('\nDone! Hardcoded fallbacks removed from ProfileScreen.tsx');
