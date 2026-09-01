import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import {
  NotificationSettings,
  NotificationSettingsDocument,
} from '../schemas/notification-settings.schema';
import { PushToken, PushTokenDocument } from '../schemas/push-token.schema';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notification-settings.dto';
import { RegisterPushTokenDto } from '../dto/register-push-token.dto';
import {
  NotificationFilter,
  NotificationType,
} from '../../../common/constants';
import {
  getDefaultPreferences,
  NOTIFICATION_SETTING_DEFINITIONS,
} from '../config/notification.config';
import { toNotificationResponse } from '../utils/notification.util';

const HEALTH_TYPES = [NotificationType.HEALTH_ALERT, NotificationType.PRODUCT_RECALL];
const ACTIVITY_TYPES = [
  NotificationType.WEEKLY_REPORT,
  NotificationType.MONTHLY_REPORT,
  NotificationType.GROWTH_MILESTONE,
  NotificationType.AI_TIP,
];

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationSettings.name)
    private settingsModel: Model<NotificationSettingsDocument>,
    @InjectModel(PushToken.name) private pushTokenModel: Model<PushTokenDocument>,
  ) {}

  async getNotifications(userId: string, query: GetNotificationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter = query.filter ?? NotificationFilter.ALL;

    const mongoFilter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (filter === NotificationFilter.UNREAD) {
      mongoFilter.isRead = false;
    } else if (filter === NotificationFilter.HEALTH) {
      mongoFilter.type = { $in: HEALTH_TYPES };
    } else if (filter === NotificationFilter.ACTIVITY) {
      mongoFilter.type = { $in: ACTIVITY_TYPES };
    } else if (filter === NotificationFilter.SYSTEM) {
      mongoFilter.type = NotificationType.SYSTEM;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      this.notificationModel.countDocuments(mongoFilter),
      this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false,
      }),
      this.notificationModel
        .find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    return {
      message: 'Notifications fetched successfully',
      data: {
        unreadCount,
        notifications: notifications.map(toNotificationResponse),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.findOwnedNotification(userId, notificationId);
    notification.isRead = true;
    await notification.save();

    return {
      message: 'Notification marked as read.',
      data: {},
    };
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );

    return {
      message: 'All notifications marked as read.',
      data: { updatedCount: result.modifiedCount },
    };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.findOwnedNotification(userId, notificationId);
    await notification.deleteOne();

    return {
      message: 'Notification deleted.',
      data: {},
    };
  }

  async clearAll(userId: string) {
    const result = await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });

    return {
      message: 'All notifications cleared.',
      data: { deletedCount: result.deletedCount },
    };
  }

  async getSettings(userId: string) {
    const preferences = await this.getUserPreferences(userId);

    const settings = NOTIFICATION_SETTING_DEFINITIONS.map((group) => ({
      settingId: group.settingId,
      category: group.category,
      items: group.items.map((item) => ({
        key: item.key,
        label: item.label,
        description: item.description,
        enabled: preferences[item.key] ?? item.defaultEnabled,
      })),
    }));

    return {
      message: 'Notification settings fetched successfully',
      data: { settings },
    };
  }

  async updateSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    const validKeys = new Set(
      NOTIFICATION_SETTING_DEFINITIONS.flatMap((group) =>
        group.items.map((item) => item.key),
      ),
    );

    for (const setting of dto.settings) {
      if (!validKeys.has(setting.key)) {
        throw new BadRequestException(`Invalid setting key: ${setting.key}`);
      }
    }

    const preferences = await this.getUserPreferences(userId);
    for (const setting of dto.settings) {
      preferences[setting.key] = setting.enabled;
    }

    await this.settingsModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { preferences },
      { upsert: true, returnDocument: 'after' },
    );

    return {
      message: 'Notification settings updated successfully.',
      data: {},
    };
  }

  async registerPushToken(userId: string, dto: RegisterPushTokenDto) {
    await this.pushTokenModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        deviceId: dto.deviceId,
      },
      {
        userId: new Types.ObjectId(userId),
        token: dto.token,
        platform: dto.platform,
        deviceId: dto.deviceId,
      },
      { upsert: true, returnDocument: 'after' },
    );

    return {
      message: 'Push token registered successfully.',
      data: {},
    };
  }

  private async findOwnedNotification(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDocument> {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new NotFoundException('Notification not found.');
    }

    const notification = await this.notificationModel.findOne({
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    return notification;
  }

  private async getUserPreferences(userId: string): Promise<Record<string, boolean>> {
    const doc = await this.settingsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    const defaults = getDefaultPreferences();
    if (!doc?.preferences) {
      return defaults;
    }

    const stored =
      doc.preferences instanceof Map
        ? Object.fromEntries(doc.preferences.entries())
        : (doc.preferences as unknown as Record<string, boolean>);

    return { ...defaults, ...stored };
  }
}
