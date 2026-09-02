const fs = require('fs');

const addChildFile = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/AddChildScreen.tsx';
let content = fs.readFileSync(addChildFile, 'utf8');

// 1. Add DatePickerDrawer component definition before CustomSelectionModal
const datePickerComponent = `
interface DatePickerDrawerProps {
  visible: boolean;
  value: string;
  onConfirm: (formattedDate: string) => void;
  onClose: () => void;
}

const DatePickerDrawer: React.FC<DatePickerDrawerProps> = ({
  visible,
  value,
  onConfirm,
  onClose,
}) => {
  const parseInit = () => {
    if (value) {
      const ts = Date.parse(value);
      if (!isNaN(ts)) {
        const d = new Date(ts);
        return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
      }
    }
    return { year: 2022, month: 7, day: 18 };
  };

  const init = parseInit();
  const [selectedYear, setSelectedYear] = useState<number>(init.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(init.month);
  const [selectedDay, setSelectedDay] = useState<number>(init.day);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = Array.from({ length: 15 }, (_, i) => 2026 - i);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = months[selectedMonth] || 'Jan';
  const formattedPreview = \`\${selectedDay} \${monthName} \${selectedYear}\`;
  
  const calcAge = () => {
    const birth = new Date(selectedYear, selectedMonth, selectedDay);
    const now = new Date();
    let yearsOld = now.getFullYear() - birth.getFullYear();
    let monthsOld = now.getMonth() - birth.getMonth();
    if (monthsOld < 0 || (monthsOld === 0 && now.getDate() < birth.getDate())) {
      yearsOld--;
      monthsOld += 12;
    }
    if (yearsOld <= 0 && monthsOld <= 0) return 'Newborn';
    if (yearsOld <= 0) return \`\${monthsOld} month\${monthsOld > 1 ? 's' : ''} old\`;
    if (monthsOld === 0) return \`\${yearsOld} year\${yearsOld > 1 ? 's' : ''} old\`;
    return \`\${yearsOld} yr\${yearsOld > 1 ? 's' : ''} \${monthsOld} mo\${monthsOld > 1 ? 's' : ''} old\`;
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <TouchableOpacity style={modalStyles.dismiss} activeOpacity={1} onPress={onClose} />
        <View style={[modalStyles.sheet, { maxHeight: '85%' }]}>
          <View style={modalStyles.header}>
            <View>
              <Text style={modalStyles.title}>Select Date of Birth</Text>
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                Pick your child's birth date
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Text style={modalStyles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: '#FFF5F0', borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: '#FFE0D3', alignItems: 'center', marginVertical: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 }}>SELECTED BIRTH DATE</Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#FF521B', marginTop: 2 }}>{formattedPreview}</Text>
              <View style={{ backgroundColor: '#FF521B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>⚡ {calcAge()}</Text>
              </View>
            </View>

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginTop: 8, marginBottom: 6 }}>QUICK AGE PRESETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[
                { label: 'Newborn (2026)', y: 2026, m: 0, d: 1 },
                { label: '1 Year (2025)', y: 2025, m: 0, d: 15 },
                { label: '2 Years (2024)', y: 2024, m: 0, d: 15 },
                { label: '3 Years (2023)', y: 2023, m: 0, d: 15 },
                { label: '4 Years (2022)', y: 2022, m: 7, d: 18 },
                { label: '5 Years (2021)', y: 2021, m: 0, d: 15 },
              ].map(preset => (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => {
                    setSelectedYear(preset.y);
                    setSelectedMonth(preset.m);
                    setSelectedDay(preset.d);
                  }}
                  style={{
                    backgroundColor: selectedYear === preset.y ? '#FF521B' : '#F1F5F9',
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 14,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: selectedYear === preset.y ? '#FFFFFF' : '#475569' }}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginTop: 14, marginBottom: 6 }}>YEAR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {years.map(y => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setSelectedYear(y)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: selectedYear === y ? '#FF521B' : '#F8FAFC',
                    borderWidth: 1,
                    borderColor: selectedYear === y ? '#FF521B' : '#E2E8F0',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '800', color: selectedYear === y ? '#FFFFFF' : '#0F172A' }}>
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginTop: 14, marginBottom: 6 }}>MONTH</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {months.map((m, idx) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelectedMonth(idx)}
                  style={{
                    width: '23%',
                    paddingVertical: 9,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: selectedMonth === idx ? '#FF521B' : '#F8FAFC',
                    borderWidth: 1,
                    borderColor: selectedMonth === idx ? '#FF521B' : '#E2E8F0',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: selectedMonth === idx ? '#FFFFFF' : '#0F172A' }}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginTop: 14, marginBottom: 6 }}>DAY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {days.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setSelectedDay(d)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedDay === d ? '#FF521B' : '#F8FAFC',
                    borderWidth: 1,
                    borderColor: selectedDay === d ? '#FF521B' : '#E2E8F0',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '800', color: selectedDay === d ? '#FFFFFF' : '#0F172A' }}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                const mm = String(selectedMonth + 1).padStart(2, '0');
                const dd = String(selectedDay).padStart(2, '0');
                onConfirm(\`\${selectedYear}-\${mm}-\${dd}\`);
                onClose();
              }}
              style={{ backgroundColor: '#FF521B', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 20, marginBottom: 24 }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>Confirm Date of Birth</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
`;

