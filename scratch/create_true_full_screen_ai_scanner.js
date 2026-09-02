const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the premiumScanOverlay JSX with a TRUE Full-Screen AI Scanner Page
const oldOverlayJsx = `{isAnalyzing && (
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
      )}`;

const newFullScreenOverlayJsx = `{isAnalyzing && (
        <View style={styles.fullScreenAiScannerOverlay}>
          
          {/* Top Bar with Cancel & Header Badge */}
          <View style={styles.fsAiHeaderRow}>
            <TouchableOpacity 
              style={styles.fsCancelScanBtn} 
              onPress={() => setIsAnalyzing(false)}
              activeOpacity={0.7}
            >
              <CloseIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.fsAiBadgePill}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                <Path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#FF521B" />
              </Svg>
              <Text style={styles.fsAiBadgeText}>EatWise AI Health Scanner</Text>
            </View>

            <View style={{ width: 36 }} />
          </View>

          {/* Main Hero Scanning Section */}
          <View style={styles.fsScanMainContainer}>
            <Text style={styles.fsScanTitle}>Analyzing Product...</Text>
            <Text style={styles.fsScanSubtitle}>Extracting ingredients & calculating safety score</Text>

            {/* Large 260x260 Scanning Frame */}
            <View style={styles.fsScanImageFrame}>
              {analyzingImagePreview ? (
                <Image source={analyzingImagePreview} style={styles.fsScanImage} resizeMode="cover" />
              ) : (
                <Image source={require('../../../../shared/assets/lays_chips.jpg')} style={styles.fsScanImage} resizeMode="cover" />
              )}

              {/* Glowing Orange Corner Brackets */}
              <View style={[styles.fsCorner, styles.fsCornerTL]} />
              <View style={[styles.fsCorner, styles.fsCornerTR]} />
              <View style={[styles.fsCorner, styles.fsCornerBL]} />
              <View style={[styles.fsCorner, styles.fsCornerBR]} />

              {/* Laser Beam Moving Down */}
              <Animated.View
                style={[
                  styles.fsLaserBeam,
                  {
                    transform: [
                      {
                        translateY: scanLaserAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 240],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            {/* AI Progress Pill */}
            <View style={styles.fsAiProgressCard}>
              <ActivityIndicator size="small" color="#FF521B" style={{ marginRight: 12 }} />
              <Text style={styles.fsAiProgressText}>{scanningStepText}</Text>
            </View>
          </View>

          {/* Footer Subtext */}
          <View style={styles.fsFooterContainer}>
            <Text style={styles.fsFooterSubtext}>
              Matching food ingredients against active child profile & allergen database
            </Text>
          </View>

        </View>
      )}`;

content = content.replace(oldOverlayJsx, newFullScreenOverlayJsx);

// Update styles for fullScreenAiScannerOverlay
const fsStyles = `
  fullScreenAiScannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 99999,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  fsAiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  fsCancelScanBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fsAiBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 240, 234, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  fsAiBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF521B',
    letterSpacing: 0.2,
  },
  fsScanMainContainer: {
    alignItems: 'center',
    width: '100%',
  },
  fsScanTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  fsScanSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 24,
    textAlign: 'center',
  },
  fsScanImageFrame: {
    width: 270,
    height: 270,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2.5,
    borderColor: '#FF521B',
    backgroundColor: '#1E293B',
    marginBottom: 26,
    shadowColor: '#FF521B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  fsScanImage: {
    width: '100%',
    height: '100%',
  },
  fsCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FF521B',
  },
  fsCornerTL: { top: 8, left: 8, borderTopWidth: 3.5, borderLeftWidth: 3.5, borderTopLeftRadius: 6 },
  fsCornerTR: { top: 8, right: 8, borderTopWidth: 3.5, borderRightWidth: 3.5, borderTopRightRadius: 6 },
  fsCornerBL: { bottom: 8, left: 8, borderBottomWidth: 3.5, borderLeftWidth: 3.5, borderBottomLeftRadius: 6 },
  fsCornerBR: { bottom: 8, right: 8, borderBottomWidth: 3.5, borderRightWidth: 3.5, borderBottomRightRadius: 6 },
  fsLaserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    backgroundColor: '#FF521B',
    shadowColor: '#FF521B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  fsAiProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'center',
  },
  fsAiProgressText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fsFooterContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  fsFooterSubtext: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
`;

content = content.replace(
  '  premiumScanOverlay: {',
  fsStyles + '\n  premiumScanOverlay: {'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Created True Full-Screen Immersive Dark AI Health Scanner Page in ScanScreen.tsx!');
