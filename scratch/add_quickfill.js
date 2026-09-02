const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/auth/presentation/screens/LoginScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Insert Quick-Fill button before the formSection
const quickFillBtn = `
      {/* ===== DEV QUICK-FILL ===== */}
      <TouchableOpacity
        style={styles.quickFillBtn}
        onPress={() => { setEmail('dp150875@gmail.com'); setPassword('Dp@123'); }}
        activeOpacity={0.75}
      >
        <Text style={styles.quickFillText}>⚡ Quick Fill Test Credentials</Text>
      </TouchableOpacity>
      {/* ========================== */}

      `;

content = content.replace('<View style={styles.formSection}>', quickFillBtn + '<View style={styles.formSection}>');

// 2. Add styles at end before last });
const styleInsert = `
  quickFillBtn: {
    alignSelf: 'center',
    backgroundColor: '#FFF4EE',
    borderWidth: 1.2,
    borderColor: '#FFCDB5',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  quickFillText: {
    color: '#FF521B',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },`;

// Insert before last }); in the file
const lastIdx = content.lastIndexOf('});');
content = content.slice(0, lastIdx) + styleInsert + '\n' + content.slice(lastIdx);

fs.writeFileSync(file, content, 'utf8');
console.log('Quick-fill button added to LoginScreen!');
