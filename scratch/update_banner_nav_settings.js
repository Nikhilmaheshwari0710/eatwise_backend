const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/NotificationsScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldBannerBtn = `<TouchableOpacity
              style={styles.bannerBtn}
              onPress={async () => {
                setIsPushEnabled(true);
                try {
                  const session = authMemoryStore.getSession();
                  if (session?.accessToken) {
                    await notifDS.updateSettings(session.accessToken, [
                      { key: 'high_sugar_alert', enabled: true },
                      { key: 'high_sodium_alert', enabled: true },
                      { key: 'harmful_additives_alert', enabled: true },
                    ]);
                  }
                } catch (e) {}
                Alert.alert('Push Notifications', 'Push notifications enabled successfully!');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.bannerBtnText}>Enable Now</Text>
            </TouchableOpacity>`;

const newBannerBtn = `<TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => {
                if (onNavigateToSettings) {
                  onNavigateToSettings();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.bannerBtnText}>Enable Now</Text>
            </TouchableOpacity>`;

if (content.includes(oldBannerBtn)) {
  content = content.replace(oldBannerBtn, newBannerBtn);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ 1. NotificationsScreen.tsx updated "Enable Now" button to navigate directly to Settings screen!');
} else {
  console.log('⚠️ Could not find exact oldBannerBtn, applying regex replace...');
  content = content.replace(
    /onPress=\{async \(\) => \{[\s\S]*?Alert\.alert\('Push Notifications'[\s\S]*?\}\}/,
    'onPress={() => {\n                if (onNavigateToSettings) {\n                  onNavigateToSettings();\n                }\n              }}'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Applied regex replace!');
}
