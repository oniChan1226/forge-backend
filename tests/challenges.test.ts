import request from 'supertest';
import app from '../src/app';
import { cleanupTestDb, disconnectTestDb } from './testDb';

let authToken: string;

const registerAndLogin = async () => {
  await request(app).post('/api/auth/register').send({
    email: 'challenge@example.com',
    username: 'challengeuser',
    password: 'password123',
  });
  const res = await request(app).post('/api/auth/login').send({
    email: 'challenge@example.com',
    password: 'password123',
  });
  return res.body.token as string;
};

beforeAll(async () => {
  await cleanupTestDb();
  authToken = await registerAndLogin();
});

beforeEach(async () => {
  // Clean only challenges/progress between tests, keep user
  const { getTestPrisma } = await import('./testDb');
  const prisma = getTestPrisma();
  await prisma.dailyProgress.deleteMany();
  await prisma.challenge.deleteMany();
});

afterAll(async () => {
  await disconnectTestDb();
});

const getChallengeBody = (overrides: Record<string, unknown> = {}) => ({
  title: '30 Days Reading',
  description: 'Read at least 5 minutes every day',
  durationDays: 30,
  dailyTarget: '5 minutes of reading',
  startDate: new Date().toISOString(),
  completionMode: 'FLEXIBLE',
  allowedMisses: 3,
  ...overrides,
});

describe('Challenges API', () => {
  describe('POST /api/challenges', () => {
    it('should create a challenge', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody());

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('30 Days Reading');
      expect(res.body.durationDays).toBe(30);
      expect(res.body.status).toBe('ACTIVE');
      expect(res.body.completionMode).toBe('FLEXIBLE');
    });

    it('should require auth', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .send(getChallengeBody());

      expect(res.status).toBe(401);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Incomplete' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid durationDays', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody({ durationDays: 0 }));

      expect(res.status).toBe(400);
    });

    it('should create a STRICT mode challenge', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody({ completionMode: 'STRICT', allowedMisses: 0 }));

      expect(res.status).toBe(201);
      expect(res.body.completionMode).toBe('STRICT');
    });
  });

  describe('GET /api/challenges', () => {
    it('should list all challenges for the authenticated user', async () => {
      await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody({ title: 'Challenge A' }));

      await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody({ title: 'Challenge B' }));

      const res = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /api/challenges/:id', () => {
    it('should get a single challenge by ID', async () => {
      const createRes = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody());

      const challengeId = createRes.body.id as string;

      const res = await request(app)
        .get(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(challengeId);
      expect(res.body.dailyProgress).toEqual([]);
    });

    it('should return 404 for non-existent challenge', async () => {
      const res = await request(app)
        .get('/api/challenges/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/challenges/:id', () => {
    it('should update a challenge', async () => {
      const createRes = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody());

      const challengeId = createRes.body.id as string;

      const res = await request(app)
        .put(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/challenges/:id', () => {
    it('should delete a challenge', async () => {
      const createRes = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody());

      const challengeId = createRes.body.id as string;

      const res = await request(app)
        .delete(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('GET /api/challenges/:id/stats', () => {
    it('should return challenge stats', async () => {
      const createRes = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(getChallengeBody());

      const challengeId = createRes.body.id as string;

      const res = await request(app)
        .get(`/api/challenges/${challengeId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats).toMatchObject({
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        completionRate: 0,
      });
    });
  });
});
