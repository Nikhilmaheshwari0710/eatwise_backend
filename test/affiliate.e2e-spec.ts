import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types } from 'mongoose';
import { AuthModule } from '../src/modules/auth/auth.module';
import { AffiliateModule } from '../src/modules/affiliate/affiliate.module';
import configuration from '../src/config/configuration';
import {
  AffiliatePlatformId,
  AffiliateTransactionStatus,
} from '../src/common/constants';
import { AffiliateTransaction } from '../src/modules/affiliate/schemas/affiliate-transaction.schema';

describe('Affiliate (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let userId: string;
  let shortLink: string;

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
        AffiliateModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ritika Sharma',
        email: 'affiliate@example.com',
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
      });

    accessToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('GET /api/v1/affiliate/profile', () => {
    it('should return unenrolled profile for new users', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/affiliate/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.isEnrolled).toBe(false);
      expect(res.body.data.totalEarnings).toBe(0);
      expect(res.body.data.connectedPlatforms).toEqual([]);
    });
  });

  describe('GET /api/v1/affiliate/platforms', () => {
    it('should return supported affiliate platforms', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/affiliate/platforms')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.platforms).toHaveLength(4);
      expect(res.body.data.platforms[0].platformId).toBe('Amazon');
      expect(res.body.data.platforms[0].linkPrefix).toContain('amzn.to');
    });
  });

  describe('POST /api/v1/affiliate/enroll', () => {
    it('should enroll the user in the affiliate program', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/affiliate/enroll')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          agreedToTerms: true,
          preferredPlatform: AffiliatePlatformId.AMAZON,
          affiliateTag: 'ritika123-21',
        })
        .expect(201);

      expect(res.body.message).toContain('enrolled');
      expect(res.body.data.affiliateId).toMatch(/^ew_aff_/);
      expect(res.body.data.enrolledAt).toBeDefined();
    });
  });

  describe('POST /api/v1/affiliate/generate-link', () => {
    it('should generate an affiliate link', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/affiliate/generate-link')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          platformId: AffiliatePlatformId.AMAZON,
          affiliateTag: 'ritika123-21',
          productUrl: null,
        })
        .expect(200);

      expect(res.body.data.generatedLink).toContain('ritika123-21');
      expect(res.body.data.shortLink).toContain('https://eatwise.link/a/');
      shortLink = res.body.data.shortLink;
    });
  });

  describe('POST /api/v1/affiliate/track-click', () => {
    it('should track a click without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/affiliate/track-click')
        .send({
          shortLink,
          source: 'whatsapp',
          deviceType: 'android',
        })
        .expect(200);

      expect(res.body.message).toBe('Click tracked.');
    });
  });

  describe('PUT /api/v1/affiliate/bank-details', () => {
    it('should save bank details', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/affiliate/bank-details')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          accountHolderName: 'Ritika Sharma',
          bankName: 'HDFC Bank',
          accountNumber: '50100123456789',
          ifscCode: 'HDFC0001234',
          upiId: 'ritika@upi',
        })
        .expect(200);

      expect(res.body.message).toBe('Bank details saved successfully.');
    });
  });

  describe('GET /api/v1/affiliate/transactions', () => {
    beforeAll(async () => {
      const transactionModel = app.get(getModelToken(AffiliateTransaction.name));
      await transactionModel.create([
        {
          userId: new Types.ObjectId(userId),
          platformId: AffiliatePlatformId.AMAZON,
          amount: 148.5,
          currency: 'INR',
          status: AffiliateTransactionStatus.PAID,
          ordersCount: 8,
          clicksCount: 124,
          periodStart: new Date('2025-08-01'),
          periodEnd: new Date('2025-08-31'),
          paidAt: new Date('2025-09-01T00:00:00Z'),
        },
        {
          userId: new Types.ObjectId(userId),
          platformId: AffiliatePlatformId.FLIPKART,
          amount: 350,
          currency: 'INR',
          status: AffiliateTransactionStatus.PENDING,
          ordersCount: 12,
          clicksCount: 98,
          periodStart: new Date('2025-09-01'),
          periodEnd: new Date('2025-09-30'),
        },
      ]);
    });

    it('should return transaction history', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/affiliate/transactions?page=1&limit=20')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.transactions).toHaveLength(2);
      expect(res.body.data.transactions[0].statusLabel).toBeDefined();
      expect(res.body.data.transactions[0].statusColor).toBeDefined();
      expect(res.body.data.pagination.total).toBe(2);
    });

    it('should return enrolled profile with earnings after transactions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/affiliate/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.isEnrolled).toBe(true);
      expect(res.body.data.totalEarnings).toBe(498.5);
      expect(res.body.data.pendingEarnings).toBe(350);
      expect(res.body.data.paidEarnings).toBe(148.5);
      expect(res.body.data.totalClicks).toBe(1);
      expect(res.body.data.bankLinked).toBe(true);
      expect(res.body.data.connectedPlatforms).toHaveLength(1);
    });
  });
});
