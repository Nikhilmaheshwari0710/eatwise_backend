const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Text style={styles.analysisHeroCategory}>Breakfast Cereal</Text>',
  '<Text style={styles.analysisHeroCategory}>{scannedProduct.category || "Snacks"}</Text>'
);

content = content.replace(
  '<Text style={[styles.analysisBadgeText, { color: \'#F97316\' }]}>Breakfast Cereals</Text>',
  '<Text style={[styles.analysisBadgeText, { color: \'#F97316\' }]}>{scannedProduct.category || "Snacks"}</Text>'
);

content = content.replace(
  'Net Weight: 250 g     Brand: {scannedProduct.brand}',
  'Net Weight: {scannedProduct.netWeight || "30g"}     Brand: {scannedProduct.brand}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated ScanScreen.tsx header category & net weight to be 100% dynamic!');
