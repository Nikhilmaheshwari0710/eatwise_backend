const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace <Modal> with absolute positioned View
const oldModalJsx = `{isAnalyzing && (
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

const newAbsoluteOverlayJsx = `{isAnalyzing && (
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

content = content.replace(oldModalJsx, newAbsoluteOverlayJsx);

// 2. Update premiumScanOverlay style to be absolute full-screen overlay
const oldStyle = `  premiumScanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },`;

const newStyle = `  premiumScanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },`;

content = content.replace(oldStyle, newStyle);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Replaced Modal with absolute overlay in ScanScreen.tsx!');
