const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove old premiumScanOverlay placement
content = content.replace(/\{\/\* Global Full-Screen Premium AI Scanner Loading Overlay \*\/\}[\s\S]*?<\/View>\s*\}\)/g, '');
content = content.replace(/\{isAnalyzing && \(\s*<View style=\{styles\.premiumScanOverlay\}[\s\S]*?<\/View>\s*\)\}/g, '');

// 2. Define the clean standalone overlay JSX
const standaloneOverlayJsx = `{/* Global Premium AI Scanner Overlay - ALWAYS ON TOP WHEN isAnalyzing IS TRUE */}
      {isAnalyzing && (
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

// 3. Place standaloneOverlayJsx right at top of return statement
content = content.replace(
  `return (\n    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>`,
  `return (\n    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>\n      ` + standaloneOverlayJsx
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated ScanScreen.tsx so AI Scanner Overlay is 100% Top-Level & Visible!');
