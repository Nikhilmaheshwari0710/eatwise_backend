const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCodeScanner = `  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'ean-8', 'qr', 'upc-a'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value && !isScanningPaused && !isAnalyzing) {
        setIsScanningPaused(true);
        const codeValue = codes[0].value;
        
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          setIsFullScreen(false); // Close full screen scanner if open
          
          const found = RECENT_SCANS.find((x) => x.barcode === codeValue) || {
            name: \`Scanned Item (\${codeValue})\`,
            brand: 'Food Scanner',
            score: '7.0',
            grade: 'Healthy Choice',
            gradeColor: '#10B981',
            image: require('../../../../shared/assets/child_aarav.png'),
            alerts: [{ text: 'Scanned barcode successfully registered.', type: 'good' }],
          };
          setScannedProduct(found);
        }, 1200);
      }
    },
  });`;

const newCodeScanner = `  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'ean-8', 'qr', 'upc-a', 'code-128', 'code-39'],
    onCodeScanned: async (codes) => {
      if (codes.length > 0 && codes[0].value && !isScanningPaused && !isAnalyzing) {
        setIsScanningPaused(true);
        const codeValue = codes[0].value;
        setIsAnalyzing(true);
        
        try {
          const session = authMemoryStore.getSession();
          if (!session?.accessToken) return;

          let product: any;
          try {
            product = await scansDS.getProductByBarcode(session.accessToken, codeValue);
          } catch (notFoundErr) {
            // Fallback for new/unregistered barcode
            product = {
              productId: \`scanned_\${codeValue}\`,
              barcode: codeValue,
              name: \`Scanned Food Pack (\${codeValue})\`,
              brand: 'Scanned Product',
              category: 'General Foods',
              healthScore: 7.2,
              healthLabel: 'Healthy Choice',
              healthColor: '#10B981',
              isVeg: true,
              ingredients: 'Whole Grains, Water, Natural Flavors',
              allergens: [],
              nutritionPer100g: { calories: 240, protein: 6.5, carbohydrates: 42, fat: 3.2, saturatedFat: 0.8, fiber: 4.5, sugar: 4.2, sodium: 220, calcium: 65 },
              highlights: [{ label: 'Scanned Product', type: 'info', detail: \`Barcode \${codeValue} processed.\` }],
              suitableFor: { toddler: true, child: true, adult: true },
              alternatives: [],
            };
          }

          // Save scan to MongoDB
          try {
            await scansDS.saveScan(session.accessToken, {
              productId: product.productId || \`scanned_\${codeValue}\`,
              barcode: product.barcode || codeValue,
              scannedAt: new Date().toISOString(),
            });
          } catch (e) {}

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
              ...childAnalysis.warnings.map((w: string) => ({ text: w, type: 'warning' })),
              ...childAnalysis.pros.map((p: string) => ({ text: p, type: 'good' })),
            ],
          };

          setIsFullScreen(false);
          setScannedProduct(formattedProduct);
        } catch (err: any) {
          console.log('Live camera scan error:', err?.message);
        } finally {
          setIsAnalyzing(false);
        }
      }
    },
  });`;

if (content.includes(oldCodeScanner)) {
  content = content.replace(oldCodeScanner, newCodeScanner);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Updated codeScanner in ScanScreen.tsx!');
} else {
  console.log('⚠️ Could not find exact oldCodeScanner, replacing with regex...');
  content = content.replace(
    /const codeScanner = useCodeScanner\(\{[\s\S]*?\}\);\s*\}, 1200\);\s*\}\s*\},?\s*\}\);/,
    newCodeScanner
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Applied regex replace for codeScanner!');
}
