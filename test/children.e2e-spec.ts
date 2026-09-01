import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from '../src/modules/auth/auth.module';
import { ChildrenModule } from '../src/modules/children/children.module';
import configuration from '../src/config/configuration';
import {
  BloodGroup,
  ChildAvatarPresetId,
  DietPreference,
  Gender,
  HeightUnit,
  WeightUnit,
} from '../src/common/constants';

describe('Children (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
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
    process.env.AVATAR_CDN_BASE_URL = 'http://localhost:3000/uploads';
    process.env.AVATAR_UPLOAD_DIR = 'uploads/avatars';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration], ignoreEnvFile: true }),
        MongooseModule.forRoot(uri),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        AuthModule,
        ChildrenModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ritika Sharma',
        email: 'parent@example.com',
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
      });

    accessToken = registerRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('POST /api/v1/children', () => {
    it('should create a child profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/children')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Aarav Sharma',
          dateOfBirth: '2022-07-14',
          gender: Gender.MALE,
          bloodGroup: BloodGroup.O_POSITIVE,
          avatarPresetId: ChildAvatarPresetId.CHILD1,
          allergies: ['Peanuts'],
          medicalConditions: [],
          dietPreference: DietPreference.VEGETARIAN,
          initialWeight: 14.2,
          initialWeightUnit: WeightUnit.KG,
          initialHeight: 96,
          initialHeightUnit: HeightUnit.CM,
        })
        .expect(201);

      expect(res.body.message).toBe('Child profile added successfully.');
      expect(res.body.data.name).toBe('Aarav Sharma');
      childId = res.body.data.childId;
    });
  });

  describe('GET /api/v1/children', () => {
    it('should return children list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/children')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.children).toHaveLength(1);
      expect(res.body.data.children[0].name).toBe('Aarav Sharma');
      expect(res.body.data.children[0].latestGrowth.bmi).toBeDefined();
      expect(res.body.data.children[0].ageDisplay).toMatch(/years/);
    });
  });

  describe('PUT /api/v1/children/:childId', () => {
    it('should update child profile', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/children/${childId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Aarav Sharma Updated',
          dateOfBirth: '2022-07-14',
          gender: Gender.MALE,
          bloodGroup: BloodGroup.O_POSITIVE,
          avatarPresetId: ChildAvatarPresetId.CHILD1,
          allergies: ['Peanuts', 'Dairy'],
          medicalConditions: ['Lactose Intolerant'],
          dietPreference: DietPreference.VEGETARIAN,
        })
        .expect(200);

      expect(res.body.message).toBe('Child profile updated successfully.');
      expect(res.body.data.name).toBe('Aarav Sharma Updated');
    });
  });

  describe('POST /api/v1/children/:childId/avatar/upload', () => {
    it('should upload child avatar', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/children/${childId}/avatar/upload`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('avatar', Buffer.from('fake-image-data'), {
          filename: 'avatar.jpg',
          contentType: 'image/jpeg',
        })
        .expect(200);

      expect(res.body.data.avatarUrl).toContain('/avatars/');
    });
  });

  describe('DELETE /api/v1/children/:childId', () => {
    it('should delete child profile', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/children/${childId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('Child profile deleted successfully.');
    });

    it('should return 404 for deleted child', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/children/${childId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
