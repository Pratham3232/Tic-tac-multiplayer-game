import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRoot(mongoUri),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.username).toBe('testuser');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should not register a user with existing username', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'duplicate',
          email: 'unique@example.com',
          password: 'password123',
        });

      // Attempt duplicate
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'duplicate',
          email: 'another@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          // missing email and password
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeAll(async () => {
      // Create a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123',
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'loginuser',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should not login with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'loginuser',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should not login with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'nonexistent',
          password: 'password123',
        })
        .expect(401);
    });
  });
});