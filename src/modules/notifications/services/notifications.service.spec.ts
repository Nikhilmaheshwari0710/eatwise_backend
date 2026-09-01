import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from '../schemas/notification.schema';
import { NotificationSettings } from '../schemas/notification-settings.schema';
import { PushToken } from '../schemas/push-token.schema';
import {
  NotificationFilter,
  NotificationType,
  PushPlatform,
} from '../../../common/constants';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const userId = '507f1f77bcf86cd799439011';
  const notificationId = '507f1f77bcf86cd799439012';

  const notificationModel = {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  };

  const settingsModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const pushTokenModel = {
    findOneAndUpdate: jest.fn(),
  };

  const notificationDoc = {
    _id: { toString: () => notificationId },
    userId,
    type: NotificationType.HEALTH_ALERT,
    title: 'High Sugar Alert!',
    message: 'Test message',
    isRead: false,
    createdAt: new Date(),
    save: jest.fn().mockResolvedValue(undefined),
    deleteOne: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getModelToken(Notification.name), useValue: notificationModel },
        { provide: getModelToken(NotificationSettings.name), useValue: settingsModel },
        { provide: getModelToken(PushToken.name), useValue: pushTokenModel },
      ],
    }).compile();

    service = module.get(NotificationsService);
    jest.clearAllMocks();
  });

  it('should list notifications with pagination', async () => {
    notificationModel.countDocuments
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    notificationModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([notificationDoc]),
        }),
      }),
    });

    const result = await service.getNotifications(userId, {
      filter: NotificationFilter.ALL,
      page: 1,
      limit: 20,
    });

    expect(result.data.notifications).toHaveLength(1);
    expect(result.data.unreadCount).toBe(1);
    expect(result.data.pagination.total).toBe(1);
  });

  it('should mark notification as read', async () => {
    notificationModel.findOne.mockResolvedValue(notificationDoc);

    const result = await service.markAsRead(userId, notificationId);

    expect(result.message).toBe('Notification marked as read.');
    expect(notificationDoc.save).toHaveBeenCalled();
  });

  it('should mark all notifications as read', async () => {
    notificationModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

    const result = await service.markAllAsRead(userId);

    expect(result.data.updatedCount).toBe(3);
  });

  it('should delete notification', async () => {
    notificationModel.findOne.mockResolvedValue(notificationDoc);

    const result = await service.deleteNotification(userId, notificationId);

    expect(result.message).toBe('Notification deleted.');
    expect(notificationDoc.deleteOne).toHaveBeenCalled();
  });

  it('should clear all notifications', async () => {
    notificationModel.deleteMany.mockResolvedValue({ deletedCount: 5 });

    const result = await service.clearAll(userId);

    expect(result.data.deletedCount).toBe(5);
  });

  it('should return default settings', async () => {
    settingsModel.findOne.mockResolvedValue(null);

    const result = await service.getSettings(userId);

    expect(result.data.settings).toHaveLength(3);
    expect(result.data.settings[0].items[0].key).toBe('high_sugar_alert');
  });

  it('should update settings', async () => {
    settingsModel.findOne.mockResolvedValue(null);
    settingsModel.findOneAndUpdate.mockResolvedValue({});

    const result = await service.updateSettings(userId, {
      settings: [{ key: 'weekly_report_ready', enabled: false }],
    });

    expect(result.message).toBe('Notification settings updated successfully.');
  });

  it('should reject invalid setting key', async () => {
    settingsModel.findOne.mockResolvedValue(null);

    await expect(
      service.updateSettings(userId, {
        settings: [{ key: 'invalid_key', enabled: true }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should register push token', async () => {
    pushTokenModel.findOneAndUpdate.mockResolvedValue({});

    const result = await service.registerPushToken(userId, {
      token: 'fcm_token_abc',
      platform: PushPlatform.ANDROID,
      deviceId: 'device-1',
    });

    expect(result.message).toBe('Push token registered successfully.');
  });

  it('should throw when notification not found', async () => {
    notificationModel.findOne.mockResolvedValue(null);

    await expect(
      service.markAsRead(userId, notificationId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
