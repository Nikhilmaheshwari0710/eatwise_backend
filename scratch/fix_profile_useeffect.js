const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/ProfileScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix useEffect update - use ?? instead of || so empty string from API replaces old hardcoded value
const oldEffect = `    setUserData(prev => ({
      ...prev,
      name: profile.name || prev.name,
      email: profile.email || prev.email,
      phone: profile.phone || prev.phone,
      avatar: avatarSource ?? prev.avatar,
      dateOfBirth: profile.dateOfBirth ?? prev.dateOfBirth,
      gender: profile.gender ?? prev.gender,
      language: profile.language ?? prev.language,
    }));`;

const newEffect = `    setUserData(prev => ({
      ...prev,
      name: profile.name || prev.name,
      email: profile.email || prev.email,
      phone: profile.phone ?? prev.phone,
      avatar: avatarSource ?? prev.avatar,
      dateOfBirth: profile.dateOfBirth ?? prev.dateOfBirth,
      gender: profile.gender ?? prev.gender,
      language: profile.language ?? prev.language,
    }));`;

if (content.includes(oldEffect)) {
  content = content.replace(oldEffect, newEffect);
  console.log('Fixed useEffect phone update (|| -> ??)');
} else {
  console.log('Pattern not found, checking alternatives...');
  // Try simpler fix
  content = content.replace(
    'phone: profile.phone || prev.phone,',
    'phone: profile.phone !== undefined ? profile.phone : prev.phone,'
  );
  console.log('Applied alternative fix');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');
