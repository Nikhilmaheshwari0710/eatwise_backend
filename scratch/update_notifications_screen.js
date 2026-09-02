const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/NotificationsScreen.tsx';

const code = `import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { BottomNavBar } from '../../../home/presentation/components/BottomNavBar';
import { authMemoryStore } from '../../../../shared/storage/authMemoryStore';
import {
  NotificationItemApi,
  NotificationsRemoteDataSource,
} from '../../data/datasources/NotificationsRemoteDataSource';
import {
  BackArrowIcon,
  ChevronRightIcon,
} from '../../../../shared/components/AppIcons';

const SettingsGearIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = '#FF521B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const OrangeBellIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="#FF521B" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckAllIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#FF521B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface NotificationsScreenProps {
  onBack?: () => void;
  onNavigateToSettings?: () => void;
  onTabPress?: (tab: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onNavigateToSettings,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'HEALTH' | 'ACTIVITY'>('ALL');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItemApi[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifDS = React.useMemo(() => new NotificationsRemoteDataSource(), []);

  const fetchNotifs = useCallback(async (filter = activeTab) => {
    try {
      setLoading(true);
      const session = authMemoryStore.getSession();
      if (!session?.accessToken) return;
      const res = await notifDS.getNotifications(session.accessToken, filter);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err: any) {
      console.log('Fetch notifications error:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, notifDS]);

  useEffect(() => {
    fetchNotifs(activeTab);
  }, [activeTab, fetchNotifs]);

  const handleMarkAsRead = async (item: NotificationItemApi) => {
    if (item.isRead) return;
    setNotifications(prev => prev.map(n => n.notificationId === item.notificationId ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const session = authMemoryStore.getSession();
      if (session?.accessToken) {
        await notifDS.markAsRead(session.accessToken, item.notificationId);
      }
    } catch (err: any) {
      console.log('Mark read error:', err?.message);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const session = authMemoryStore.getSession();
      if (session?.accessToken) {
        await notifDS.markAllAsRead(session.accessToken);
        Alert.alert('Success', 'All notifications marked as read.');
      }
    } catch (err: any) {
      console.log('Mark all read error:', err?.message);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header Bar */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <BackArrowIcon size={24} color="#FF521B" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? \`\${unreadCount} unread alert\${unreadCount === 1 ? '' : 's'}\` : 'All caught up!'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7} style={styles.headerRightButton}>
              <CheckAllIcon size={22} color="#FF521B" />
            </TouchableOpacity>
          )}
          {onNavigateToSettings && (
            <TouchableOpacity onPress={onNavigateToSettings} activeOpacity={0.7} style={styles.headerRightButton}>
              <SettingsGearIcon size={22} color="#FF521B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs Filter Chips */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('ALL')}
          style={[styles.tabChip, activeTab === 'ALL' && styles.tabChipActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabChipText, activeTab === 'ALL' && styles.tabChipTextActive]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('UNREAD')}
          style={[styles.tabChip, activeTab === 'UNREAD' && styles.tabChipActive]}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.tabChipText, activeTab === 'UNREAD' && styles.tabChipTextActive]}>Unread</Text>
            {unreadCount > 0 && <View style={styles.tabBadgeDot} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('HEALTH')}
          style={[styles.tabChip, activeTab === 'HEALTH' && styles.tabChipActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabChipText, activeTab === 'HEALTH' && styles.tabChipTextActive]}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('ACTIVITY')}
          style={[styles.tabChip, activeTab === 'ACTIVITY' && styles.tabChipActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabChipText, activeTab === 'ACTIVITY' && styles.tabChipTextActive]}>Updates</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF521B" />
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ flex: 1, paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: '800', marginTop: 12 }}>No notifications found</Text>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            {notifications.map((item, idx) => (
              <TouchableOpacity
                key={item.notificationId}
                style={[
                  styles.notiRow,
                  idx < notifications.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
                ]}
                activeOpacity={0.8}
                onPress={() => handleMarkAsRead(item)}
              >
                <View style={styles.unreadDotContainer}>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <View style={[styles.iconWrap, { backgroundColor: item.tint || '#FFF0EA' }]}>
                  <OrangeBellIcon />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.notiTitle, !item.isRead && styles.notiTitleUnread]}>{item.title}</Text>
                  <Text style={styles.notiDesc}>{item.message}</Text>
                  <Text style={styles.notiTime}>{item.timeAgo}</Text>
                </View>

                <ChevronRightIcon size={16} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Enable push notification sticky banner */}
        <View style={styles.pushNotificationBanner}>
          <View style={styles.bannerIconBg}>
            <OrangeBellIcon />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Enable push notifications</Text>
            <Text style={styles.bannerSubtitleText}>Get instant alerts for important updates.</Text>
          </View>
          <TouchableOpacity
            style={styles.bannerBtn}
            onPress={() => Alert.alert('Push Notifications', 'Push notifications enabled successfully!')}
            activeOpacity={0.8}
          >
            <Text style={styles.bannerBtnText}>Enable Now</Text>
          </TouchableOpacity>
        </View>
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
  headerTitleWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  headerSubtitle: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 3 },
  headerRightButton: { padding: 4 },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 28 },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipActive: {
    backgroundColor: '#FF521B',
    borderColor: '#FF521B',
  },
  tabChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  tabBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  notiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  unreadDotContainer: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF521B',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  notiTitleUnread: {
    color: '#0F172A',
    fontWeight: '900',
  },
  notiDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
    lineHeight: 16,
  },
  notiTime: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '800',
  },

  pushNotificationBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F6',
    borderWidth: 1,
    borderColor: '#FFEAE2',
    borderRadius: 18,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
    gap: 10,
  },
  bannerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF521B',
  },
  bannerSubtitleText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  bannerBtn: {
    backgroundColor: '#FF521B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
`;

fs.writeFileSync(file, code, 'utf8');
console.log('✅ Updated NotificationsScreen.tsx!');
