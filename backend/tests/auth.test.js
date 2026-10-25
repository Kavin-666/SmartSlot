const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/models/User.js');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/smartslot_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Authentication & Authorization Suite', () => {
  test('User registration succeeds and returns valid JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Alice Springs',
        email: 'alice@example.com',
        password: 'securepassword123',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Alice Springs');
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.role).toBe('user');
  });

  test('Registration rejects duplicate email (409 Conflict)', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });

    const duplicateRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bob Duplicate', email: 'bob@example.com', password: 'differentpassword' });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.message).toMatch(/already registered/i);
  });

  test('Login succeeds with correct credentials', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Charlie', email: 'charlie@example.com', password: 'correctpassword' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'charlie@example.com', password: 'correctpassword' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('charlie@example.com');
  });

  test('Login fails with invalid password (401)', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Charlie', email: 'charlie2@example.com', password: 'correctpassword' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'charlie2@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('Protected endpoint /auth/me returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  test('Protected endpoint /auth/me returns user with valid token', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Dave', email: 'dave@example.com', password: 'password123' });

    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('dave@example.com');
  });
});
