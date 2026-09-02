const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix line 283 - 292
content = content.replace(
  `      const bmiVal = (!isNaN(wN) && !isNaN(hN) && hN > 0) ? (wN / (hN * hN)).toFixed(1) : ' ? ';
      return [
        {
          id: '1',
          date: 'Initial Record',
          age: child.ageText ? 'Initial',
          weight: initialW ? initialW : ' ? ',
          height: initialH ? initialH : ' ? ',
          bmi: bmiVal,
          note: 'Initial profile measurement',
          deltaW: 'Initial',
          deltaH: 'Initial',
          status: 'Healthy Growth',
        }
      ];`,
  `      const bmiVal = (!isNaN(wN) && !isNaN(hN) && hN > 0) ? (wN / (hN * hN)).toFixed(1) : '—';
      return [
        {
          id: '1',
          date: 'Initial Record',
          age: child.ageText || 'Initial',
          weight: initialW ? initialW : '—',
          height: initialH ? initialH : '—',
          bmi: bmiVal,
          note: 'Initial profile measurement',
          deltaW: 'Initial',
          deltaH: 'Initial',
          status: 'Healthy Growth',
        }
      ];`
);

// General cleanup for any orphaned ' ? ' or missing ':' in ternaries
content = content.replace(/age:\s*child\.ageText\s*\?\s*'Initial',/g, "age: child.ageText || 'Initial',");
content = content.replace(/:\s*' \? '/g, ": '—'");

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Validation & fix applied to GrowthInfoScreen.tsx');
