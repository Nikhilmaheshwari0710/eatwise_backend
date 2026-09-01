import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { AuthModule } from '../src/modules/auth/auth.module';
import { ProductsModule } from '../src/modules/products/products.module';
import { ScansModule } from '../src/modules/scans/scans.module';
import { MastersModule } from '../src/modules/masters/masters.module';
import { ChildrenModule } from '../src/modules/children/children.module';
import configuration from '../src/config/configuration';
import { ProductSeedService } from '../src/modules/products/services/product-seed.service';
import { Gender, HeightUnit, WeightUnit } from '../src/common/constants';

describe('Scan Product (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let productId: string;
  let childId: string;
  let scanId: string;

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
        ScansModule,
        MastersModule,
        ChildrenModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    const productSeedService = app.get(ProductSeedService);
    await productSeedService.seed();

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ritika Sharma',
        email: 'scan.user@example.com',
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
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('GET /api/v1/masters', () => {
    it('should return scan master data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/masters')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.productCategories.length).toBeGreaterThan(0);
      expect(res.body.data.healthLabels.length).toBe(4);
      expect(res.body.data.scanHistoryFilters.length).toBe(4);
    });
  });

  describe('GET /api/v1/products/barcode/:barcode', () => {
    it('should return product details for valid barcode', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products/barcode/8901063112119')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.name).toBe('Maggi 2-Minute Noodles');
      expect(res.body.data.healthLabel).toBe('High Risk');
      expect(res.body.data.highlights.length).toBeGreaterThan(0);
      expect(res.body.data.alternatives.length).toBeGreaterThan(0);
      productId = res.body.data.productId;
    });

    it('should return 404 for unknown barcode', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/barcode/9999999999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/products/search', () => {
    it('should search products by query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products/search?q=oats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.products.length).toBeGreaterThan(0);
      expect(res.body.data.products[0].name).toContain('Oats');
    });
  });

  describe('GET /api/v1/products/categories', () => {
    it('should return product categories with counts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.categories.length).toBe(10);
      expect(res.body.data.categories[0].productCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /api/v1/scans', () => {
    it('should save a scan record', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/scans')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId,
          barcode: '8901063112119',
          childId,
          scannedAt: new Date().toISOString(),
        })
        .expect(201);

      expect(res.body.message).toBe('Scan saved successfully.');
      scanId = res.body.data.scanId;
    });
  });

  describe('GET /api/v1/scans/history', () => {
    it('should return scan history with summary', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/scans/history?childId=${childId}&filter=all`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.scans.length).toBeGreaterThan(0);
      expect(res.body.data.summary.totalScans).toBeGreaterThan(0);
      expect(res.body.data.scans[0].productName).toBe('Maggi 2-Minute Noodles');
    });
  });
});
