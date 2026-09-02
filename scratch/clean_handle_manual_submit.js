const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const newManualSubmitClean = `  const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number.');
      return;
    }
    
    const codeValue = manualBarcode.trim();
    setIsManualInputVisible(false);
    setManualBarcode('');
    setIsAnalyzing(true);
    
    try {
      const session = authMemoryStore ? authMemoryStore.getSession() : null;
      let product: any = null;

      if (session?.accessToken) {
        try {
          product = await scansDS.getProductByBarcode(session.accessToken, codeValue);
        } catch (apiErr) {}
      }

      if (!product) {
        setIsAnalyzing(false);
        Alert.alert(
          'Product Not Found 🔍',
          \`No registered food product found for barcode: \${codeValue}.\n\nTry entering a valid barcode like 8901725112119 (Balaji Wafers) or 8901063112119 (Maggi Noodles).\`
        );
        return;
      }

      if (session?.accessToken && product.productId && product.productId.length === 24) {
        try {
          await scansDS.saveScan(session.accessToken, {
            productId: product.productId,
            barcode: product.barcode || codeValue,
            scannedAt: new Date().toISOString(),
          });
        } catch (saveErr) {
          console.log('Save scan log warning:', saveErr);
        }
      }

      const activeChild = (authMemoryStore && authMemoryStore.getActiveChild) ? authMemoryStore.getActiveChild() : null;
      const childAnalysis = calculateChildSafety(product, activeChild);

      const formattedProduct = {
        id: product.productId,
        barcode: product.barcode || codeValue,
        name: product.name,
        brand: product.brand,
        category: product.category || 'General Foods',
        score: String(product.healthScore || '7.0'),
        grade: product.healthLabel || childAnalysis.gradeLabel,
        gradeColor: product.healthColor || childAnalysis.gradeColor,
        image: product.imageUrl ? { uri: product.imageUrl } : require('../../../../shared/assets/maggi_noodles.jpg'),
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

      await new Promise(r => setTimeout(r, 2000));
      setScannedProduct(formattedProduct);
    } catch (err: any) {
      console.log('Barcode scan API error:', err?.message);
      Alert.alert('Product Not Found', \`No product details found for barcode: \${codeValue}.\`);
    } finally {
      setIsAnalyzing(false);
    }
  };`;

content = content.replace(
  /const handleManualSubmit = async \(\) => \{[\s\S]*?setIsAnalyzing\(false\);\s*\}\s*\};/,
  newManualSubmitClean
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Cleaned handleManualSubmit in ScanScreen.tsx!');
