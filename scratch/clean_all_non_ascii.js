const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/getBmiCategoryInf[^\x00-\x7F]*=/g, 'getBmiCategoryInfo =');
content = content.replace(/categoryInf[^\x00-\x7F]*=/g, 'categoryInfo =');
content = content.replace(/categoryInf[^\x00-\x7F]*\./g, 'categoryInfo.');
content = content.replace(/<Text style=\{styles\.metricPercentileRed\}>[\s\S]*?<\/Text>/, '<Text style={styles.metricPercentileRed}>{childBmi !== "—" ? categoryInfo.bmiPercentile : "Not Recorded"}</Text>');
content = content.replace(/[^\x00-\x7F]+\s*Ped/g, 'Ped');
content = content.replace(/[^\x00-\x7F]+\s*Bon/g, 'Bon');
content = content.replace(/<Text style=\{\{ fontSize: 18, color: '#94A3B8', fontWeight: '700' \}\}>[^\x00-\x7F]+<\/Text>/g, "<Text style={{ fontSize: 18, color: '#94A3B8', fontWeight: '700' }}>x</Text>");

// Remove any leftover non-ASCII characters that aren't dash
content = content.replace(/[^\x00-\x7F]/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Cleaned all non-ASCII characters!');
