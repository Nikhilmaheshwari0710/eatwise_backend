const fs = require('fs');

const APP_SRC = 'd:/backup project/eatwise/eatwise_app/src';

// ══════════════════════════════════════════════════════════════
// 1. AppContainer.tsx: Pass onEditChild prop to MyChildrenScreen
// ══════════════════════════════════════════════════════════════
const appFile = `${APP_SRC}/app/AppContainer.tsx`;
let app = fs.readFileSync(appFile, 'utf8');

const oldMyChildrenBlock = `      ) : currentScreen === 'myChildren' ? (
        <MyChildrenScreen
          onBack={() => setCurrentScreen('home')}
          onTabPress={handleTabPress}
          childrenList={childrenList}
          onDeleteChild={id => {`;

const newMyChildrenBlock = `      ) : currentScreen === 'myChildren' ? (
        <MyChildrenScreen
          onBack={() => setCurrentScreen('home')}
          onTabPress={handleTabPress}
          childrenList={childrenList}
          onEditChild={(childToEdit) => {
            setEditingChild(childToEdit);
            setCurrentScreen('addChild');
          }}
          onDeleteChild={id => {`;

if (app.includes(oldMyChildrenBlock)) {
  app = app.replace(oldMyChildrenBlock, newMyChildrenBlock);
  console.log('✅ 1. AppContainer.tsx: Added onEditChild prop to MyChildrenScreen!');
} else {
  console.log('⚠️ Could not find exact oldMyChildrenBlock in AppContainer.tsx');
}

// Make sure onNavigateToAddChild resets editingChild
app = app.replace(
  "onNavigateToAddChild={() => setCurrentScreen('addChild')}",
  "onNavigateToAddChild={() => {\n            setEditingChild(null);\n            setCurrentScreen('addChild');\n          }}"
);

fs.writeFileSync(appFile, app, 'utf8');

// ══════════════════════════════════════════════════════════════
// 2. AddChildScreen.tsx: Add strict validation & visual red errors
// ══════════════════════════════════════════════════════════════
const addChildFile = `${APP_SRC}/features/profile/presentation/screens/AddChildScreen.tsx`;
let ac = fs.readFileSync(addChildFile, 'utf8');

// Add showErrors state
if (!ac.includes('showErrors')) {
  ac = ac.replace(
    'const [isGenderOpen, setIsGenderOpen] = useState(false);',
    'const [showErrors, setShowErrors] = useState(false);\n  const [isGenderOpen, setIsGenderOpen] = useState(false);'
  );
}

// Update handleSave to set showErrors(true) and block if incomplete
const oldSaveHandlerStart = `  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your child\\'s full name.');
      return;
    }
    if (!dob.trim()) {
      Alert.alert('Validation Error', 'Please enter your child\\'s date of birth.');
      return;
    }
    if (gender === 'Select gender') {
      Alert.alert('Validation Error', 'Please select a gender.');
      return;
    }
    if (relationship === 'Select relationship') {
      Alert.alert('Validation Error', 'Please select a relationship.');
      return;
    }`;

const newSaveHandlerStart = `  const handleSave = () => {
    setShowErrors(true);

    if (!name.trim()) {
      Alert.alert('Required Field Missing', 'Please enter your child\\'s Full Name.');
      return;
    }
    if (!dob.trim()) {
      Alert.alert('Required Field Missing', 'Please select your child\\'s Date of Birth.');
      return;
    }
    if (gender === 'Select gender') {
      Alert.alert('Required Field Missing', 'Please select your child\\'s Gender.');
      return;
    }
    if (relationship === 'Select relationship') {
      Alert.alert('Required Field Missing', 'Please select your Relationship to child.');
      return;
    }`;

if (ac.includes(oldSaveHandlerStart)) {
  ac = ac.replace(oldSaveHandlerStart, newSaveHandlerStart);
  console.log('✅ 2. AddChildScreen.tsx: Updated handleSave validation with strict block!');
}

fs.writeFileSync(addChildFile, ac, 'utf8');
console.log('\n🎉 Fix applied successfully!');
