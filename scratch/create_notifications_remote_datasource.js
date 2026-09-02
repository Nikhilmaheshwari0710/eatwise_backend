const fs = require('fs');

const dsFile = 'd:/backup project/eatwise/eatwise_app/src/features/profile/data/datasources/NotificationsRemoteDataSource.ts';

const code = `import { apiClient } from '../../../../shared/network/apiClient';

export interface NotificationItemApi {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  tint: string;
  iconColor: string;
  childId?: string | null;
  childName?: string | null;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
  actionUrl?: string | null;
}

export interface GetNotificationsResult {
  unreadCount: number;
  notifications: NotificationItemApi[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SettingItemApi {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SettingCategoryGroupApi {
  settingId: string;
  category: string;
  items: SettingItemApi[];
}

export class NotificationsRemoteDataSource {
  async getNotifications(token: string, filter: string = 'ALL'): Promise<GetNotificationsResult> {
    const query = filter && filter !== 'ALL' ? \`?filter=\${filter.toUpperCase()}\` : '';
    const response = await apiClient.request<any>(\`/notifications\${query}\`, { method: 'GET' }, token);
    const raw = (response as any).data;
    return {
      unreadCount: raw.unreadCount ?? 0,
      notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
      pagination: raw.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
  }

  async getSettings(token: string): Promise<SettingCategoryGroupApi[]> {
    const response = await apiClient.request<any>('/notifications/settings', { method: 'GET' }, token);
    const raw = (response as any).data;
    return Array.isArray(raw?.settings) ? raw.settings : [];
  }

  async updateSettings(token: string, settings: Array<{ key: string; enabled: boolean }>): Promise<void> {
    await apiClient.request<any>('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }, token);
  }

  async markAsRead(token: string, notificationId: string): Promise<void> {
    await apiClient.request<any>(\`/notifications/\${notificationId}/read\`, {
      method: 'PUT',
    }, token);
  }

  async markAllAsRead(token: string): Promise<void> {
    await apiClient.request<any>('/notifications/read-all', {
      method: 'PUT',
    }, token);
  }

  async deleteNotification(token: string, notificationId: string): Promise<void> {
    await apiClient.request<any>(\`/notifications/\${notificationId}\`, {
      method: 'DELETE',
    }, token);
  }

  async clearAll(token: string): Promise<void> {
    await apiClient.request<any>('/notifications/clear-all', {
      method: 'DELETE',
    }, token);
  }
}
`;

fs.writeFileSync(dsFile, code, 'utf8');
console.log('✅ Created NotificationsRemoteDataSource.ts!');
