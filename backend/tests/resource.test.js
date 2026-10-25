const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/models/User.js');
const Resource = require('../src/models/Resource.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/smartslot_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Resource.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Resource & Availability API Suite', () => {
  test('Public can list active resources', async () => {
    await Resource.create([
      { name: 'Room Alpha', category: 'Meeting Room', active: true },
      { name: 'Room Beta (Inactive)', category: 'Meeting Room', active: false },
    ]);

    const res = await request(app).get('/api/v1/resources');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Room Alpha');
  });

  test('Public can view single resource details', async () => {
    const resource = await Resource.create({
      name: 'Hardware Lab',
      location: 'Building C',
      capacity: 20,
      active: true,
    });

    const res = await request(app).get(`/api/v1/resources/${resource._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Hardware Lab');
    expect(res.body.capacity).toBe(20);
  });

  test('Non-admin user cannot create a resource (403 Forbidden)', async () => {
    const passHash = await bcrypt.hash('pass123', 8);
    const user = await User.create({ name: 'Regular User', email: 'user@test.com', passwordHash: passHash, role: 'user' });
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET || 'secret');

    const res = await request(app)
      .post('/api/v1/resources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unauthorized Room' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  test('Admin user can create a resource (201 Created)', async () => {
    const passHash = await bcrypt.hash('pass123', 8);
    const admin = await User.create({ name: 'Admin User', email: 'admin@test.com', passwordHash: passHash, role: 'admin' });
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'secret');

    const res = await request(app)
      .post('/api/v1/resources')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Executive Boardroom',
        category: 'Meeting Room',
        location: 'Penthouse',
        capacity: 16,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Executive Boardroom');
    expect(res.body.capacity).toBe(16);
  });

  test('Availability endpoint generates discrete slots for valid date', async () => {
    const resource = await Resource.create({
      name: 'Open Studio',
      active: true,
      openingHours: [
        { day: 1, start: '09:00', end: '11:00' }, // Monday: 4 30-min slots
      ],
    });

    // 2026-11-02 is a Monday
    const res = await request(app).get(`/api/v1/resources/${resource._id}/availability?date=2026-11-02`);
    expect(res.status).toBe(200);
    expect(res.body.slots).toBeDefined();
    expect(res.body.slots.length).toBe(4);
    expect(res.body.slots[0].available).toBe(true);
  });
});
