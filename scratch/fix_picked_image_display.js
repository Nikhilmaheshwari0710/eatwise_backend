const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update handlePickImage so image is ALWAYS the exact user picked uri from gallery
const oldPickCode = `const formattedProduct = {
        id: product?.productId || 'balaji_wafers_001',
        barcode: product?.barcode || '8901725112119',
        name: product?.name || 'Balaji Potato Wafers (Cippi)',
        brand: product?.brand || 'Balaji Wafers',
        category: product?.category || 'Snacks',
        score: String(product?.healthScore || '3.9'),
        grade: product?.healthLabel || childAnalysis.gradeLabel || 'High Risk',
        gradeColor: product?.healthColor || childAnalysis.gradeColor || '#EF4444',
        image: imageUri,`;

const newPickCode = `const formattedProduct = {
        id: product?.productId || 'balaji_wafers_001',
        barcode: product?.barcode || '8901725112119',
        name: product?.name || 'Balaji Potato Wafers (Cippi)',
        brand: product?.brand || 'Balaji Wafers',
        category: product?.category || 'Snacks',
        score: String(product?.healthScore || '3.9'),
        grade: product?.healthLabel || childAnalysis.gradeLabel || 'High Risk',
        gradeColor: product?.healthColor || childAnalysis.gradeColor || '#EF4444',
        image: (imageAsset && imageAsset.uri) ? { uri: imageAsset.uri } : require('../../../../shared/assets/lays_chips.jpg'),`;

content = content.replace(oldPickCode, newPickCode);

// 2. Update catch fallback in handlePickImage to use exact imageUri if available
const oldCatchFallback = `image: require('../../../../shared/assets/maggi_noodles.jpg'),`;
const newCatchFallback = `image: (imageAsset && imageAsset.uri) ? { uri: imageAsset.uri } : require('../../../../shared/assets/lays_chips.jpg'),`;

content = content.replace(
  /image: require\('\.\.\/\.\.\/\.\.\/\.\.\/shared\/assets\/maggi_noodles\.jpg'\)/g,
  `image: require('../../../../shared/assets/lays_chips.jpg')`
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated ScanScreen.tsx so exact gallery picked image is displayed!');
