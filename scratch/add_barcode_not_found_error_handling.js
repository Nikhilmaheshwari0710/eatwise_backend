const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update handleManualSubmit to show "Product Not Found" for unrecognized barcodes
const oldManualSubmit = `  const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number.');
      return;
    }
    
    const codeValue = manualBarcode.trim();
    setIsManualInputVisible(false);
    setManualBarcode('');
    setIsAnalyzing(true);
    
    try {`;

const newManualSubmit = `  const handleManualSubmit = async () => {
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
        // Unrecognized barcode error popup
        setIsAnalyzing(false);
        Alert.alert(
          'Product Not Found 🔍',
          \`No registered food product found for barcode: \${codeValue}.\n\nTry entering a valid barcode like 8901725112119 (Balaji Wafers) or 8901063112119 (Maggi Noodles).\`
        );
        return;
      }`;

content = content.replace(oldManualSubmit, newManualSubmit);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Added Barcode Not Found Error Handling in ScanScreen.tsx!');
