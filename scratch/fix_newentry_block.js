const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const badEntry = `    const newEntry = {
      id: Date.now().toString(),
      date: newLogDate ? 'Today' ? 'Today, ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : newLogDate,
      age: child.ageText ? '1 Year',
      weight: wVal,
      height: hVal,
      bmi: bmiVal,
      note: newLogNotes ? 'Home measurement',`;

const goodEntry = `    const newEntry = {
      id: Date.now().toString(),
      date: newLogDate === 'Today' ? ('Today, ' + new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })) : newLogDate,
      age: child.ageText || 'Child',
      weight: wVal,
      height: hVal,
      bmi: bmiVal,
      note: newLogNotes || 'Home measurement',`;

content = content.replace(badEntry, goodEntry);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed newEntry block!');
