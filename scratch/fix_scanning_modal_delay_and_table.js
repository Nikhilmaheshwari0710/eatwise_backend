const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update handlePickImage to show AI Modal for 2.5 seconds
const oldPick = `  const handlePickImage = async () => {
    let pickedPhotoSource: any = null;
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, includeBase64: false });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      setIsAnalyzing(true);
      const imageAsset = result.assets[0];
      if (imageAsset && imageAsset.uri) {
        pickedPhotoSource = { uri: imageAsset.uri };
      } else {
        pickedPhotoSource = require('../../../../shared/assets/lays_chips.jpg');
      }

      const session = authMemoryStore.getSession();
      let product: any = null;

      if (session?.accessToken) {
        try {
          product = await scansDS.getProductByBarcode(session.accessToken, '8901725112119');
        } catch (apiErr1) {
          try {
            product = await scansDS.getProductByBarcode(session.accessToken, '8901063112119');
          } catch (apiErr2) {}
        }
      }

      if (!product) {
        product = {
          productId: '6a9829fb9230890355419391',
          barcode: '8901725112119',
          name: 'Balaji Potato Wafers (Cippi)',
          brand: 'Balaji Wafers',
          category: 'Snacks',
          netWeight: '30g',
          healthScore: 3.9,
          healthLabel: 'High Risk',
          healthColor: '#EF4444',
          isVeg: true,
          ingredients: 'Potato, Palmolein Oil, Spices & Condiments, Flavor Enhancers (INS 627, INS 631).',
          allergens: [],
          nutritionPer100g: { calories: 550, protein: 6.5, carbohydrates: 57.5, fat: 32.8, saturatedFat: 14.2, fiber: 5.4, sugar: 6.5, sodium: 580 },
          highlights: [{ label: 'Flavor Enhancers (INS 627, 631)', type: 'danger', detail: 'Contains Disodium Guanylate - Not for toddlers' }],
          suitableFor: { toddler: false, child: false, adult: true },
          alternatives: [],
        };
      }

      if (session?.accessToken && product.productId && product.productId.length === 24) {
        try {
          await scansDS.saveScan(session.accessToken, {
            productId: product.productId,
            barcode: product.barcode || '8901725112119',
            scannedAt: new Date().toISOString(),
          });
        } catch (e) {}
      }

      const childAnalysis = calculateChildSafety(product, null) || {
        riskLevel: 'HIGH_RISK',
        warnings: ['High Saturated Fat (Palmolein Oil)', 'Flavor Enhancers INS 627, 631'],
        pros: ['Good Dietary Fiber (5.4g)'],
        gradeLabel: 'High Risk',
        gradeColor: '#EF4444',
      };

      const warningsList = Array.isArray(childAnalysis?.warnings) ? childAnalysis.warnings : [];
      const prosList = Array.isArray(childAnalysis?.pros) ? childAnalysis.pros : [];

      const formattedProduct = {
        id: product?.productId || '6a9829fb9230890355419391',
        barcode: product?.barcode || '8901725112119',
        name: product?.name || 'Balaji Potato Wafers (Cippi)',
        brand: product?.brand || 'Balaji Wafers',
        category: 'Snacks',
        netWeight: product?.netWeight || '30g',
        score: String(product?.healthScore || '3.9'),
        grade: product?.healthLabel || childAnalysis.gradeLabel || 'High Risk',
        gradeColor: product?.healthColor || childAnalysis.gradeColor || '#EF4444',
        image: pickedPhotoSource,
        ingredients: product?.ingredients || 'Potato, Palmolein Oil, Spices, INS 627, INS 631',
        allergens: product?.allergens || [],
        nutrition: product?.nutritionPer100g || { calories: 550, protein: 6.5, carbohydrates: 57.5, fat: 32.8, saturatedFat: 14.2, fiber: 5.4, sugar: 6.5, sodium: 580 },
        highlights: product?.highlights || [],
        suitableFor: product?.suitableFor || { toddler: false, child: false, adult: true },
        alternatives: product?.alternatives || [],
        analysis: childAnalysis,
        alerts: [
          ...warningsList.map((w: string) => ({ text: w, type: 'warning' })),
          ...prosList.map((p: string) => ({ text: p, type: 'good' })),
        ],
      };

      setScannedProduct(formattedProduct);
    } catch (err: any) {
      console.log('Image picker scan error details:', err);
      setScannedProduct({
        id: '6a9829fb9230890355419391',
        barcode: '8901725112119',
        name: 'Balaji Potato Wafers (Cippi)',
        brand: 'Balaji Wafers',
        category: 'Snacks',
        netWeight: '30g',
        score: '3.9',
        grade: 'High Risk',
        gradeColor: '#EF4444',
        image: pickedPhotoSource || require('../../../../shared/assets/lays_chips.jpg'),
        ingredients: 'Potato, Palmolein Oil, Spices & Condiments, Flavor Enhancers (INS 627, INS 631)',
        allergens: [],
        nutrition: { calories: 550, protein: 6.5, carbohydrates: 57.5, fat: 32.8, saturatedFat: 14.2, fiber: 5.4, sugar: 6.5, sodium: 580 },
        highlights: [{ label: 'Flavor Enhancers (INS 627, 631)', type: 'danger', detail: 'Contains Disodium Guanylate - Not for toddlers' }],
        suitableFor: { toddler: false, child: false, adult: true },
        alternatives: [],
        alerts: [
          { text: 'High Saturated Fat (14.2g per 100g) from Palmolein Oil', type: 'warning' },
          { text: 'Contains Flavor Enhancers INS 627 & INS 631', type: 'warning' },
        ],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };`;

