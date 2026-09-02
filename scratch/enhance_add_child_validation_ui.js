const fs = require('fs');

const addChildFile = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/AddChildScreen.tsx';
let content = fs.readFileSync(addChildFile, 'utf8');

// 1. Update Header Title to clearly distinguish Edit vs Add mode
content = content.replace(
  '<Text style={styles.headerTitle}>{isEditing ? "Edit Child Profile" : "Add Child Profile"}</Text>',
  '<Text style={styles.headerTitle}>{isEditing ? `Edit Child: ${initialData?.name || ""}` : "Add Child Profile"}</Text>'
);

// 2. Add red border styling logic for required fields when showErrors is true
// Name row
content = content.replace(
  'style={styles.formRow}',
  'style={[styles.formRow, showErrors && !name.trim() && { borderColor: "#EF4444", borderWidth: 1.5 }]}'
);

// DOB row
content = content.replace(
  'onPress={() => setIsDobOpen(true)}',
  'style={[styles.formRow, showErrors && !dob.trim() && { borderColor: "#EF4444", borderWidth: 1.5 }]}\n            onPress={() => setIsDobOpen(true)}'
);

// Gender row
content = content.replace(
  'onPress={() => setIsGenderOpen(true)}',
  'style={[styles.formRow, showErrors && (gender === "Select gender" || !gender) && { borderColor: "#EF4444", borderWidth: 1.5 }]}\n            onPress={() => setIsGenderOpen(true)}'
);

// Relationship row
content = content.replace(
  'onPress={() => setIsRelationOpen(true)}',
  'style={[styles.formRow, showErrors && (relationship === "Select relationship" || !relationship) && { borderColor: "#EF4444", borderWidth: 1.5 }]}\n            onPress={() => setIsRelationOpen(true)}'
);

fs.writeFileSync(addChildFile, content, 'utf8');
console.log('✅ Enhanced AddChildScreen with mode title and red error borders!');
