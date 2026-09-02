const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix identifier names
content = content.replace(/getBmiCategoryInf\?/g, 'getBmiCategoryInfo');
content = content.replace(/getBmiCategoryInf\=/g, 'getBmiCategoryInfo =');
content = content.replace(/getBmiCategoryInf\(/g, 'getBmiCategoryInfo(');
content = content.replace(/categoryInf\?/g, 'categoryInfo');
content = content.replace(/categoryInf\=/g, 'categoryInfo =');
content = content.replace(/categoryInf\./g, 'categoryInfo.');
content = content.replace(/N\?Data/g, 'No Data');
content = content.replace(/N\?Growth Data Yet/g, 'No Growth Data Yet');
content = content.replace(/t\?record/g, 'to record');

// Fix ternaries missing '?'
content = content.replace(/\(child\.weight && child\.weight\.trim\(\)\)\s+child\.weight : ''/g, "(child.weight && child.weight.trim()) ? child.weight : ''");
content = content.replace(/\(child\.height && child\.height\.trim\(\)\)\s+child\.height : ''/g, "(child.height && child.height.trim()) ? child.height : ''");
content = content.replace(/\(hasValidW && hasValidH\)\s+\(wNum \/ \(hNum \* hNum\)\) : 0/g, "(hasValidW && hasValidH) ? (wNum / (hNum * hNum)) : 0");
content = content.replace(/bmiValNum > 0\s+bmiValNum\.toFixed\(1\) : '-'/g, "bmiValNum > 0 ? bmiValNum.toFixed(1) : '-'");
content = content.replace(/\(!isNaN\(wN\) && !isNaN\(hN\) && hN > 0\)\s+\(wN \/ \(hN \* hNum\)\)/g, "(!isNaN(wN) && !isNaN(hN) && hN > 0) ? (wN / (hN * hN))");
content = content.replace(/weight: initialW \?/g, "weight: initialW ? initialW :");
content = content.replace(/height: initialH \?/g, "height: initialH ? initialH :");
content = content.replace(/!isNaN\(prevW\)\s+`\+\$\{/g, "!isNaN(prevW) ? `+${");
content = content.replace(/!isNaN\(prevH\)\s+`\+\$\{/g, "!isNaN(prevH) ? `+${");
content = content.replace(/\(!isNaN\(valW\) && valW > 0 && valW < 50\)\s+valW : 12/g, "(!isNaN(valW) && valW > 0 && valW < 50) ? valW : 12");
content = content.replace(/\(!isNaN\(valH\) && valH > 30 && valH < 150\)\s+valH : 85/g, "(!isNaN(valH) && valH > 30 && valH < 150) ? valH : 85");
content = content.replace(/\(!isNaN\(valB\) && valB > 5 && valB < 40\)\s+valB : 16\.6/g, "(!isNaN(valB) && valB > 5 && valB < 40) ? valB : 16.6");
content = content.replace(/idx === yGridLines\.length - 1\s+1\.5 : 1/g, "idx === yGridLines.length - 1 ? 1.5 : 1");
content = content.replace(/idx === yGridLines\.length - 1\s+undefined : '3,3'/g, "idx === yGridLines.length - 1 ? undefined : '3,3'");
content = content.replace(/childWeight \? "-"/g, "childWeight ? childWeight : '-'");

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Restored all ternaries and identifiers in GrowthInfoScreen.tsx!');
