import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('status', 'ok');
          expect(res.body.data).toHaveProperty('timestamp');
          expect(res.body.data).toHaveProperty('uptime');
        });
    });
  });

  describe('/api/users', () => {
    let createdUserId: string;

    it('POST /api/users - should create a user', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('John Doe');
          expect(res.body.data.email).toBe('john@example.com');
          createdUserId = res.body.data.id;
        });
    });

    it('POST /api/users - should reject invalid input', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: '',
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('POST /api/users - should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Jane Doe',
          email: 'john@example.com',
        })
        .expect(409);
    });

    it('GET /api/users - should return paginated users', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('GET /api/users/:id - should return a user', async () => {
      return request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(createdUserId);
        });
    });

    it('GET /api/users/:id - should return 400 for invalid UUID', () => {
      return request(app.getHttpServer())
        .get('/api/users/invalid-uuid')
        .expect(400);
    });

    it('PUT /api/users/:id - should update a user', () => {
      return request(app.getHttpServer())
        .put(`/api/users/${createdUserId}`)
        .send({ name: 'John Updated' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('John Updated');
        });
    });

    it('DELETE /api/users/:id - should delete a user', () => {
      return request(app.getHttpServer())
        .delete(`/api/users/${createdUserId}`)
        .expect(204);
    });

    it('GET /api/users/:id - should return 404 after deletion', () => {
      return request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .expect(404);
    });
  });
});
