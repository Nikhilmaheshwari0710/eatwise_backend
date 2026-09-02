const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCard = `        {/* Child Selector Card */}
        <View style={styles.childSelectorCard}>
          <Image source={child.avatar} style={styles.childAvatar} />
          
          <View style={styles.childInfoWrap}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAgeText}>{child.ageText || (child.gender ? \`Child \\u2022 \${child.gender}\` : 'Child Profile')}</Text>
            
            <View style={styles.dobRow}>
              <CalendarIcon size={12} color="#FF521B" />
              <Text style={styles.dobText}>{child.dateOfBirth || child.dob || 'Not specified'}</Text>
            </View>
          </View>
          
          <Text style={styles.selectorChevron}>v</Text>
        </View>`;

const newCard = `        {/* Child Selector Card (Interactive Switcher) */}
        <TouchableOpacity
          style={styles.childSelectorCard}
          activeOpacity={0.8}
          onPress={() => setIsChildSwitchOpen(true)}
        >
          <Image source={child.avatar} style={styles.childAvatar} />
          
          <View style={styles.childInfoWrap}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAgeText}>{child.ageText || (child.gender ? \`Child \\u2022 \${child.gender}\` : 'Child Profile')}</Text>
            
            <View style={styles.dobRow}>
              <CalendarIcon size={12} color="#FF521B" />
              <Text style={styles.dobText}>{child.dateOfBirth || child.dob || 'Not specified'}</Text>
            </View>
          </View>
          
          <Text style={styles.selectorChevron}>v</Text>
        </TouchableOpacity>`;

content = content.replace(
  '<View style={styles.childSelectorCard}>',
  '<TouchableOpacity style={styles.childSelectorCard} activeOpacity={0.8} onPress={() => setIsChildSwitchOpen(true)}>'
);

// Replace closing tag of childSelectorCard
const startCard = content.indexOf('onPress={() => setIsChildSwitchOpen(true)}>');
if (startCard >= 0) {
  const closingIdx = content.indexOf('</View>', startCard);
  if (closingIdx >= 0) {
    content = content.slice(0, closingIdx) + '</TouchableOpacity>' + content.slice(closingIdx + 7);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Made Child Selector Card Touchable!');
