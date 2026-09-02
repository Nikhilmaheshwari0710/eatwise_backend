const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix state initialization for weight & height, initial entries, and modal initial values
const oldStateCode = `  // Extract metrics from child profile
  const [childWeight, setChildWeight] = useState(child.weight || '12 kg');
  const [childHeight, setChildHeight] = useState(child.height || '85 cm');

  // Dynamic BMI Calculation
  const weightNum = parseFloat(childWeight);
  const heightNum = parseFloat(childHeight) / 100;
  const childBmi = !isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0
    ? (weightNum / (heightNum * heightNum)).toFixed(1)
    : '16.6';

  // Growth history entries state
  const [entries, setEntries] = useState([
    { id: '1', date: '18 May 2024', age: '1 Year 9 Mos', weight: '12 kg', height: '85 cm', bmi: '16.6', note: 'Routine Pediatric checkup \\u2022 All normal', deltaW: '+0.5 kg', deltaH: '+2.0 cm', status: 'Healthy Growth' },
    { id: '2', date: '15 Feb 2024', age: '1 Year 6 Mos', weight: '11.5 kg', height: '83 cm', bmi: '16.7', note: 'Vaccination visit \\u2022 Steady growth', deltaW: '+0.4 kg', deltaH: '+2.5 cm', status: 'Healthy Growth' },
    { id: '3', date: '12 Nov 2023', age: '1 Year 3 Mos', weight: '11.1 kg', height: '80.5 cm', bmi: '17.1', note: 'Healthy appetite & good motor activity', deltaW: '+0.6 kg', deltaH: '+3.0 cm', status: 'Healthy Growth' },
    { id: '4', date: '18 Aug 2023', age: '1 Year (12 Mos)', weight: '10.5 kg', height: '77.5 cm', bmi: '17.5', note: '1st Birthday checkup milestone', deltaW: '+0.8 kg', deltaH: '+3.5 cm', status: 'Healthy Growth' },
    { id: '5', date: '15 May 2023', age: '9 Months', weight: '9.7 kg', height: '74 cm', bmi: '17.7', note: 'Weaning foods introduced smoothly', deltaW: '+1.2 kg', deltaH: '+4.0 cm', status: 'Healthy Growth' },
  ]);`;

const newStateCode = `  // Extract metrics from child profile without hardcoded fallbacks
  const initialW = (child.weight && child.weight.trim()) ? child.weight : '';
  const initialH = (child.height && child.height.trim()) ? child.height : '';

  const [childWeight, setChildWeight] = useState(initialW);
  const [childHeight, setChildHeight] = useState(initialH);

  // Dynamic BMI Calculation
  const weightNum = parseFloat(childWeight);
  const heightNum = parseFloat(childHeight) / 100;
  const childBmi = !isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0
    ? (weightNum / (heightNum * heightNum)).toFixed(1)
    : '—';

  // Initial Modal Inputs
  const [newLogWeight, setNewLogWeight] = useState(weightNum ? weightNum.toString() : '12.0');
  const [newLogHeight, setNewLogHeight] = useState(heightNum ? (heightNum * 100).toString() : '85.0');
  const [newLogNotes, setNewLogNotes] = useState('Routine measurement');

  // Growth history entries state initialized cleanly
  const getInitialEntries = () => {
    if (initialW || initialH) {
      const wN = parseFloat(initialW);
      const hN = parseFloat(initialH) / 100;
      const bmiVal = (!isNaN(wN) && !isNaN(hN) && hN > 0) ? (wN / (hN * hN)).toFixed(1) : '—';
      return [
        {
          id: '1',
          date: 'Initial Record',
          age: child.ageText || 'Initial',
          weight: initialW || '—',
          height: initialH || '—',
          bmi: bmiVal,
          note: 'Initial profile measurement',
          deltaW: 'Initial',
          deltaH: 'Initial',
          status: 'Healthy Growth',
        }
      ];
    }
    return [];
  };

  const [entries, setEntries] = useState(getInitialEntries);`;

