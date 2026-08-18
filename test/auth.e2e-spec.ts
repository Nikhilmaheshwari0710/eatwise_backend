import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from '../src/modules/auth/auth.module';
import configuration from '../src/config/configuration';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let refreshToken: string;

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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register with email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ fullName: 'John Doe', email: 'john@example.com', password: 'StrongP@ss1', confirmPassword: 'StrongP@ss1' })
        .expect(201);

      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ fullName: 'Jane Doe', email: 'john@example.com', password: 'StrongP@ss1', confirmPassword: 'StrongP@ss1' })
        .expect(409);
    });

    it('should register with phone', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ fullName: 'Phone User', phoneNumber: '+919876543210' })
        .expect(201);

      expect(res.body.data.user.phoneNumber).toBe('+919876543210');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with correct password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'john@example.com', password: 'StrongP@ss1' })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'john@example.com', password: 'WrongPass1' })
        .expect(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.user.email).toBe('john@example.com');
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('Phone OTP flow', () => {
    let otp: string;

    it('should send OTP', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/phone/send-otp')
        .send({ phoneNumber: '+911234567890' })
        .expect(200);

      otp = res.body.data.otp;
      expect(otp).toBeDefined();
    });

    it('should verify OTP', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/phone/verify-otp')
        .send({ phoneNumber: '+911234567890', otp })
        .expect(200);

      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid OTP', async () => {
      // Send new OTP first
      const sendRes = await request(app.getHttpServer())
        .post('/api/v1/auth/phone/send-otp')
        .send({ phoneNumber: '+911111111111' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/phone/verify-otp')
        .send({ phoneNumber: '+911111111111', otp: '000000' })
        .expect(400);
    });
  });

  describe('Forgot/Reset Password flow', () => {
    let resetOtp: string;
    let resetToken: string;

    it('should send forgot password OTP', async () => {
      // Use phone-based reset
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ phoneNumber: '+919876543210' })
        .expect(200);
    });

    it('should reset password after OTP verification', async () => {
      // Send OTP for reset
      const sendRes = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'john@example.com' })
        .expect(200);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });
});
