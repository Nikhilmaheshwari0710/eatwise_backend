const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add ScansRemoteDataSource import
if (!content.includes('ScansRemoteDataSource')) {
  content = content.replace(
    "import { authMemoryStore } from '../../../../shared/storage/authMemoryStore';",
    "import { authMemoryStore } from '../../../../shared/storage/authMemoryStore';\nimport { ScansRemoteDataSource, ProductDetailApi, ScanHistoryItemApi } from '../data/datasources/ScansRemoteDataSource';"
  );
  if (!content.includes('ScansRemoteDataSource')) {
    content = `import { ScansRemoteDataSource, ProductDetailApi, ScanHistoryItemApi } from '../data/datasources/ScansRemoteDataSource';\n` + content;
  }
}

// 2. Add child safety calculator helper
const childCalculatorHelper = `
function calculateChildSafety(product: any, child: any) {
  let riskLevel: 'HIGH_RISK' | 'CAUTION' | 'SAFE' = 'SAFE';
  const warnings: string[] = [];
  const pros: string[] = [];

  // Allergy Check
  if (child?.allergies && Array.isArray(child.allergies) && child.allergies.length > 0) {
    for (const allergen of product.allergens || []) {
      const match = child.allergies.find((a: string) => a.toLowerCase() === allergen.toLowerCase());
      if (match) {
        riskLevel = 'HIGH_RISK';
        warnings.push(\`Contains \${allergen}! Unsafe due to \${child.name || 'child'}'s \${allergen} allergy.\`);
      }
    }
  }

  // Sugar & Sodium limits
  const sugar = product.nutritionPer100g?.sugar ?? 0;
  const sodium = product.nutritionPer100g?.sodium ?? 0;

  if (sugar > 15) {
    if (riskLevel !== 'HIGH_RISK') riskLevel = 'CAUTION';
    warnings.push(\`High Added Sugar (\${sugar}g/100g) - Exceeds daily limit for toddlers.\`);
  }

  if (sodium > 600) {
    if (riskLevel !== 'HIGH_RISK') riskLevel = 'CAUTION';
    warnings.push(\`High Sodium (\${sodium}mg/100g) - Excess salt intake.\`);
  }

  // Suitability
  if (product.suitableFor && !product.suitableFor.child && !product.suitableFor.toddler) {
    if (riskLevel !== 'HIGH_RISK') riskLevel = 'CAUTION';
    warnings.push('Not recommended for children under 5 years.');
  }

  // Positive Nutrients
  const protein = product.nutritionPer100g?.protein ?? 0;
  const fiber = product.nutritionPer100g?.fiber ?? 0;
  const calcium = product.nutritionPer100g?.calcium ?? 0;

  if (protein >= 5) pros.push(\`High Protein (\${protein}g/100g) - Supports muscle growth.\`);
  if (fiber >= 3) pros.push(\`Dietary Fiber (\${fiber}g/100g) - Good for digestion.\`);
  if (calcium >= 50) pros.push(\`Calcium (\${calcium}mg/100g) - Essential for strong bones.\`);

  const gradeLabel = riskLevel === 'HIGH_RISK' ? 'High Risk' : riskLevel === 'CAUTION' ? 'Moderate Choice' : 'Healthy Choice';
  const gradeColor = riskLevel === 'HIGH_RISK' ? '#EF4444' : riskLevel === 'CAUTION' ? '#F59E0B' : '#10B981';

  return { riskLevel, warnings, pros, gradeLabel, gradeColor };
}
`;

if (!content.includes('function calculateChildSafety')) {
  content = content.replace("export const ScanScreen:", childCalculatorHelper + "\nexport const ScanScreen:");
}

// 3. Add scansDS memo inside ScanScreen component
if (!content.includes('const scansDS =')) {
  content = content.replace(
    "const insets = useSafeAreaInsets();",
    "const insets = useSafeAreaInsets();\n  const scansDS = React.useMemo(() => new ScansRemoteDataSource(), []);"
  );
}

// 4. Update handleManualSubmit to use real API & save scan to MongoDB
const oldManualSubmit = `const handleManualSubmit = () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number.');
      return;
    }
    
    const codeValue = manualBarcode.trim();
    setIsManualInputVisible(false);
    setManualBarcode('');
    
    // Simulate analyzing loader
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const found = RECENT_SCANS.find((x) => x.barcode === codeValue) || {
        name: \`Typed Product (\${codeValue})\`,
        brand: 'Manual Entry',
        score: '7.2',
        grade: 'Healthy Choice',
        gradeColor: '#10B981',
        image: require('../../../../shared/assets/child_aarav.png'),
        alerts: [{ text: 'Manual barcode entry successfully parsed.', type: 'good' }],
      };
      setScannedProduct(found);
    }, 1000);
  };`;

const newManualSubmit = `const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number.');
      return;
    }
    
    const codeValue = manualBarcode.trim();
    setIsManualInputVisible(false);
    setManualBarcode('');
    setIsAnalyzing(true);
    
    try {
      const session = authMemoryStore.getSession();
      if (!session?.accessToken) {
        Alert.alert('Authentication Error', 'Please log in to scan products.');
        return;
      }

      // Fetch product by barcode from NestJS backend
      const product = await scansDS.getProductByBarcode(session.accessToken, codeValue);
      
      // Save scan to MongoDB
      try {
        await scansDS.saveScan(session.accessToken, {
          productId: product.productId,
          barcode: product.barcode,
          scannedAt: new Date().toISOString(),
        });
      } catch (saveErr) {
        console.log('Save scan log warning:', saveErr);
      }

      // Calculate Child Safety Verdict
      const child = authMemoryStore.getActiveChild ? authMemoryStore.getActiveChild() : null;
      const childAnalysis = calculateChildSafety(product, child);

      const formattedProduct = {
        id: product.productId,
        barcode: product.barcode,
        name: product.name,
        brand: product.brand,
        category: product.category,
        score: String(product.healthScore || '7.0'),
        grade: product.healthLabel || childAnalysis.gradeLabel,
        gradeColor: product.healthColor || childAnalysis.gradeColor,
        image: product.imageUrl ? { uri: product.imageUrl } : require('../../../../shared/assets/maggi.png'),
        ingredients: product.ingredients || 'Not specified',
        allergens: product.allergens || [],
        nutrition: product.nutritionPer100g,
        highlights: product.highlights || [],
        suitableFor: product.suitableFor,
        alternatives: product.alternatives || [],
        analysis: childAnalysis,
        alerts: [
          ...childAnalysis.warnings.map(w => ({ text: w, type: 'warning' })),
          ...childAnalysis.pros.map(p => ({ text: p, type: 'good' })),
        ],
      };

      setScannedProduct(formattedProduct);
    } catch (err: any) {
      console.log('Barcode scan API error:', err?.message);
      Alert.alert('Product Not Found', \`No product details found for barcode: \${codeValue}. Try barcode 8901063112119 or 8901431003215.\`);
    } finally {
      setIsAnalyzing(false);
    }
  };`;

if (content.includes(oldManualSubmit)) {
  content = content.replace(oldManualSubmit, newManualSubmit);
} else {
  content = content.replace(
    /const handleManualSubmit = [\s\S]*?setScannedProduct\(found\);\s*\}, 1000\);\s*\};/,
    newManualSubmit
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated ScanScreen.tsx with real API & Child Health Safety analysis!');
