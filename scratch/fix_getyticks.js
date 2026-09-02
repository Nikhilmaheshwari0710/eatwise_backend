const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const badYTicks = `  const getYTicks = (metric = chartMetric) => {
    if (metric === 'Weight') return ? '16', '12', '8', '4', '0'];
    if (metric === 'Height') return ? '104', '88', '72', '56', '40'];
    return ? '22', '19', '16', '13', '10'];
  };`;

const goodYTicks = `  const getYTicks = (metric = chartMetric) => {
    if (metric === 'Weight') return ['20', '16', '12', '8', '4', '0'];
    if (metric === 'Height') return ['120', '104', '88', '72', '56', '40'];
    return ['25', '22', '19', '16', '13', '10'];
  };`;

content = content.replace(badYTicks, goodYTicks);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed getYTicks!');
