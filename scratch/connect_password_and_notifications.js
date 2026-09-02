const fs = require('fs');

const profileScreenFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\presentation\\screens\\ProfileScreen.tsx';
const notificationScreenFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\presentation\\screens\\NotificationSettingsScreen.tsx';

// --- 1. Patch ProfileScreen.tsx (Change Password API) ---
let profileContent = fs.readFileSync(profileScreenFile, 'utf8');

if (!profileContent.includes("import { apiClient }")) {
  profileContent = "import { apiClient } from '../../../../shared/network/apiClient';\n" + profileContent;
}

const oldPasswordBtn = `            onPress={() => Alert.alert('Change Password', 'A password reset link will be sent to ' + userData.email)}`;

const newPasswordBtn = `            onPress={() => {
              Alert.alert(
                'Change Password',
                \`Send password reset OTP to \${userData.email}?\`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Send OTP',
                    onPress: async () => {
                      try {
                        await apiClient.request('/auth/forgot-password', {
                          method: 'POST',
                          body: JSON.stringify({ email: userData.email }),
                        });
                        Alert.alert('OTP Sent', \`Password reset OTP has been sent to \${userData.email}\`);
                      } catch (err: any) {
                        Alert.alert('Error', err?.message || 'Could not send reset OTP.');
                      }
                    },
                  },
                ],
              );
            }}`;

if (profileContent.includes(oldPasswordBtn)) {
  profileContent = profileContent.replace(oldPasswordBtn, newPasswordBtn);
  console.log('Successfully connected Change Password API in ProfileScreen.tsx');
} else {
  console.log('Could not find oldPasswordBtn directly');
}

fs.writeFileSync(profileScreenFile, profileContent, 'utf8');

