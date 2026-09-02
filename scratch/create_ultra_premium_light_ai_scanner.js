const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the fullScreenAiScannerOverlay JSX with Light Modern Ultra-Premium AI Scanner Page
const oldOverlayJsx = `{isAnalyzing && (
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

const newLightUltraPremiumOverlayJsx = `{isAnalyzing && (
        <View style={styles.fullScreenAiScannerOverlay}>
          
          {/* Top Bar with Cancel & Header Badge */}
          <View style={styles.fsAiHeaderRow}>
            <TouchableOpacity 
              style={styles.fsCancelScanBtn} 
              onPress={() => setIsAnalyzing(false)}
              activeOpacity={0.7}
            >
              <CloseIcon size={20} color="#0F172A" />
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
            <Text style={styles.fsScanTitle}>Analyzing Food Packaging...</Text>
            <Text style={styles.fsScanSubtitle}>Extracting ingredients & evaluating pediatric safety</Text>

            {/* Extra Large 320x320 Scanning Frame */}
            <View style={styles.fsScanImageFrame}>
              {analyzingImagePreview ? (
                <Image source={analyzingImagePreview} style={styles.fsScanImage} resizeMode="cover" />
              ) : (
                <Image source={require('../../../../shared/assets/lays_chips.jpg')} style={styles.fsScanImage} resizeMode="cover" />
              )}

              {/* Glowing Corner Reticles */}
              <View style={[styles.fsCorner, styles.fsCornerTL]} />
              <View style={[styles.fsCorner, styles.fsCornerTR]} />
              <View style={[styles.fsCorner, styles.fsCornerBL]} />
              <View style={[styles.fsCorner, styles.fsCornerBR]} />

              {/* Glowing Orange Laser Scanner Line */}
              <Animated.View
                style={[
                  styles.fsLaserBeam,
                  {
                    transform: [
                      {
                        translateY: scanLaserAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 290],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            {/* Premium AI Progress Card with Sparkle Logo */}
            <View style={styles.fsAiProgressCard}>
              <View style={styles.premiumSparkleLogoBox}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#FF521B" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={styles.fsAiProgressText}>{scanningStepText}</Text>
                </View>
                <Text style={styles.fsAiProgressSubtext}>AI deep scan active</Text>
              </View>
              <ActivityIndicator size="small" color="#FF521B" />
            </View>
          </View>

          {/* Footer Badge Subtext */}
          <View style={styles.fsFooterContainer}>
            <View style={styles.childSafetyPillBg}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#10B981" />
              </Svg>
              <Text style={styles.fsFooterSubtext}>
                Matching ingredients against child profile & allergen database
              </Text>
            </View>
          </View>

        </View>
      )}`;

content = content.replace(oldOverlayJsx, newLightUltraPremiumOverlayJsx);

// Update styles for light ultra-premium fullScreenAiScannerOverlay
const fsLightStyles = `
  fullScreenAiScannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 99999,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    paddingTop: 46,
    paddingBottom: 26,
    paddingHorizontal: 20,
  },
  fsAiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  fsCancelScanBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fsAiBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EA',
    borderWidth: 1,
    borderColor: '#FFE0D3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fsAiBadgeText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FF521B',
    letterSpacing: 0.2,
  },
  fsScanMainContainer: {
    alignItems: 'center',
    width: '100%',
  },
  fsScanTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  fsScanSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  fsScanImageFrame: {
    width: 320,
    height: 320,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FF521B',
    backgroundColor: '#FFFFFF',
    marginBottom: 22,
    shadowColor: '#FF521B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  fsScanImage: {
    width: '100%',
    height: '100%',
  },
  fsCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FF521B',
  },
  fsCornerTL: { top: 10, left: 10, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  fsCornerTR: { top: 10, right: 10, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  fsCornerBL: { bottom: 10, left: 10, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  fsCornerBR: { bottom: 10, right: 10, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
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
    shadowRadius: 10,
    elevation: 8,
  },
  fsAiProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFEAE2',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  premiumSparkleLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fsAiProgressText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  fsAiProgressSubtext: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF521B',
    marginTop: 1,
  },
  fsFooterContainer: {
    alignItems: 'center',
    width: '100%',
  },
  childSafetyPillBg: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fsFooterSubtext: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
    textAlign: 'center',
  },
`;

content = content.replace(
  '  fullScreenAiScannerOverlay: {',
  fsLightStyles + '\n  fullScreenAiScannerOverlay: {'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Created Light Mode Ultra-Premium AI Health Scanner Page in ScanScreen.tsx!');
