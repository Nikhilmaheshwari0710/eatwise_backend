const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('const getBmiCategoryInf?= (bmi: number) => {', 'const getBmiCategoryInfo = (bmi: number) => {');
content = content.replace('const categoryInf?= getBmiCategoryInfo(bmiValNum);', 'const categoryInfo = getBmiCategoryInfo(bmiValNum);');
content = content.replace('<Text style={styles.metricPercentileRed}>{childBmi ? " ? "   categoryInfo.bmiPercentile :', '<Text style={styles.metricPercentileRed}>{childBmi !== "—" ? categoryInfo.bmiPercentile : "Not Recorded"}</Text>');
content = content.replace(/<Text style=\{\{ fontSize: 13, fontWeight: '800', color: '#166534', marginBottom: 8 \}\}>\?\? Ped/g, "<Text style={{ fontSize: 13, fontWeight: '800', color: '#166534', marginBottom: 8 }}>Ped");
content = content.replace(/<Text style=\{\{ fontSize: 13, fontWeight: '800', color: '#1E40AF', marginBottom: 8 \}\}>\?\? Bon/g, "<Text style={{ fontSize: 13, fontWeight: '800', color: '#1E40AF', marginBottom: 8 }}>Bon");
content = content.replace(/<Text style=\{\{ fontSize: 18, color: '#94A3B8', fontWeight: '700' \}\}>\?<\/Text>/g, "<Text style={{ fontSize: 18, color: '#94A3B8', fontWeight: '700' }}>x</Text>");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed exact lines!');
