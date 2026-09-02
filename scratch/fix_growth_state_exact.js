const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace lines 194 and 195
content = content.replace(
  "const [childWeight, setChildWeight] = useState(child.weight || '12 kg');",
  "const initialW = (child.weight && child.weight.trim()) ? child.weight : '';\n  const [childWeight, setChildWeight] = useState(initialW);"
);

content = content.replace(
  "const [childHeight, setChildHeight] = useState(child.height || '85 cm');",
  "const initialH = (child.height && child.height.trim()) ? child.height : '';\n  const [childHeight, setChildHeight] = useState(initialH);"
);

// Replace childBmi default '16.6' with '—'
content = content.replace(
  ": '16.6';",
  ": '—';"
);

// Replace hardcoded initial entries array
const oldEntriesStart = "  const [entries, setEntries] = useState([";
const oldEntriesEnd = "  ]);\n\n  const handleSaveLog = () => {";

const newEntriesCode = `  const getInitialEntries = () => {
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

  const [entries, setEntries] = useState(getInitialEntries);

  const handleSaveLog = () => {`;

const startIdx = content.indexOf(oldEntriesStart);
const endIdx = content.indexOf(oldEntriesEnd);

if (startIdx >= 0 && endIdx >= 0) {
  content = content.slice(0, startIdx) + newEntriesCode + content.slice(endIdx + oldEntriesEnd.length);
  console.log('✅ Successfully replaced entries state with dynamic initial entries!');
} else {
  console.log('⚠️ Could not find exact entries block indices:', startIdx, endIdx);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done exact fix!');
