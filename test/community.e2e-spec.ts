import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthModule } from '../src/modules/auth/auth.module';
import { CommunityModule } from '../src/modules/community/community.module';
import { CommunitySeedService } from '../src/modules/community/services/community-seed.service';
import configuration from '../src/config/configuration';
import { PostCategory } from '../src/common/constants';
import { CommunityPost } from '../src/modules/community/schemas/community-post.schema';

describe('Community (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let postId: string;

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
        CommunityModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    await app.get(CommunitySeedService).seed();

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ritika Sharma',
        email: 'community@example.com',
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
      });

    accessToken = registerRes.body.data.accessToken;

    const postModel = app.get(getModelToken(CommunityPost.name));
    const post = await postModel.findOne({ category: PostCategory.NUTRITION });
    postId = post._id.toString();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('GET /api/v1/community/posts', () => {
    it('should return paginated posts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/community/posts?tab=for_you&page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.posts.length).toBeGreaterThan(0);
      expect(res.body.data.posts[0].postId).toBeDefined();
      expect(res.body.data.posts[0].categoryColor).toBeDefined();
      expect(res.body.data.pagination.total).toBeGreaterThan(0);
    });

    it('should filter posts by nutrition tab', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/community/posts?tab=nutrition')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.posts.every((post: { category: string }) => post.category === 'Nutrition')).toBe(
        true,
      );
    });
  });

  describe('GET /api/v1/community/posts/search', () => {
    it('should search posts by keyword', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/community/posts/search?q=oats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.posts.length).toBeGreaterThan(0);
      expect(
        res.body.data.posts.some((post: { title: string; body: string }) =>
          `${post.title} ${post.body}`.toLowerCase().includes('oats'),
        ),
      ).toBe(true);
    });
  });

  describe('POST /api/v1/community/posts/:postId/like', () => {
    it('should toggle like on a post', async () => {
      const likeRes = await request(app.getHttpServer())
        .post(`/api/v1/community/posts/${postId}/like`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(likeRes.body.data.isLiked).toBe(true);
      expect(likeRes.body.data.likesCount).toBeGreaterThan(0);

      const unlikeRes = await request(app.getHttpServer())
        .post(`/api/v1/community/posts/${postId}/like`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(unlikeRes.body.data.isLiked).toBe(false);
    });
  });

  describe('GET /api/v1/community/posts/:postId/comments', () => {
    it('should return comments for a post', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/community/posts/${postId}/comments?page=1&limit=20`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.comments.length).toBeGreaterThan(0);
      expect(res.body.data.comments[0].commentId).toBeDefined();
      expect(res.body.data.pagination.total).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/community/posts/:postId/comments', () => {
    it('should add a comment to a post', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/community/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'Great post! We switched to brown rice too.' })
        .expect(201);

      expect(res.body.message).toBe('Comment added.');
      expect(res.body.data.commentId).toBeDefined();
      expect(res.body.data.text).toBe('Great post! We switched to brown rice too.');
    });
  });

  describe('POST /api/v1/community/posts', () => {
    it('should create a new post', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/community/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          category: PostCategory.NUTRITION,
          title: 'Best protein sources for toddlers?',
          body: 'My son is 2 years old. Looking for high-protein vegetarian foods.',
        })
        .expect(201);

      expect(res.body.message).toBe('Post created successfully.');
      expect(res.body.data.postId).toBeDefined();
    });
  });

  describe('GET /api/v1/community/topics', () => {
    it('should return topic tags with post counts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/community/topics')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.topics.length).toBe(5);
      expect(res.body.data.topics[0].name).toBeDefined();
      expect(res.body.data.topics[0].postCount).toBeGreaterThanOrEqual(0);
    });
  });
});
