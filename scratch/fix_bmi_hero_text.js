const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const badBmiHero = `<Text style={{ fontSize: 28, fontWeight: '900', color: '#E11D48', marginTop: 4 }}>{childBmi} <Text style={{ fontSize: 14, fontWeight: '600', color: '#94A3B8' }}>kg/m2`;
const goodBmiHero = `<Text style={{ fontSize: 28, fontWeight: '900', color: '#E11D48', marginTop: 4 }}>{childBmi} <Text style={{ fontSize: 14, fontWeight: '600', color: '#94A3B8' }}>kg/m²</Text></Text>`;

content = content.replace(badBmiHero, goodBmiHero);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed BMI hero text!');
