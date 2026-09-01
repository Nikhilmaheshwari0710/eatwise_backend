import { NotificationType } from '../../../common/constants';

export interface NotificationTypeMeta {
  icon: string;
  tint: string;
  iconColor: string;
}

export const NOTIFICATION_TYPE_META: Record<NotificationType, NotificationTypeMeta> = {
  [NotificationType.HEALTH_ALERT]: {
    icon: 'alert',
    tint: '#FFF0EA',
    iconColor: '#FF521B',
  },
  [NotificationType.WEEKLY_REPORT]: {
    icon: 'report',
    tint: '#EAF8EE',
    iconColor: '#10B981',
  },
  [NotificationType.MONTHLY_REPORT]: {
    icon: 'report',
    tint: '#EAF8EE',
    iconColor: '#10B981',
  },
  [NotificationType.GROWTH_MILESTONE]: {
    icon: 'milestone',
    tint: '#F3EEFF',
    iconColor: '#7C3AED',
  },
  [NotificationType.AI_TIP]: {
    icon: 'tip',
    tint: '#EFF6FF',
    iconColor: '#3B82F6',
  },
  [NotificationType.PRODUCT_RECALL]: {
    icon: 'alert',
    tint: '#FFF0EA',
    iconColor: '#FF521B',
  },
  [NotificationType.SYSTEM]: {
    icon: 'system',
    tint: '#F3F4F6',
    iconColor: '#6B7280',
  },
};

export interface NotificationSettingDefinition {
  settingId: string;
  category: string;
  items: Array<{
    key: string;
    label: string;
    description: string;
    defaultEnabled: boolean;
  }>;
}

export const NOTIFICATION_SETTING_DEFINITIONS: NotificationSettingDefinition[] = [
  {
    settingId: 'set_001',
    category: 'Health & Nutrition Alerts',
    items: [
      {
        key: 'high_sugar_alert',
        label: 'High Sugar Alerts',
        description: 'Get notified when a product has high sugar content',
        defaultEnabled: true,
      },
      {
        key: 'high_sodium_alert',
        label: 'High Sodium Alerts',
        description: 'Get notified when a product has high sodium content',
        defaultEnabled: true,
      },
      {
        key: 'harmful_additives_alert',
        label: 'Harmful Additives',
        description: 'Alerts for artificial colors, preservatives, MSG etc.',
        defaultEnabled: true,
      },
    ],
  },
  {
    settingId: 'set_002',
    category: 'Weekly & Monthly Reports',
    items: [
      {
        key: 'weekly_report_ready',
        label: 'Weekly Report Ready',
        description: 'Notify when weekly health report is generated',
        defaultEnabled: true,
      },
      {
        key: 'monthly_report_ready',
        label: 'Monthly Report Ready',
        description: 'Notify when monthly health report is generated',
        defaultEnabled: false,
      },
    ],
  },
  {
    settingId: 'set_003',
    category: 'Growth & Milestones',
    items: [
      {
        key: 'growth_milestone',
        label: 'Growth Milestones',
        description: 'Celebrate height and weight milestone achievements',
        defaultEnabled: true,
      },
    ],
  },
];

export function getDefaultPreferences(): Record<string, boolean> {
  const preferences: Record<string, boolean> = {};
  for (const group of NOTIFICATION_SETTING_DEFINITIONS) {
    for (const item of group.items) {
      preferences[item.key] = item.defaultEnabled;
    }
  }
  return preferences;
}

export function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
