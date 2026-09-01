import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from '../src/modules/auth/auth.module';
import { DashboardModule } from '../src/modules/dashboard/dashboard.module';
import { ChildrenModule } from '../src/modules/children/children.module';
import { ProductsModule } from '../src/modules/products/products.module';
import { ScansModule } from '../src/modules/scans/scans.module';
import { NotificationsModule } from '../src/modules/notifications/notifications.module';
import configuration from '../src/config/configuration';
import { ProductSeedService } from '../src/modules/products/services/product-seed.service';
import {
  Gender,
  HeightUnit,
  NotificationType,
  WeightUnit,
} from '../src/common/constants';

describe('Dashboard (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let productId: string;
  let childId: string;

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
        ProductsModule,
        ChildrenModule,
        ScansModule,
        NotificationsModule,
        DashboardModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    await app.get(ProductSeedService).seed();

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ritika Sharma',
        email: 'dashboard.user@example.com',
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
      });

    accessToken = registerRes.body.data.accessToken;

    const childRes = await request(app.getHttpServer())
      .post('/api/v1/children')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Aarav Sharma',
        dateOfBirth: '2022-07-14',
        gender: Gender.MALE,
        initialWeight: 14.2,
        initialWeightUnit: WeightUnit.KG,
        initialHeight: 96,
        initialHeightUnit: HeightUnit.CM,
      });

    childId = childRes.body.data.childId;

    const productRes = await request(app.getHttpServer())
      .get('/api/v1/products/barcode/8901063112119')
      .set('Authorization', `Bearer ${accessToken}`);

    productId = productRes.body.data.productId;

    await request(app.getHttpServer())
      .post('/api/v1/scans')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        productId,
        barcode: '8901063112119',
        childId,
        scannedAt: new Date().toISOString(),
      });
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('GET /api/v1/dashboard', () => {
    it('should return complete dashboard data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.user.name).toBe('Ritika Sharma');
      expect(res.body.data.todayDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(res.body.data.todayDay).toBeTruthy();
      expect(res.body.data.children).toHaveLength(1);
      expect(res.body.data.children[0].name).toBe('Aarav Sharma');
      expect(res.body.data.children[0].details).toContain('Boy');
      expect(res.body.data.children[0].weight).toBe('14.2 kg');
      expect(res.body.data.children[0].height).toBe('96 cm');
      expect(res.body.data.recentActivity.length).toBeGreaterThan(0);
      expect(res.body.data.recentActivity[0].icon).toBe('scan');
      expect(res.body.data.recentActivity[0].title).toContain('Maggi');
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .expect(401);
    });
  });
});
