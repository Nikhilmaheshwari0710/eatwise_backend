const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/NotificationSettingsScreen.tsx';

const code = `import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../../shared/theme/colors';
import { BottomNavBar } from '../../../home/presentation/components/BottomNavBar';
import { authMemoryStore } from '../../../../shared/storage/authMemoryStore';
import {
  NotificationsRemoteDataSource,
  SettingCategoryGroupApi,
} from '../../data/datasources/NotificationsRemoteDataSource';
import {
  BackArrowIcon,
  BellIcon,
  HeartIcon,
  InfoCircleIcon,
  NotificationHeaderIllustration,
  ProductAlertShieldIcon,
} from '../../../../shared/components/AppIcons';

interface NotificationSettingsScreenProps {
  onBack: () => void;
  onTabPress?: (tab: string) => void;
}

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  onBack,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [settingsGroups, setSettingsGroups] = useState<SettingCategoryGroupApi[]>([]);
  const notifDS = React.useMemo(() => new NotificationsRemoteDataSource(), []);

  const loadSettings = useCallback(async () => {
    try {
      const session = authMemoryStore.getSession();
      if (!session?.accessToken) return;
      const groups = await notifDS.getSettings(session.accessToken);
      setSettingsGroups(groups);
    } catch (err: any) {
      console.log('Load notification settings error:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [notifDS]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleSetting = async (groupIndex: number, itemKey: string, currentValue: boolean) => {
    const newValue = !currentValue;
    
    // Optimistic UI update
    setSettingsGroups(prev => prev.map((group, idx) => {
      if (idx !== groupIndex) return group;
      return {
        ...group,
        items: group.items.map(item => item.key === itemKey ? { ...item, enabled: newValue } : item),
      };
    }));

    try {
      const session = authMemoryStore.getSession();
      if (session?.accessToken) {
        await notifDS.updateSettings(session.accessToken, [{ key: itemKey, enabled: newValue }]);
      }
    } catch (err: any) {
      console.log('Update setting error:', err?.message);
      // Revert optimistic update on failure
      setSettingsGroups(prev => prev.map((group, idx) => {
        if (idx !== groupIndex) return group;
        return {
          ...group,
          items: group.items.map(item => item.key === itemKey ? { ...item, enabled: currentValue } : item),
        };
      }));
      Alert.alert('Error', 'Failed to update notification setting.');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <BackArrowIcon size={24} color="#FF521B" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your alert preferences</Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>Stay Informed, Safely</Text>
            <Text style={styles.bannerDesc}>
              Control which health alerts, scan warnings, and growth reminders you receive.
            </Text>
          </View>
          <View style={styles.illustrationWrap}>
            <NotificationHeaderIllustration />
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF521B" />
          </View>
        ) : (
          settingsGroups.map((group, gIdx) => (
            <View key={group.settingId || gIdx} style={{ marginBottom: 20 }}>
              <Text style={styles.groupCategoryTitle}>{group.category}</Text>
              <View style={styles.groupCard}>
                {group.items.map((item, iIdx) => (
                  <View
                    key={item.key}
                    style={[
                      styles.settingRow,
                      iIdx < group.items.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <View style={styles.settingIconWrap}>
                      {group.category.includes('Health') ? (
                        <ProductAlertShieldIcon />
                      ) : group.category.includes('Growth') ? (
                        <HeartIcon color="#FF521B" />
                      ) : (
                        <BellIcon size={18} color="#FF521B" />
                      )}
                    </View>
                    <View style={styles.settingTextWrap}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <Text style={styles.settingDesc}>{item.description}</Text>
                    </View>
                    <Switch
                      value={item.enabled}
                      onValueChange={() => toggleSetting(gIdx, item.key, item.enabled)}
                      trackColor={{ false: '#CBD5E1', true: '#FF521B' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNavBar activeTab="profile" onTabPress={onTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backButton: { padding: 4 },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  headerSubtitle: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 3 },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 14 },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0EA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerTextWrap: { flex: 1, paddingRight: 8 },
  bannerTitle: { fontSize: 15, fontWeight: '900', color: '#FF521B', marginBottom: 4 },
  bannerDesc: { fontSize: 11.5, color: '#64748B', lineHeight: 16, fontWeight: '600' },
  illustrationWrap: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center' },
  groupCategoryTitle: { fontSize: 13, fontWeight: '900', color: '#64748B', marginBottom: 8 },
  groupCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  settingIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingTextWrap: { flex: 1, paddingRight: 8 },
  settingLabel: { fontSize: 13.5, fontWeight: '800', color: '#0F172A' },
  settingDesc: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '600' },
});
`;

fs.writeFileSync(file, code, 'utf8');
console.log('✅ Updated NotificationSettingsScreen.tsx!');
