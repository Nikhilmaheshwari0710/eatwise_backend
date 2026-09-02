const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find exact content at line 467 area
const oldStr = "              <Image\n                source={require('../../../../shared/assets/parent_ritika.png')}\n                style={styles.drawerAvatar}\n              />";
const newStr = "              <Image\n                source={resolveParentAvatar(dashboard.userAvatarPresetId, dashboard.userAvatarUrl)}\n                style={styles.drawerAvatar}\n              />";

// Count occurrences
const count = (content.match(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log('Occurrences found:', count);

if (count > 0) {
  // Replace only the LAST occurrence (drawer, not the AVATAR_MAP definition)
  const lastIdx = content.lastIndexOf(oldStr);
  content = content.slice(0, lastIdx) + newStr + content.slice(lastIdx + oldStr.length);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed drawer avatar!');
} else {
  console.log('Pattern not found with \\r\\n - trying with \\r\\n...');
  // Try with Windows line endings
  const oldStrWin = oldStr.replace(/\n/g, '\r\n');
  const newStrWin = newStr.replace(/\n/g, '\r\n');
  const lastIdx2 = content.lastIndexOf(oldStrWin);
  console.log('Windows line ending idx:', lastIdx2);
  if (lastIdx2 >= 0) {
    content = content.slice(0, lastIdx2) + newStrWin + content.slice(lastIdx2 + oldStrWin.length);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed with Windows line endings!');
  } else {
    console.log('Could not find pattern. Manual fix needed at line 467.');
  }
}
