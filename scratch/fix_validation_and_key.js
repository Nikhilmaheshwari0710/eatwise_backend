const fs = require('fs');

const APP_SRC = 'd:/backup project/eatwise/eatwise_app/src';

// ══════════════════════════════════════════════════════════════
// 1. AppContainer.tsx: Add key to AddChildScreen component
// ══════════════════════════════════════════════════════════════
const appFile = `${APP_SRC}/app/AppContainer.tsx`;
let app = fs.readFileSync(appFile, 'utf8');

app = app.replace(
  '<AddChildScreen\n          initialData={editingChild}',
  '<AddChildScreen\n          key={editingChild?.id || "newChild"}\n          initialData={editingChild}'
);

fs.writeFileSync(appFile, app, 'utf8');
console.log('✅ 1. AppContainer.tsx: Added key prop to AddChildScreen for clean remounting!');

// ══════════════════════════════════════════════════════════════
// 2. AddChildScreen.tsx: Fix default relationship & strict validation
// ══════════════════════════════════════════════════════════════
const addChildFile = `${APP_SRC}/features/profile/presentation/screens/AddChildScreen.tsx`;
let ac = fs.readFileSync(addChildFile, 'utf8');

// Fix initial state for relationship
ac = ac.replace(
  "const [relationship, setRelationship] = useState<string>(initialData?.relationship || 'Mother');",
  "const [relationship, setRelationship] = useState<string>(initialData?.relationship && initialData.relationship !== 'Select relationship' ? initialData.relationship : 'Select relationship');"
);

// Fix handleSave validation
const oldSave = `  const handleSave = () => {
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

const newSave = `  const handleSave = () => {
    setShowErrors(true);

    if (!name.trim()) {
      Alert.alert('Required Field Missing', 'Please enter your child\\'s Full Name.');
      return;
    }
    if (!dob.trim()) {
      Alert.alert('Required Field Missing', 'Please select your child\\'s Date of Birth.');
      return;
    }
    if (gender === 'Select gender' || !gender) {
      Alert.alert('Required Field Missing', 'Please select your child\\'s Gender (Boy or Girl).');
      return;
    }
    if (relationship === 'Select relationship' || !relationship) {
      Alert.alert('Required Field Missing', 'Please select your Relationship (Mother, Father, or Guardian).');
      return;
    }`;

ac = ac.replace(oldSave, newSave);

fs.writeFileSync(addChildFile, ac, 'utf8');
console.log('✅ 2. AddChildScreen.tsx: Fixed relationship default to "Select relationship" and strengthened validation!');