const newPick = `  const handlePickImage = async () => {
    let pickedPhotoSource: any = null;
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, includeBase64: false });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const imageAsset = result.assets[0];
      if (imageAsset && imageAsset.uri) {
        pickedPhotoSource = { uri: imageAsset.uri };
      } else {
        pickedPhotoSource = require('../../../../shared/assets/lays_chips.jpg');
      }

      // Show AI Scanner Modal FIRST!
      setAnalyzingImagePreview(pickedPhotoSource);
      setIsAnalyzing(true);

      const session = authMemoryStore.getSession();
      let product: any = null;

      if (session?.accessToken) {
        try {
          product = await scansDS.getProductByBarcode(session.accessToken, '8901725112119');
        } catch (apiErr1) {
          try {
            product = await scansDS.getProductByBarcode(session.accessToken, '8901063112119');
          } catch (apiErr2) {}
        }
      }

      if (!product) {
        product = {
          productId: '6a9829fb9230890355419391',
          barcode: '8901725112119',
          name: 'Balaji Potato Wafers (Cippi)',
          brand: 'Balaji Wafers',
          category: 'Snacks',
          netWeight: '30g',
          healthScore: 3.9,
          healthLabel: 'High Risk',
          healthColor: '#EF4444',
          isVeg: true,
          ingredients: 'Potato, Palmolein Oil, Spices & Condiments, Flavor Enhancers (INS 627, INS 631).',
          allergens: [],
          nutritionPer100g: { calories: 550, protein: 6.5, carbohydrates: 57.5, fat: 32.8, saturatedFat: 14.2, fiber: 5.4, sugar: 6.5, sodium: 580 },
          highlights: [{ label: 'Flavor Enhancers (INS 627, 631)', type: 'danger', detail: 'Contains Disodium Guanylate - Not for toddlers' }],
          suitableFor: { toddler: false, child: false, adult: true },
          alternatives: [],
        };
      }

      if (session?.accessToken && product.productId && product.productId.length === 24) {
        try {
          await scansDS.saveScan(session.accessToken, {
            productId: product.productId,
            barcode: product.barcode || '8901725112119',
            scannedAt: new Date().toISOString(),
          });
        } catch (e) {}
      }

      const childAnalysis = calculateChildSafety(product, null) || {
        riskLevel: 'HIGH_RISK',
        warnings: ['High Saturated Fat (Palmolein Oil)', 'Flavor Enhancers INS 627, 631'],
        pros: ['Good Dietary Fiber (5.4g)'],
        gradeLabel: 'High Risk',
        gradeColor: '#EF4444',
      };

      const warningsList = Array.isArray(childAnalysis?.warnings) ? childAnalysis.warnings : [];
      const prosList = Array.isArray(childAnalysis?.pros) ? childAnalysis.pros : [];

      const formattedProduct = {
        id: product?.productId || '6a9829fb9230890355419391',
        barcode: product?.barcode || '8901725112119',
        name: product?.name || 'Balaji Potato Wafers (Cippi)',
        brand: product?.brand || 'Balaji Wafers',
        category: 'Snacks',
        netWeight: product?.netWeight || '30g',
        score: String(product?.healthScore || '3.9'),
        grade: product?.healthLabel || childAnalysis.gradeLabel || 'High Risk',
        gradeColor: product?.healthColor || childAnalysis.gradeColor || '#EF4444',
        image: pickedPhotoSource,
        ingredients: product?.ingredients || 'Potato, Palmolein Oil, Spices, INS 627, INS 631',
        allergens: product?.allergens || [],
        nutrition: product?.nutritionPer100g || { calories: 550, protein: 6.5, carbohydrates: 57.5, fat: 32.8, saturatedFat: 14.2, fiber: 5.4, sugar: 6.5, sodium: 580 },
        highlights: product?.highlights || [],
        suitableFor: product?.suitableFor || { toddler: false, child: false, adult: true },
        alternatives: product?.alternatives || [],
        analysis: childAnalysis,
        alerts: [
          ...warningsList.map((w: string) => ({ text: w, type: 'warning' })),
          ...prosList.map((p: string) => ({ text: p, type: 'good' })),
        ],
      };

      // ⏳ Hold AI Scanning Modal for 2.6 seconds so user sees full laser scan & dynamic steps!
      await new Promise(r => setTimeout(r, 2600));

      setScannedProduct(formattedProduct);
    } catch (err: any) {
      console.log('Image picker scan error details:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };`;

content = content.replace(oldPick, newPick);

// 2. Fix hardcoded Table Category & Weight in Product Details view
content = content.replace(
  '<Text style={styles.tableVal}>Breakfast Cereals</Text>',
  '<Text style={styles.tableVal}>{scannedProduct.category || "Snacks"}</Text>'
);

content = content.replace(
  '<Text style={styles.tableVal}>250g</Text>',
  '<Text style={styles.tableVal}>{scannedProduct.netWeight || "30g"}</Text>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated handlePickImage with 2.6s scan duration and fixed product table values!');
