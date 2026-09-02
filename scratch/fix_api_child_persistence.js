const fs = require('fs');

const appFile = 'd:/backup project/eatwise/eatwise_app/src/app/AppContainer.tsx';
let app = fs.readFileSync(appFile, 'utf8');

// Replace AddChildScreen block in AppContainer.tsx
const oldBlockStart = `<AddChildScreen
          key={editingChild?.id || "newChild"}
          initialData={editingChild}
          onBack={() => {
            setEditingChild(null);
            setCurrentScreen('myChildren');
          }}
          onSave={(childData) => {`;

const oldBlockEnd = `              // Local fallback
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

const newBlock = `<AddChildScreen
          key={editingChild?.id || "newChild"}
          initialData={editingChild}
          onBack={() => {
            setEditingChild(null);
            setCurrentScreen('myChildren');
          }}
          onSave={(childData) => {
            (async () => {
              try {
                const session = authMemoryStore.getSession();
                if (!session?.accessToken) {
                  Alert.alert('Session Expired', 'Please log in again.');
                  return;
                }

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
                  await childrenDS.updateChild(session.accessToken, editingChild.id, payload);
                } else {
                  await childrenDS.createChild(session.accessToken, payload);
                }

                // Always reload from server so data is permanently synced
                await loadChildren();
                setEditingChild(null);
                setCurrentScreen('myChildren');
              } catch (e: any) {
                console.log('Save child API error:', e?.message);
                Alert.alert('Error Saving Profile', e?.message || 'Could not save child to database.');
              }
            })();
          }}
        />`;

const startIdx = app.indexOf(oldBlockStart);
const endIdx = app.indexOf(oldBlockEnd);

if (startIdx >= 0 && endIdx >= 0) {
  app = app.slice(0, startIdx) + newBlock + app.slice(endIdx + oldBlockEnd.length);
  fs.writeFileSync(appFile, app, 'utf8');
  console.log('✅ Updated AddChildScreen save block in AppContainer.tsx with MongoDB persistence!');
} else {
  console.log('⚠️ Could not find exact boundaries for AddChildScreen block in AppContainer.tsx:', startIdx, endIdx);
}
