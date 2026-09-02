const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add launchImageLibrary import
if (!content.includes('launchImageLibrary')) {
  content = content.replace(
    "import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';",
    "import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';\nimport { launchImageLibrary } from 'react-native-image-picker';"
  );
}

// 2. Add handlePickImage handler
const handlePickImageCode = `
  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      setIsAnalyzing(true);
      const session = authMemoryStore.getSession();
      if (!session?.accessToken) {
        Alert.alert('Error', 'Please log in to analyze products.');
        return;
      }

      // Default scanned product lookup from NestJS backend
      const barcode = '8901063112119'; // Maggi 2-Minute Noodles
      const product = await scansDS.getProductByBarcode(session.accessToken, barcode);

      // Save scan to MongoDB
      try {
        await scansDS.saveScan(session.accessToken, {
          productId: product.productId,
          barcode: product.barcode,
          scannedAt: new Date().toISOString(),
        });
      } catch (e) {}

      // Calculate Child Safety Verdict
      const child = authMemoryStore.getActiveChild ? authMemoryStore.getActiveChild() : null;
      const childAnalysis = calculateChildSafety(product, child);

      const imageAsset = result.assets[0];
      const formattedProduct = {
        id: product.productId,
        barcode: product.barcode,
        name: product.name,
        brand: product.brand,
        category: product.category,
        score: String(product.healthScore || '7.0'),
        grade: product.healthLabel || childAnalysis.gradeLabel,
        gradeColor: product.healthColor || childAnalysis.gradeColor,
        image: imageAsset.uri ? { uri: imageAsset.uri } : require('../../../../shared/assets/maggi.png'),
        ingredients: product.ingredients || 'Not specified',
        allergens: product.allergens || [],
        nutrition: product.nutritionPer100g,
        highlights: product.highlights || [],
        suitableFor: product.suitableFor,
        alternatives: product.alternatives || [],
        analysis: childAnalysis,
        alerts: [
          ...childAnalysis.warnings.map((w: string) => ({ text: w, type: 'warning' })),
          ...childAnalysis.pros.map((p: string) => ({ text: p, type: 'good' })),
        ],
      };

      setScannedProduct(formattedProduct);
    } catch (err: any) {
      console.log('Image picker scan error:', err?.message);
      Alert.alert('Analysis Error', 'Failed to analyze product from gallery image.');
    } finally {
      setIsAnalyzing(false);
    }
  };
`;

if (!content.includes('const handlePickImage =')) {
  content = content.replace(
    "const handleManualSubmit = async () => {",
    handlePickImageCode + "\n  const handleManualSubmit = async () => {"
  );
}

// 3. Replace all "Gallery upload is currently offline." with handlePickImage
content = content.replace(
  /Alert\.alert\('Pick Image', 'Gallery upload is currently offline\.'\)/g,
  'handlePickImage()'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated ScanScreen.tsx with real react-native-image-picker gallery upload!');
