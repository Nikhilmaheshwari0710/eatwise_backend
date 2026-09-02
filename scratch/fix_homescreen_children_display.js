const fs = require('fs');

const APP_SRC = 'd:/backup project/eatwise/eatwise_app/src';

// ══════════════════════════════════════════════════════════════
// 1. HomeScreen.tsx: Add childrenList prop & fallback mapping
// ══════════════════════════════════════════════════════════════
const homeFile = `${APP_SRC}/features/home/presentation/screens/HomeScreen.tsx`;
let home = fs.readFileSync(homeFile, 'utf8');

// Add childrenList to HomeScreenProps
if (!home.includes('childrenList?: any[];')) {
  home = home.replace(
    '  onNavigateToAddChild?: () => void;',
    '  onNavigateToAddChild?: () => void;\n  childrenList?: any[];'
  );
  home = home.replace(
    '  onNavigateToAddChild,',
    '  onNavigateToAddChild,\n  childrenList = [],'
  );
}

// Map children display in HomeScreen
const oldMapCode = `{dashboard.children.map(child => (`;
const newMapCode = `const displayChildren = (dashboard.children && dashboard.children.length > 0)\n    ? dashboard.children\n    : (childrenList || []).map((c: any) => ({\n        id: c.id,\n        name: c.name,\n        details: c.ageText || 'Child Profile',\n        status: c.status || 'Active',\n        weight: c.weight || '—',\n        height: c.height || '—',\n        avatar: c.avatar || (c.gender === 'Girl' ? require('../../../../shared/assets/child_myra.png') : require('../../../../shared/assets/child_aarav.png')),\n      }));\n\n  return (`;

// Replace in JSX: {dashboard.children.map(child => (  --> {displayChildren.map(child => (
if (home.includes('{dashboard.children.map(child => (')) {
  home = home.replace('{dashboard.children.map(child => (', '{displayChildren.map((child: any) => (');
  console.log('✅ Updated HomeScreen JSX map to use displayChildren');
}

if (!home.includes('const displayChildren =')) {
  home = home.replace('return (\n    <View style={[styles.screen', newMapCode + '\n    <View style={[styles.screen');
  console.log('✅ Added displayChildren calculation logic to HomeScreen');
}

fs.writeFileSync(homeFile, home, 'utf8');

// ══════════════════════════════════════════════════════════════
// 2. AppContainer.tsx: Pass childrenList to HomeScreen component
// ══════════════════════════════════════════════════════════════
const appFile = `${APP_SRC}/app/AppContainer.tsx`;
let app = fs.readFileSync(appFile, 'utf8');

if (!app.includes('childrenList={childrenList}') || app.indexOf('childrenList={childrenList}') === app.lastIndexOf('childrenList={childrenList}')) {
  app = app.replace(
    '<HomeScreen\n          onUnauthorized={handleLogout}',
    '<HomeScreen\n          childrenList={childrenList}\n          onUnauthorized={handleLogout}'
  );
  console.log('✅ Passed childrenList to HomeScreen in AppContainer.tsx!');
}

fs.writeFileSync(appFile, app, 'utf8');
console.log('\n🎉 Home Screen Children Display Fix Complete!');
