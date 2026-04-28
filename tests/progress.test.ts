import request from 'supertest';
import app from '../src/app';
import { cleanupTestDb, disconnectTestDb } from './testDb';

let authToken: string;
let challengeId: string;

const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const todayStr = today.toISOString();

beforeAll(async () => {
  await cleanupTestDb();

  await request(app).post('/api/auth/register').send({
    email: 'progress@example.com',
    username: 'progressuser',
    password: 'password123',
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'progress@example.com',
    password: 'password123',
  });
  authToken = loginRes.body.token as string;

  const challengeRes = await request(app)
    .post('/api/challenges')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      title: 'Test Progress Challenge',
      durationDays: 30,
      dailyTarget: '10 pushups',
      startDate: todayStr,
      completionMode: 'FLEXIBLE',
      allowedMisses: 5,
    });

  challengeId = challengeRes.body.id as string;
});

beforeEach(async () => {
  // Clean only daily progress between tests
  const { getTestPrisma } = await import('./testDb');
  const prisma = getTestPrisma();
  await prisma.dailyProgress.deleteMany();
});

afterAll(async () => {
  await disconnectTestDb();
});

describe('Progress API', () => {
  describe('POST /api/challenges/:id/progress', () => {
    it('should log progress for today', async () => {
      const res = await request(app)
        .post(`/api/challenges/${challengeId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: todayStr,
          completed: true,
          notes: 'Done 10 pushups!',
        });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
      expect(res.body.notes).toBe('Done 10 pushups!');
    });

    it('should update existing progress for the same date', async () => {
      await request(app)
        .post(`/api/challenges/${challengeId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: todayStr, completed: true });

      const res = await request(app)
        .post(`/api/challenges/${challengeId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: todayStr, completed: false, notes: 'Missed today' });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(false);
    });

    it('should require auth', async () => {
      const res = await request(app)
        .post(`/api/challenges/${challengeId}/progress`)
        .send({ date: todayStr, completed: true });

      expect(res.status).toBe(401);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post(`/api/challenges/${challengeId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: todayStr });

      expect(res.status).toBe(400);
    });

    it('should reject date outside challenge period', async () => {
      const farFuture = new Date(today);
      farFuture.setUTCFullYear(farFuture.getUTCFullYear() + 5);

      const res = await request(app)
        .post(`/api/challenges/${challengeId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: farFuture.toISOString(), completed: true });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/outside/i);
    });

    it('should return 404 for non-existent challenge', async () => {
      const res = await request(app)
        .post('/api/challenges/nonexistent/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: todayStr, completed: true });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/challenges/:id/progress', () => {
    it('should get progress with streak info', async () => {
      await request(app)
        .post(`/api/challenges/${challengeId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: todayStr, completed: true });

      const res = await request(app)
        .get(`/api/challenges/${challengeId}/progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.progress)).toBe(true);
      expect(res.body.streak).toMatchObject({
        currentStreak: expect.any(Number),
        longestStreak: expect.any(Number),
        totalCompleted: expect.any(Number),
        completionRate: expect.any(Number),
      });
    });
  });
});
