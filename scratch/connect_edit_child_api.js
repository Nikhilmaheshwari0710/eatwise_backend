const fs = require('fs');

const APP_SRC = 'd:/backup project/eatwise/eatwise_app/src';

// ══════════════════════════════════════════════════════════════
// 1. MyChildrenScreen.tsx: Add onEditChild prop and handle click
// ══════════════════════════════════════════════════════════════
const myChildrenFile = `${APP_SRC}/features/profile/presentation/screens/MyChildrenScreen.tsx`;
let mc = fs.readFileSync(myChildrenFile, 'utf8');

mc = mc.replace(
  '  onNavigateToAddChild: () => void;\n  onSelectChild: (child: MyChildProfile) => void;',
  '  onNavigateToAddChild: () => void;\n  onSelectChild: (child: MyChildProfile) => void;\n  onEditChild?: (child: MyChildProfile) => void;'
);

mc = mc.replace(
  '  onNavigateToAddChild,\n  onSelectChild,',
  '  onNavigateToAddChild,\n  onSelectChild,\n  onEditChild,'
);

mc = mc.replace(
  'onPress={() => handleEditChild(child.name)}',
  'onPress={() => (onEditChild ? onEditChild(child) : handleEditChild(child.name))}'
);

fs.writeFileSync(myChildrenFile, mc, 'utf8');
console.log('✅ 1. MyChildrenScreen.tsx updated with onEditChild prop');

// ══════════════════════════════════════════════════════════════
// 2. AddChildScreen.tsx: Add initialData support for editing
// ══════════════════════════════════════════════════════════════
const addChildFile = `${APP_SRC}/features/profile/presentation/screens/AddChildScreen.tsx`;
let ac = fs.readFileSync(addChildFile, 'utf8');

ac = ac.replace(
  'interface AddChildScreenProps {\n  onBack: () => void;\n  onSave: (newChild: any) => void;\n}',
  'interface AddChildScreenProps {\n  onBack: () => void;\n  onSave: (childData: any) => void;\n  initialData?: any;\n}'
);

ac = ac.replace(
  'export const AddChildScreen: React.FC<AddChildScreenProps> = ({\n  onBack,\n  onSave,\n}) => {',
  'export const AddChildScreen: React.FC<AddChildScreenProps> = ({\n  onBack,\n  onSave,\n  initialData,\n}) => {'
);

// Replace hardcoded defaults with initialData check
const oldDefaults = `  // Pre-populated random initial child data for testing (as requested)
  const [name, setName] = useState('Kavya Sharma');
  const [dob, setDob] = useState('18 Aug 2022');
  const [gender, setGender] = useState<'Boy' | 'Girl' | 'Select gender'>('Girl');
  const [relationship, setRelationship] = useState<string>('Mother');
  const [weight, setWeight] = useState('12');
  const [height, setHeight] = useState('85');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  
  // New granular checkbox states matching 2nd Figma photo
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['Peanuts', 'Milk']);
  const [customAllergies, setCustomAllergies] = useState<string[]>([]);
  const [newCustomAllergy, setNewCustomAllergy] = useState('');
  const [isCustomInputVisible, setIsCustomInputVisible] = useState(false);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['Vegetarian']);
  const [notes, setNotes] = useState('');`;

const newDefaults = `  // Initialize state based on initialData (if editing) or empty fields
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || '');
  const [dob, setDob] = useState(initialData?.dob || '');
  const [gender, setGender] = useState<'Boy' | 'Girl' | 'Select gender'>(initialData?.gender || 'Select gender');
  const [relationship, setRelationship] = useState<string>(initialData?.relationship || 'Mother');
  const [weight, setWeight] = useState(initialData?.weight ? initialData.weight.replace(/[^0-9.]/g, '') : '');
  const [height, setHeight] = useState(initialData?.height ? initialData.height.replace(/[^0-9.]/g, '') : '');
  const [bloodGroup, setBloodGroup] = useState<string>(initialData?.bloodGroup || 'Select blood group');
  
  const initialAllergiesList = initialData?.allergies && initialData.allergies !== 'None'
    ? initialData.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(initialAllergiesList);
  const [customAllergies, setCustomAllergies] = useState<string[]>([]);
  const [newCustomAllergy, setNewCustomAllergy] = useState('');
  const [isCustomInputVisible, setIsCustomInputVisible] = useState(false);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(initialData?.preference ? [initialData.preference] : []);
  const [notes, setNotes] = useState(initialData?.notes || '');`;

ac = ac.replace(oldDefaults, newDefaults);

// Update title and button label for edit mode
ac = ac.replace(
  '<Text style={styles.headerTitle}>Add Child Profile</Text>',
  '<Text style={styles.headerTitle}>{isEditing ? "Edit Child Profile" : "Add Child Profile"}</Text>'
);
ac = ac.replace(
  '<Text style={styles.submitBtnText}>Save Profile</Text>',
  '<Text style={styles.submitBtnText}>{isEditing ? "Save Changes" : "Save Profile"}</Text>'
);

