import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { AuthModule } from '../src/modules/auth/auth.module';
import { NotificationsModule } from '../src/modules/notifications/notifications.module';
import configuration from '../src/config/configuration';
import { NotificationType, PushPlatform } from '../src/common/constants';
import { Notification } from '../src/modules/notifications/schemas/notification.schema';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let userId: string;
  let notificationId: string;
  let notificationModel: any;

  jest.setTimeout(30000);

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    process.env.MONGODB_URI = uri;
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.OTP_EXPIRY_SECONDS = '300';
    process.env.OTP_MAX_ATTEMPTS = '5';
    process.env.OTP_RESEND_COOLDOWN_SECONDS = '0';
    process.env.NODE_ENV = 'development';
    process.env.MAILTRAP_API_TOKEN = '';
    process.env.MAILTRAP_API_URL = '';
    process.env.MAILTRAP_FROM_EMAIL = '';
    process.env.MAILTRAP_HOST = '';
    process.env.MAILTRAP_USERNAME = '';
    process.env.MAILTRAP_PASSWORD = '';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration], ignoreEnvFile: true }),
        MongooseModule.forRoot(uri),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        AuthModule,
        NotificationsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    notificationModel = app.get(getModelToken(Notification.name));

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ritika Sharma',
        email: 'notifications@example.com',
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
      });

    accessToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;

    const notif = await notificationModel.create({
      userId: new Types.ObjectId(userId),
      type: NotificationType.HEALTH_ALERT,
      title: 'High Sugar Alert!',
      message: 'Aarav consumed 3 high-sugar products today.',
      childName: 'Aarav',
      isRead: false,
    });

    await notificationModel.create({
      userId: new Types.ObjectId(userId),
      type: NotificationType.WEEKLY_REPORT,
      title: 'Weekly Report Ready!',
      message: 'Weekly report is ready.',
      isRead: false,
      actionUrl: '/reports/weekly',
    });

    await notificationModel.create({
      userId: new Types.ObjectId(userId),
      type: NotificationType.GROWTH_MILESTONE,
      title: 'Growth Milestone!',
      message: 'Myra reached 112 cm height!',
      childName: 'Myra',
      isRead: true,
    });

    notificationId = notif._id.toString();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('GET /api/v1/notifications', () => {
    it('should return notifications with unread count and pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications?filter=all&page=1&limit=20')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.notifications).toHaveLength(3);
      expect(res.body.data.unreadCount).toBe(2);
      expect(res.body.data.pagination.total).toBe(3);
      expect(res.body.data.notifications[0].icon).toBeDefined();
      expect(res.body.data.notifications[0].timeAgo).toBeDefined();
    });

    it('should filter unread notifications', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications?filter=unread')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.notifications).toHaveLength(2);
      expect(res.body.data.notifications.every((n: any) => !n.isRead)).toBe(true);
    });
  });

  describe('PUT /api/v1/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('Notification marked as read.');
    });
  });

  describe('PUT /api/v1/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('All notifications marked as read.');
      expect(res.body.data.updatedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/v1/notifications/settings', () => {
    it('should return notification settings', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.settings).toHaveLength(3);
      expect(res.body.data.settings[0].category).toBe('Health & Nutrition Alerts');
    });
  });

  describe('PUT /api/v1/notifications/settings', () => {
    it('should update notification settings', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/notifications/settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          settings: [
            { key: 'high_sugar_alert', enabled: true },
            { key: 'weekly_report_ready', enabled: false },
          ],
        })
        .expect(200);

      expect(res.body.message).toBe('Notification settings updated successfully.');
    });
  });

  describe('POST /api/v1/notifications/push-token', () => {
    it('should register push token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/notifications/push-token')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          token: 'fcm_token_here_abc123xyz',
          platform: PushPlatform.ANDROID,
          deviceId: 'device_unique_id',
        })
        .expect(200);

      expect(res.body.message).toBe('Push token registered successfully.');
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    it('should delete a notification', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('Notification deleted.');
    });
  });

  describe('DELETE /api/v1/notifications/clear-all', () => {
    it('should clear all notifications', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/notifications/clear-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('All notifications cleared.');
      expect(res.body.data.deletedCount).toBeGreaterThanOrEqual(0);
    });
  });
});