// --- 2. Patch NotificationSettingsScreen.tsx (GET & PUT /notifications/settings) ---
const newNotificationScreenCode = `import React, { useEffect, useState } from 'react';
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
import { apiClient } from '../../../../shared/network/apiClient';
import {
  BackArrowIcon,
  BellIcon,
  ChevronRightIcon,
  ClockTipIcon,
  HeartIcon,
  InfoCircleIcon,
  MailEnvelopeIcon,
  NotificationHeaderIllustration,
  OfferTagIcon,
  ProductAlertShieldIcon,
  ScanNavIcon,
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

  // Push Notifications State
  const [generalPush, setGeneralPush] = useState(true);
  const [scanPush, setScanPush] = useState(true);
  const [productPush, setProductPush] = useState(true);
  const [healthPush, setHealthPush] = useState(true);
  const [offersPush, setOffersPush] = useState(true);

  // Email Notifications State
  const [weeklyEmail, setWeeklyEmail] = useState(true);
  const [productEmail, setProductEmail] = useState(true);
  const [offersEmail, setOffersEmail] = useState(false);
  const [healthEmail, setHealthEmail] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const response: any = await apiClient.request('/notifications/settings', { method: 'GET' });
        if (isMounted && response?.data?.settings) {
          const map: Record<string, boolean> = {};
          response.data.settings.forEach((group: any) => {
            group.items?.forEach((item: any) => {
              map[item.key] = item.enabled;
            });
          });
          if (map.generalPush !== undefined) setGeneralPush(map.generalPush);
          if (map.scanPush !== undefined) setScanPush(map.scanPush);
          if (map.productPush !== undefined) setProductPush(map.productPush);
          if (map.healthPush !== undefined) setHealthPush(map.healthPush);
          if (map.offersPush !== undefined) setOffersPush(map.offersPush);
          if (map.weeklyEmail !== undefined) setWeeklyEmail(map.weeklyEmail);
          if (map.productEmail !== undefined) setProductEmail(map.productEmail);
          if (map.offersEmail !== undefined) setOffersEmail(map.offersEmail);
          if (map.healthEmail !== undefined) setHealthEmail(map.healthEmail);
        }
      } catch (err) {
        console.log('Loaded notification settings defaults');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await apiClient.request('/notifications/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: [
            { key: 'generalPush', enabled: generalPush },
            { key: 'scanPush', enabled: scanPush },
            { key: 'productPush', enabled: productPush },
            { key: 'healthPush', enabled: healthPush },
            { key: 'offersPush', enabled: offersPush },
            { key: 'weeklyEmail', enabled: weeklyEmail },
            { key: 'productEmail', enabled: productEmail },
            { key: 'offersEmail', enabled: offersEmail },
            { key: 'healthEmail', enabled: healthEmail },
          ],
        }),
      });
      Alert.alert(
        'Settings Saved',
        'Your notification preferences have been saved successfully!',
        [{ text: 'OK', onPress: onBack }],
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <BackArrowIcon size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
        </View>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Top Header Illustration */}
        <View style={styles.topIllustrationBlock}>
          <NotificationHeaderIllustration size={80} />
          <Text style={styles.headerSubtitle}>
            Manage how and when you receive updates about health tips, scan alerts, and offers.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#FF521B" style={{ marginVertical: 30 }} />
        ) : (
          <>
            {/* Section 1: Push Notifications */}
            <Text style={styles.sectionTitle}>Push Notifications</Text>
            <View style={styles.groupCard}>
              <View style={styles.toggleRow}>
                <View style={styles.iconBox}>
                  <BellIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>General Notifications</Text>
                  <Text style={styles.rowSubtitle}>App updates and activity alerts</Text>
                </View>
                <Switch
                  value={generalPush}
                  onValueChange={setGeneralPush}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.iconBox}>
                  <ScanNavIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Scan Reminders</Text>
                  <Text style={styles.rowSubtitle}>Reminders to scan new food products</Text>
                </View>
                <Switch
                  value={scanPush}
                  onValueChange={setScanPush}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.iconBox}>
                  <ProductAlertShieldIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Product Alerts</Text>
                  <Text style={styles.rowSubtitle}>Alerts for high sugar, salt, or recall items</Text>
                </View>
                <Switch
                  value={productPush}
                  onValueChange={setProductPush}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.iconBox}>
                  <HeartIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Health Tips & Insights</Text>
                  <Text style={styles.rowSubtitle}>Daily tips tailored to your family</Text>
                </View>
                <Switch
                  value={healthPush}
                  onValueChange={setHealthPush}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={styles.iconBox}>
                  <OfferTagIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Offers & Promotions</Text>
                  <Text style={styles.rowSubtitle}>Special offers and exclusive deals</Text>
                </View>
                <Switch
                  value={offersPush}
                  onValueChange={setOffersPush}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Section 2: Email Notifications */}
            <Text style={styles.sectionTitle}>Email Notifications</Text>
            <View style={styles.groupCard}>
              <View style={styles.toggleRow}>
                <View style={styles.iconBox}>
                  <MailEnvelopeIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Weekly Summary</Text>
                  <Text style={styles.rowSubtitle}>Receive your weekly scan summary</Text>
                </View>
                <Switch
                  value={weeklyEmail}
                  onValueChange={setWeeklyEmail}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.iconBox}>
                  <MailEnvelopeIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Product Alerts</Text>
                  <Text style={styles.rowSubtitle}>Receive alerts about risky products</Text>
                </View>
                <Switch
                  value={productEmail}
                  onValueChange={setProductEmail}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.iconBox}>
                  <MailEnvelopeIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Offers & Promotions</Text>
                  <Text style={styles.rowSubtitle}>Email me about offers and promotions</Text>
                </View>
                <Switch
                  value={offersEmail}
                  onValueChange={setOffersEmail}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={styles.iconBox}>
                  <MailEnvelopeIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Health Tips & Insights</Text>
                  <Text style={styles.rowSubtitle}>Receive health tips and insights</Text>
                </View>
                <Switch
                  value={healthEmail}
                  onValueChange={setHealthEmail}
                  trackColor={{ false: '#E2E8F0', true: '#FF521B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Section 3: Quiet Hours */}
            <Text style={styles.sectionTitle}>Quiet Hours</Text>
            <View style={styles.groupCard}>
              <TouchableOpacity style={styles.quietHoursRow} activeOpacity={0.8}>
                <View style={styles.iconBox}>
                  <ClockTipIcon size={18} color="#FF521B" />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>Quiet Hours</Text>
                  <Text style={styles.rowSubtitle}>Pause notifications during these hours</Text>
                </View>
                <View style={styles.quietTimeWrap}>
                  <Text style={styles.quietTimeText}>10:00 PM - 07:00 AM</Text>
                  <ChevronRightIcon size={16} color="#0F172A" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBannerBox}>
              <InfoCircleIcon size={18} color="#FF521B" />
              <Text style={styles.infoBannerText}>
                You will not receive push notifications during quiet hours.
              </Text>
            </View>

            {/* Save Changes Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
              onPress={handleSaveChanges}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="profile" onTabPress={onTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backButton: {
    padding: 4,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  placeholderButton: {
    width: 28,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  topIllustrationBlock: {
    alignItems: 'center',
    marginVertical: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 18,
    marginBottom: 10,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quietHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  quietTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quietTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF521B',
  },
  infoBannerBox: {
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    lineHeight: 17,
  },
  saveButton: {
    backgroundColor: '#FF521B',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
`;

fs.writeFileSync(notificationScreenFile, newNotificationScreenCode, 'utf8');
console.log('Successfully updated NotificationSettingsScreen.tsx with GET & PUT API connection!');
