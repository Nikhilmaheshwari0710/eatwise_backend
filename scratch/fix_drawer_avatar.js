const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "source={require('../../../../shared/assets/parent_ritika.png')}\n                style={styles.drawerAvatar}",
  "source={resolveParentAvatar(dashboard.userAvatarPresetId, dashboard.userAvatarUrl)}\n                style={styles.drawerAvatar}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Drawer avatar fixed!');
