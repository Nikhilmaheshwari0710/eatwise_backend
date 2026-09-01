import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from '../src/modules/auth/auth.module';
import { ProfileModule } from '../src/modules/profile/profile.module';
import configuration from '../src/config/configuration';
import {
  AvatarPresetId,
  DietPreference,
  Gender,
  OtpType,
  PreferredLanguage,
} from '../src/common/constants';
import { getModelToken } from '@nestjs/mongoose';
import { Otp } from '../src/modules/auth/schemas/otp.schema';

describe('Profile (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let otpModel: any;

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
    process.env.AVATAR_CDN_BASE_URL = 'http://localhost:3000/uploads';
    process.env.AVATAR_UPLOAD_DIR = 'uploads/avatars';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration], ignoreEnvFile: true }),
        MongooseModule.forRoot(uri),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        AuthModule,
        ProfileModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    otpModel = moduleFixture.get(getModelToken(Otp.name));

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ritika Sharma',
        email: 'ritika.sharma@gmail.com',
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
        phoneNumber: '+919876543210',
      });

    accessToken = registerRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('GET /api/v1/user/profile', () => {
    it('should return profile for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.name).toBe('Ritika Sharma');
      expect(res.body.data.email).toBe('ritika.sharma@gmail.com');
      expect(res.body.data.phone).toBe('+91 98765 43210');
    });

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/profile')
        .expect(401);
    });
  });

  describe('PUT /api/v1/user/profile', () => {
    it('should update profile fields', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Ritika Sharma',
          phone: '+91 98765 43210',
          dateOfBirth: '1994-04-15',
          gender: Gender.FEMALE,
          preferredLanguage: PreferredLanguage.ENGLISH_INDIA,
          dietPreference: DietPreference.VEGETARIAN,
          nutritionGoal: 'Focusing on wholesome sugar-free meals for my children.',
          avatarPresetId: AvatarPresetId.RITIKA,
        })
        .expect(200);

      expect(res.body.message).toBe('Profile updated successfully.');
      expect(res.body.data.name).toBe('Ritika Sharma');
    });
  });

  describe('POST /api/v1/user/avatar/upload', () => {
    it('should upload avatar image', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/user/avatar/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('avatar', Buffer.from('fake-image-data'), {
          filename: 'avatar.jpg',
          contentType: 'image/jpeg',
        })
        .expect(200);

      expect(res.body.data.avatarUrl).toContain('/avatars/');
    });
  });

  describe('Email change flow', () => {
    it('should request email change OTP', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/user/email/change-request')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ newEmail: 'new.email@gmail.com' })
        .expect(200);

      expect(res.body.message).toContain('OTP sent to new.email@gmail.com');
    });

    it('should verify email change OTP', async () => {
      const otpRecord = await otpModel
        .findOne({ identifier: 'new.email@gmail.com', type: OtpType.EMAIL_CHANGE })
        .sort({ createdAt: -1 });

      const bcrypt = require('bcrypt');
      const otp = '724190';
      otpRecord.hashedCode = await bcrypt.hash(otp, 10);
      await otpRecord.save();

      const res = await request(app.getHttpServer())
        .post('/api/v1/user/email/change-verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ newEmail: 'new.email@gmail.com', otp })
        .expect(200);

      expect(res.body.message).toBe('Email updated successfully.');
      expect(res.body.data.email).toBe('new.email@gmail.com');
      expect(res.body.data.emailVerified).toBe(true);
    });
  });
});