if (!content.includes('DatePickerDrawer')) {
  content = content.replace('interface CustomSelectionModalProps {', datePickerComponent + '\ninterface CustomSelectionModalProps {');
}

// 2. Add isDobOpen state inside AddChildScreen
content = content.replace(
  '  const [isGenderOpen, setIsGenderOpen] = useState(false);',
  '  const [isDobOpen, setIsDobOpen] = useState(false);\n  const [isGenderOpen, setIsGenderOpen] = useState(false);'
);

// 3. Update DOB Form Row UI to be clickable with live Age Badge
const oldDobRow = `          {/* Date of Birth Row */}
          <View style={styles.formRow}>
            <View style={styles.rowIconWrap}>
              <CalendarOutlineIcon color={getIconColor(dob.trim() !== '')} />
            </View>
            <View style={styles.rowContentWrap}>
              <Text style={styles.fieldLabel}>Date of Birth <Text style={styles.asterisk}>*</Text></Text>
              <TextInput
                style={styles.textInput}
                placeholder="DD MMM YYYY"
                placeholderTextColor="#94A3B8"
                value={dob}
                onChangeText={setDob}
              />
            </View>
          </View>`;

const newDobRow = `          {/* Date of Birth Row (Modern Interactive Selector) */}
          <TouchableOpacity
            style={styles.formRow}
            onPress={() => setIsDobOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.rowIconWrap}>
              <CalendarOutlineIcon color={getIconColor(dob.trim() !== '')} />
            </View>
            <View style={styles.rowContentWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 4 }}>
                <Text style={styles.fieldLabel}>Date of Birth <Text style={styles.asterisk}>*</Text></Text>
                {dob.trim() !== '' && (
                  <View style={{ backgroundColor: '#FFF5F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FFE2D5' }}>
                    <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#FF521B' }}>
                      ⚡ {calculateAgeText(dob, gender)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.selectorValueText, !dob.trim() && styles.selectorPlaceholderText]}>
                {dob.trim() ? dob : 'Tap to select Date of Birth'}
              </Text>
            </View>
            <GrayChevronDownSvg />
          </TouchableOpacity>`;

if (content.includes(oldDobRow)) {
  content = content.replace(oldDobRow, newDobRow);
  console.log('✅ Updated Date of Birth Row UI');
} else {
  console.log('⚠️ Could not find exact oldDobRow, checking alternative match...');
}

// 4. Render DatePickerDrawer at bottom of AddChildScreen
const oldDrawers = `<SelectionDrawer
        visible={isGenderOpen}`;

const newDatePickerModal = `<DatePickerDrawer
        visible={isDobOpen}
        value={dob}
        onConfirm={(newDate) => setDob(newDate)}
        onClose={() => setIsDobOpen(false)}
      />
      <SelectionDrawer
        visible={isGenderOpen}`;

if (!content.includes('DatePickerDrawer\n        visible={isDobOpen}') && content.includes(oldDrawers)) {
  content = content.replace(oldDrawers, newDatePickerModal);
  console.log('✅ Added DatePickerDrawer modal render');
}

fs.writeFileSync(addChildFile, content, 'utf8');
console.log('Done updating Date of Birth UI!');
