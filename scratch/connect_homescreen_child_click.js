const fs = require('fs');

const APP_SRC = 'd:/backup project/eatwise/eatwise_app/src';

// ══════════════════════════════════════════════════════════════
// 1. HomeScreen.tsx: Add onSelectChild to props & attach onPress
// ══════════════════════════════════════════════════════════════
const homeFile = `${APP_SRC}/features/home/presentation/screens/HomeScreen.tsx`;
let home = fs.readFileSync(homeFile, 'utf8');

// Add onSelectChild to HomeScreenProps interface
home = home.replace(
  '  onNavigateToAddChild?: () => void;',
  '  onNavigateToAddChild?: () => void;\n  onSelectChild?: (child: any) => void;'
);

// Destructure onSelectChild
home = home.replace(
  '  onNavigateToAddChild,',
  '  onNavigateToAddChild,\n  onSelectChild,'
);

// Attach onPress to childCard Touchables
const oldCard = `<TouchableOpacity
            key={child.id}
            style={styles.childCard}
            activeOpacity={0.8}
          >`;

const newCard = `<TouchableOpacity
            key={child.id}
            style={styles.childCard}
            activeOpacity={0.8}
            onPress={() => {
              if (onSelectChild) {
                onSelectChild(child);
              }
            }}
          >`;

if (home.includes(oldCard)) {
  home = home.replace(oldCard, newCard);
  console.log('✅ 1. HomeScreen.tsx: Attached onPress with onSelectChild to childCard!');
} else {
  console.log('⚠️ Could not find exact oldCard in HomeScreen.tsx');
}

fs.writeFileSync(homeFile, home, 'utf8');

// ══════════════════════════════════════════════════════════════
// 2. AppContainer.tsx: Pass onSelectChild to HomeScreen call
// ══════════════════════════════════════════════════════════════
const appFile = `${APP_SRC}/app/AppContainer.tsx`;
let app = fs.readFileSync(appFile, 'utf8');

const oldHomeCall = `          onNavigateToAddChild={() => setCurrentScreen('myChildren')}`;
const newHomeCall = `          onNavigateToAddChild={() => {
            setEditingChild(null);
            setCurrentScreen('addChild');
          }}
          onSelectChild={(child) => {
            setSelectedChild(child);
            setCurrentScreen('growthInfo');
          }}`;

if (app.includes(oldHomeCall)) {
  app = app.replace(oldHomeCall, newHomeCall);
  console.log('✅ 2. AppContainer.tsx: Passed onSelectChild to HomeScreen!');
} else {
  console.log('⚠️ Could not find exact oldHomeCall in AppContainer.tsx');
}

fs.writeFileSync(appFile, app, 'utf8');
console.log('\n🎉 Home Dashboard Child Card Click & Navigation fully connected!');
