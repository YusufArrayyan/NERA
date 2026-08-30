/**
 * End-to-End API Tests for NERA Backend
 * Tests all major endpoints and workflows
 */

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('NERA Backend E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let sessionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Endpoints', () => {
    it('POST /auth/register - should register new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@neuroadaptive.com`,
          password: 'TestPassword123!',
          name: 'Test User',
          role: 'student',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');

      authToken = response.body.access_token;
      userId = response.body.user.id;
    });

    it('POST /auth/login - should login user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'siswa@neuroadaptive.com',
          password: 'Demo1234!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe('siswa@neuroadaptive.com');

      authToken = response.body.access_token;
      userId = response.body.user.id;
    });

    it('GET /auth/me - should get current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });

    it('POST /auth/refresh - should refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
    });
  });

  describe('EEG Data Endpoints', () => {
    it('POST /eeg/session/start - should create new EEG session', async () => {
      const response = await request(app.getHttpServer())
        .post('/eeg/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          device_type: 'SIMULATOR',
          session_name: 'Test EEG Session',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('session_id');
      expect(response.body).toHaveProperty('created_at');

      sessionId = response.body.session_id;
    });

    it('POST /eeg/data - should submit EEG data', async () => {
      const response = await request(app.getHttpServer())
        .post('/eeg/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          session_id: sessionId,
          focus_score: 85,
          relaxation_score: 60,
          stress_level: 'low',
          brain_waves: {
            delta: 5,
            theta: 8,
            alpha: 12,
            beta: 15,
            gamma: 3,
          },
          timestamp: Date.now(),
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('GET /eeg/sessions - should list user sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/eeg/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /eeg/session/:id - should get session details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/eeg/session/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.session_id).toBe(sessionId);
    });

    it('POST /eeg/session/end - should end EEG session', async () => {
      const response = await request(app.getHttpServer())
        .post(`/eeg/session/${sessionId}/end`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });
  });

  describe('Analytics Endpoints', () => {
    it('GET /analytics/dashboard - should get analytics dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_sessions');
      expect(response.body).toHaveProperty('average_focus');
      expect(response.body).toHaveProperty('average_relaxation');
    });

    it('GET /analytics/sessions - should get session analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /analytics/trends - should get trend analysis', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: 'week' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('focus_trend');
      expect(response.body).toHaveProperty('stress_trend');
    });
  });

  describe('Gamification Endpoints', () => {
    it('GET /gamification/profile - should get user gamification profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/gamification/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('points');
      expect(response.body).toHaveProperty('badges');
    });

    it('GET /gamification/leaderboard - should get leaderboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/gamification/leaderboard')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /gamification/achievements - should list achievements', async () => {
      const response = await request(app.getHttpServer())
        .get('/gamification/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Learning Content Endpoints', () => {
    it('GET /learning/content - should list learning content', async () => {
      const response = await request(app.getHttpServer())
        .get('/learning/content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /learning/progress - should get learning progress', async () => {
      const response = await request(app.getHttpServer())
        .get('/learning/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('completed_modules');
      expect(response.body).toHaveProperty('in_progress_modules');
    });
  });

  describe('WebSocket / Real-time Endpoints', () => {
    it('GET /health - should verify backend is running', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for missing auth token', async () => {
      const response = await request(app.getHttpServer()).get('/analytics/dashboard');

      expect(response.status).toBe(401);
    });

    it('should return 403 for insufficient permissions', async () => {
      // Login as student
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'siswa@neuroadaptive.com',
          password: 'Demo1234!',
        });

      const token = loginRes.body.access_token;

      // Try to access admin endpoint
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent resources', async () => {
      const response = await request(app.getHttpServer())
        .get('/eeg/session/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid request data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('User Roles & Permissions', () => {
    it('Teacher should access class data', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'guru@neuroadaptive.com',
          password: 'Demo1234!',
        });

      const teacherToken = loginRes.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/teacher/classes')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('Parent should access child data', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'orangtua@neuroadaptive.com',
          password: 'Demo1234!',
        });

      const parentToken = loginRes.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/parent/children')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
    });

    it('Admin should access system settings', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@neuroadaptive.com',
          password: 'Demo1234!',
        });

      const adminToken = loginRes.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Data Consistency & Integrity', () => {
    it('should maintain data consistency across requests', async () => {
      // Create session
      const createRes = await request(app.getHttpServer())
        .post('/eeg/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          device_type: 'SIMULATOR',
          session_name: 'Consistency Test',
        });

      const testSessionId = createRes.body.session_id;

      // Submit data multiple times
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/eeg/data')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            session_id: testSessionId,
            focus_score: 70 + i * 2,
            relaxation_score: 50 + i,
            stress_level: 'medium',
            brain_waves: {
              delta: 5,
              theta: 8,
              alpha: 12,
              beta: 15,
              gamma: 3,
            },
            timestamp: Date.now(),
          });
      }

      // Retrieve and verify
      const response = await request(app.getHttpServer())
        .get(`/eeg/session/${testSessionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data_points).toBeGreaterThanOrEqual(5);
    });
  });
});