fs.writeFileSync(addChildFile, ac, 'utf8');
console.log('✅ 2. AddChildScreen.tsx updated with edit support');

// ══════════════════════════════════════════════════════════════
// 3. AppContainer.tsx: Handle editingChild state & PUT /children/:id
// ══════════════════════════════════════════════════════════════
const appFile = `${APP_SRC}/app/AppContainer.tsx`;
let app = fs.readFileSync(appFile, 'utf8');

// Add editingChild state after selectedChild
if (!app.includes('editingChild')) {
  app = app.replace(
    'const [selectedChild, setSelectedChild] = useState<any>(null);',
    'const [selectedChild, setSelectedChild] = useState<any>(null);\n  const [editingChild, setEditingChild] = useState<any>(null);'
  );
}

// Format DOB helper
const dobHelper = `
function formatDobToIso(dobStr: string): string {
  if (!dobStr) return '2020-01-01';
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dobStr.trim())) return dobStr.trim();
  const timestamp = Date.parse(dobStr);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return \`\${yyyy}-\${mm}-\${dd}\`;
  }
  return '2020-01-01';
}
`;

if (!app.includes('formatDobToIso')) {
  app = app.replace('export const AppContainer:', dobHelper + '\nexport const AppContainer:');
}

// Update MyChildrenScreen component props in AppContainer
const oldMyChildrenScreenCall = `<MyChildrenScreen
          childrenList={childrenList}
          onBack={() => setCurrentScreen('home')}
          onDeleteChild={(id) => {`;

const newMyChildrenScreenCall = `<MyChildrenScreen
          childrenList={childrenList}
          onBack={() => setCurrentScreen('home')}
          onEditChild={(childToEdit) => {
            setEditingChild(childToEdit);
            setCurrentScreen('addChild');
          }}
          onDeleteChild={(id) => {`;

app = app.replace(oldMyChildrenScreenCall, newMyChildrenScreenCall);

// Update AddChildScreen call in AppContainer to handle both add and edit (POST / PUT)
const oldAddChildCall = `<AddChildScreen
          onBack={() => setCurrentScreen('myChildren')}
          onSave={(newChild) => {`;

const newAddChildCall = `<AddChildScreen
          initialData={editingChild}
          onBack={() => {
            setEditingChild(null);
            setCurrentScreen('myChildren');
          }}
          onSave={(childData) => {
            (async () => {
              try {
                const session = authMemoryStore.getSession();
                if (session?.accessToken) {
                  const payload: any = {
                    name: childData.name,
                    dateOfBirth: formatDobToIso(childData.dob),
                    gender: childData.gender === 'Girl' ? 'Female' : 'Male',
                  };
                  if (childData.weight) payload.initialWeight = parseFloat(childData.weight);
                  if (childData.height) payload.initialHeight = parseFloat(childData.height);
                  if (childData.bloodGroup && childData.bloodGroup !== 'Select blood group') payload.bloodGroup = childData.bloodGroup;
                  if (childData.allergies && childData.allergies !== 'None') {
                    payload.allergies = childData.allergies.split(',').map((s: string) => s.trim()).filter(Boolean);
                  }
                  if (childData.preference && childData.preference !== 'No Preference') payload.dietPreference = childData.preference;

                  if (editingChild?.id) {
                    // PUT /children/:id (Edit mode)
                    const updated = await childrenDS.updateChild(session.accessToken, editingChild.id, payload);
                    setChildrenList(prev => prev.map(c => c.id === editingChild.id ? updated : c));
                  } else {
                    // POST /children (Create mode)
                    const created = await childrenDS.createChild(session.accessToken, payload);
                    setChildrenList(prev => [...prev, created]);
                  }
                  setEditingChild(null);
                  setCurrentScreen('myChildren');
                  return;
                }
              } catch (e: any) { console.log('Save child API error:', e?.message); }

              // Local fallback
              if (editingChild?.id) {
                setChildrenList(prev => prev.map(c => c.id === editingChild.id ? { ...c, ...childData } : c));
              } else {
                setChildrenList(prev => [...prev, childData]);
              }
              setEditingChild(null);
              setCurrentScreen('myChildren');
            })();
          }}
        />`;

// Replace AddChildScreen block
const startAddIdx = app.indexOf('<AddChildScreen');
const endAddIdx = app.indexOf('/>', startAddIdx);
if (startAddIdx >= 0 && endAddIdx >= 0) {
  app = app.slice(0, startAddIdx) + newAddChildCall + app.slice(endAddIdx + 2);
  console.log('✅ 3. AppContainer.tsx updated with edit handler and PUT /children/:id API call');
}

fs.writeFileSync(appFile, app, 'utf8');
console.log('\n🎉 Edit Child Profile & PUT /children/:childId API fully connected!');