if (content.includes("const [childWeight, setChildWeight] = useState(child.weight || '12 kg');")) {
  content = content.replace(oldStateCode, newStateCode);
  console.log('✅ Updated state initialization');
} else {
  console.log('⚠️ Could not find exact oldStateCode, trying regex/flexible match...');
}

// 2. Fix handleSaveLog logic for clean delta calculations
const oldSaveLog = `    const newEntry = {
      id: Date.now().toString(),
      date: newLogDate === 'Today' ? 'Today, ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : newLogDate,
      age: child.ageText || '1 Year',
      weight: wVal,
      height: hVal,
      bmi: bmiVal,
      note: newLogNotes || 'Home measurement',
      deltaW: \`+\${(wN - parseFloat(childWeight || '12')).toFixed(1)} kg\`,
      deltaH: \`+\${(parseFloat(newLogHeight) - parseFloat(childHeight || '85')).toFixed(1)} cm\`,
      status: 'Healthy Growth',
    };`;

const newSaveLog = `    const prevW = parseFloat(childWeight);
    const prevH = parseFloat(childHeight);
    const dW = !isNaN(prevW) ? \`+\${(wN - prevW).toFixed(1)} kg\` : 'Initial';
    const dH = !isNaN(prevH) ? \`+\${(parseFloat(newLogHeight) - prevH).toFixed(1)} cm\` : 'Initial';

    const newEntry = {
      id: Date.now().toString(),
      date: newLogDate === 'Today' ? 'Today, ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : newLogDate,
      age: child.ageText || '1 Year',
      weight: wVal,
      height: hVal,
      bmi: bmiVal,
      note: newLogNotes || 'Home measurement',
      deltaW: dW,
      deltaH: dH,
      status: 'Healthy Growth',
    };`;

if (content.includes('deltaW: `+${(wN - parseFloat(childWeight ||')) {
  content = content.replace(oldSaveLog, newSaveLog);
  console.log('✅ Updated handleSaveLog calculation');
}

// 3. Fix Overview Tab Cards rendering (Weight, Height, BMI, Status)
// Replace hardcoded values with fallbacks if empty
content = content.replace(
  '<Text style={styles.metricValue}>{childWeight}</Text>',
  '<Text style={styles.metricValue}>{childWeight || "—"}</Text>'
);
content = content.replace(
  '<Text style={styles.metricPercentile}>45th Percentile</Text>',
  '<Text style={styles.metricPercentile}>{childWeight ? "50th Percentile" : "Not Recorded"}</Text>'
);

content = content.replace(
  '<Text style={styles.metricValue}>{childHeight}</Text>',
  '<Text style={styles.metricValue}>{childHeight || "—"}</Text>'
);
content = content.replace(
  '<Text style={styles.metricPercentileBlue}>40th Percentile</Text>',
  '<Text style={styles.metricPercentileBlue}>{childHeight ? "50th Percentile" : "Not Recorded"}</Text>'
);

content = content.replace(
  '<Text style={styles.metricPercentileRed}>50th Percentile</Text>',
  '<Text style={styles.metricPercentileRed}>{childBmi !== "—" ? "50th Percentile" : "Not Recorded"}</Text>'
);

content = content.replace(
  '<Text style={[styles.metricValue, styles.statusGreenText]}>Normal</Text>',
  '<Text style={[styles.metricValue, styles.statusGreenText]}>{(childWeight && childHeight) ? "Normal" : "Pending"}</Text>'
);
content = content.replace(
  '<Text style={styles.metricStatusLabel}>Healthy Growth</Text>',
  '<Text style={styles.metricStatusLabel}>{(childWeight && childHeight) ? "Healthy Growth" : "No Data"}</Text>'
);

// 4. Handle Empty Entries list in Overview tab & History tab
const oldEntriesMap = `{entries.slice(0, 3).map((ent) => (`;
const newEntriesMap = `{entries.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>No growth entries recorded yet</Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Tap "+ Log Measurement" to record child growth.</Text>
                </View>
              ) : entries.slice(0, 3).map((ent) => (`;

if (content.includes(oldEntriesMap)) {
  content = content.replace(oldEntriesMap, newEntriesMap);
  console.log('✅ Added empty state view for Overview entries');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done patching GrowthInfoScreen.tsx!');
