import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../src/modules/auth/auth.module';
import { AccountModule } from '../src/modules/account/account.module';
import { ChildrenModule } from '../src/modules/children/children.module';
import configuration from '../src/config/configuration';
import { DeleteAccountReason, OtpType } from '../src/common/constants';
import { Otp } from '../src/modules/auth/schemas/otp.schema';

describe('Account Delete (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let deleteRequestId: string;
  let deleteToken: string;
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
        ChildrenModule,
        AccountModule,
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
        email: 'delete.me@example.com',
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
      });

    accessToken = registerRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('POST /api/v1/account/delete-request', () => {
    it('should initiate deletion and return masked email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/account/delete-request')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: DeleteAccountReason.PRIVACY_CONCERNS,
          reasonText: 'I am concerned about my data privacy.',
          password: 'StrongP@ss1',
        })
        .expect(200);

      expect(res.body.message).toContain('OTP sent to');
      expect(res.body.data.deleteRequestId).toBeDefined();
      expect(res.body.data.maskedEmail).toContain('***@');
      deleteRequestId = res.body.data.deleteRequestId;
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/account/delete-request')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reason: DeleteAccountReason.OTHER,
          password: 'WrongPass1',
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/account/delete-verify-otp', () => {
    it('should verify OTP and return delete token', async () => {
      const otpRecord = await otpModel
        .findOne({ identifier: deleteRequestId, type: OtpType.ACCOUNT_DELETE })
        .sort({ createdAt: -1 });

      const otp = '847291';
      otpRecord.hashedCode = await bcrypt.hash(otp, 10);
      await otpRecord.save();

      const res = await request(app.getHttpServer())
        .post('/api/v1/account/delete-verify-otp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deleteRequestId, otp })
        .expect(200);

      expect(res.body.message).toContain('OTP verified');
      expect(res.body.data.deleteToken).toBeDefined();
      deleteToken = res.body.data.deleteToken;
    });
  });

  describe('DELETE /api/v1/account', () => {
    it('should permanently delete account', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deleteToken })
        .expect(200);

      expect(res.body.message).toContain('permanently deleted');
      expect(res.body.data.deletedAt).toBeDefined();
    });

    it('should reject requests after account deletion', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });
});
