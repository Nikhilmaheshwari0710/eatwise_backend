const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add step index state & scanner step sequence hook
const stepStateHook = `
  const [scanningStepText, setScanningStepText] = useState('Reading packaging text & ingredients...');
  const [analyzingImagePreview, setAnalyzingImagePreview] = useState<any>(null);
  const scanLaserAnim = useRef(new Animated.Value(0)).current;

  // Laser scanning animation loop
  useEffect(() => {
    if (isAnalyzing) {
      scanLaserAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLaserAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scanLaserAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Dynamic step text updates
      setScanningStepText('Reading packaging text & ingredients...');
      const t1 = setTimeout(() => {
        setScanningStepText('Calculating nutrition breakdown & calories...');
      }, 700);
      const t2 = setTimeout(() => {
        setScanningStepText('Checking artificial additives & preservatives...');
      }, 1400);
      const t3 = setTimeout(() => {
        setScanningStepText('Evaluating pediatric safety for luccccy...');
      }, 2000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isAnalyzing, scanLaserAnim]);
`;

if (!content.includes('const [scanningStepText')) {
  content = content.replace(
    "const [selectedTab, setSelectedTab] = useState<'Overview' | 'Nutrition' | 'Ingredients' | 'Insights' | 'Alternatives'>('Overview');",
    "const [selectedTab, setSelectedTab] = useState<'Overview' | 'Nutrition' | 'Ingredients' | 'Insights' | 'Alternatives'>('Overview');\n" + stepStateHook
  );
}

// 2. Set analyzingImagePreview when photo is picked
content = content.replace(
  "setScannedProduct(formattedProduct);",
  "setAnalyzingImagePreview(imageUri);\n      setScannedProduct(formattedProduct);"
);

// 3. Replace analyzerOverlay with Premium AI Scanning Modal
const oldAnalyzerOverlay = `{isAnalyzing && (
                <View style={styles.analyzerOverlay}>
                  <View style={styles.analyzerBox}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.analyzerText}>Analyzing ingredients...</Text>
                    <Text style={styles.analyzerSubtext}>Calculating food safety scores</Text>
                  </View>
                </View>
              )}`;

const premiumAIScannerModal = `{isAnalyzing && (
  <Modal visible={isAnalyzing} transparent animationType="fade">
    <View style={styles.premiumScanOverlay}>
      <View style={styles.premiumScanCard}>
        
        {/* Header Badge */}
        <View style={styles.aiBadgeRow}>
          <View style={styles.aiSparkleIconBg}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#FF521B" />
            </Svg>
          </View>
          <Text style={styles.aiBadgeTitle}>EatWise AI Health Scanner</Text>
        </View>

        <Text style={styles.premiumScanHeaderTitle}>Analyzing Food Product...</Text>

        {/* Product Image Scanning Frame */}
        <View style={styles.scanImageFrame}>
          {analyzingImagePreview ? (
            <Image source={analyzingImagePreview} style={styles.scanImagePreview} resizeMode="cover" />
          ) : (
            <Image source={require('../../../../shared/assets/lays_chips.jpg')} style={styles.scanImagePreview} resizeMode="cover" />
          )}

          {/* Corner Frame Accents */}
          <View style={[styles.scanCorner, styles.cornerTL]} />
          <View style={[styles.scanCorner, styles.cornerTR]} />
          <View style={[styles.scanCorner, styles.cornerBL]} />
          <View style={[styles.scanCorner, styles.cornerBR]} />

          {/* Laser Moving Bar */}
          <Animated.View
            style={[
              styles.laserLine,
              {
                transform: [
                  {
                    translateY: scanLaserAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 160],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        {/* AI Progress Steps */}
        <View style={styles.aiProgressBox}>
          <ActivityIndicator size="small" color="#FF521B" style={{ marginRight: 10 }} />
          <Text style={styles.aiProgressStepText}>{scanningStepText}</Text>
        </View>

        <Text style={styles.aiChildAnalysisSubtext}>
          Matching ingredients against luccccy's age & allergies
        </Text>
      </View>
    </View>
  </Modal>
)}`;

content = content.replace(oldAnalyzerOverlay, premiumAIScannerModal);

// Also replace the second occurrence if present
content = content.replace(
  `{isAnalyzing && (
            <View style={styles.analyzerOverlay}>`,
  premiumAIScannerModal + `\n            {false && (`
);

// 4. Add Premium AI Scanner styles
const premiumScannerStyles = `
  premiumScanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  premiumScanCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  aiSparkleIconBg: {
    marginRight: 6,
  },
  aiBadgeTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FF521B',
    letterSpacing: 0.3,
  },
  premiumScanHeaderTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
  },
  scanImageFrame: {
    width: 180,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#FFEAE2',
    backgroundColor: '#F8FAFC',
    marginBottom: 18,
  },
  scanImagePreview: {
    width: '100%',
    height: '100%',
  },
  scanCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#FF521B',
  },
  cornerTL: { top: 6, left: 6, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cornerTR: { top: 6, right: 6, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cornerBL: { bottom: 6, left: 6, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 6, right: 6, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: '#FF521B',
    shadowColor: '#FF521B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  aiProgressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 8,
  },
  aiProgressStepText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  aiChildAnalysisSubtext: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
`;

content = content.replace(
  '  analyzerOverlay: {',
  premiumScannerStyles + '\n  analyzerOverlay: {'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Created Premium AI Scanning Loading Screen in ScanScreen.tsx!');
