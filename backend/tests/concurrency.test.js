const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/models/User.js');
const Resource = require('../src/models/Resource.js');
const Slot = require('../src/models/Slot.js');
const Booking = require('../src/models/Booking.js');
const Waitlist = require('../src/models/Waitlist.js');
const bcrypt = require('bcryptjs');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/smartslot_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Resource.deleteMany({});
  await Slot.deleteMany({});
  await Booking.deleteMany({});
  await Waitlist.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('SmartSlot Concurrency Control Engine', () => {
  test('10 simultaneous requests to book the exact same slot -> exactly 1 succeeds (201), 9 receive 409 Conflict', async () => {
    // 1. Create an admin and a resource
    const passHash = await bcrypt.hash('password123', 8);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash: passHash,
      role: 'admin',
    });

    const resource = await Resource.create({
      name: 'High-Demand Conference Room A',
      location: 'Level 4',
      capacity: 10,
      createdBy: admin._id,
      active: true,
    });

    // 2. Create 1 discrete slot
    const slotStart = new Date('2026-11-01T10:00:00Z');
    const slotEnd = new Date('2026-11-01T10:30:00Z');
    const slot = await Slot.create({
      resourceId: resource._id,
      startAt: slotStart,
      endAt: slotEnd,
      available: true,
    });

    // 3. Create 10 different authenticated users with valid JWTs
    const users = [];
    const tokens = [];

    for (let i = 1; i <= 10; i++) {
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: `Concurrent User ${i}`,
          email: `user${i}@test.com`,
          password: 'password123',
        });
      expect(regRes.status).toBe(201);
      users.push(regRes.body.user);
      tokens.push(regRes.body.token);
    }

    // 4. Fire 10 simultaneous booking requests to claim the exact same slotId
    const bookingPromises = tokens.map((token) =>
      request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ slotId: slot._id.toString() })
    );

    const responses = await Promise.all(bookingPromises);

    // 5. Analyze results: exactly 1 201 Created and 9 409 Conflicts
    const successes = responses.filter((r) => r.status === 201);
    const conflicts = responses.filter((r) => r.status === 409);

    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(9);

    // Verify conflict message
    expect(conflicts[0].body.message).toMatch(/already booked/i);

    // 6. Verify database state
    const confirmedBookings = await Booking.find({ slotId: slot._id, status: 'confirmed' });
    expect(confirmedBookings.length).toBe(1);

    const updatedSlot = await Slot.findById(slot._id);
    expect(updatedSlot.available).toBe(false);
    expect(updatedSlot.bookedBy.toString()).toBe(confirmedBookings[0].userId.toString());
  });

  test('Cancellation releases the slot atomically and permits subsequent booking', async () => {
    const passHash = await bcrypt.hash('password123', 8);
    const user1 = await User.create({ name: 'User 1', email: 'u1@test.com', passwordHash: passHash });
    const user2 = await User.create({ name: 'User 2', email: 'u2@test.com', passwordHash: passHash });

    const resource = await Resource.create({ name: 'Studio B', capacity: 2, active: true });
    const slot = await Slot.create({
      resourceId: resource._id,
      startAt: new Date('2026-11-02T14:00:00Z'),
      endAt: new Date('2026-11-02T14:30:00Z'),
      available: true,
    });

    const jwt = require('jsonwebtoken');
    const token1 = jwt.sign({ id: user1._id, role: 'user' }, process.env.JWT_SECRET || 'secret');
    const token2 = jwt.sign({ id: user2._id, role: 'user' }, process.env.JWT_SECRET || 'secret');

    // User 1 books the slot
    const bookRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token1}`)
      .send({ slotId: slot._id.toString() });
    expect(bookRes.status).toBe(201);

    const bookingId = bookRes.body.booking._id;

    // User 2 tries to book the same slot -> 409
    const failRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token2}`)
      .send({ slotId: slot._id.toString() });
    expect(failRes.status).toBe(409);

    // User 1 cancels the booking
    const cancelRes = await request(app)
      .post(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token1}`);
    expect(cancelRes.status).toBe(200);

    // Slot is now freed
    const slotAfterCancel = await Slot.findById(slot._id);
    expect(slotAfterCancel.available).toBe(true);

    // User 2 now books the slot successfully -> 201
    const retryRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token2}`)
      .send({ slotId: slot._id.toString() });
    expect(retryRes.status).toBe(201);
  });

  test('Waitlist promotion: cancellation automatically promotes earliest waiting user', async () => {
    const passHash = await bcrypt.hash('password123', 8);
    const user1 = await User.create({ name: 'User 1', email: 'owner@test.com', passwordHash: passHash });
    const user2 = await User.create({ name: 'User 2', email: 'waiter@test.com', passwordHash: passHash });

    const resource = await Resource.create({ name: 'Lab X', capacity: 1, active: true });
    const slot = await Slot.create({
      resourceId: resource._id,
      startAt: new Date('2026-11-03T16:00:00Z'),
      endAt: new Date('2026-11-03T16:30:00Z'),
      available: true,
    });

    const jwt = require('jsonwebtoken');
    const token1 = jwt.sign({ id: user1._id, role: 'user' }, process.env.JWT_SECRET || 'secret');
    const token2 = jwt.sign({ id: user2._id, role: 'user' }, process.env.JWT_SECRET || 'secret');

    // 1. User 1 books
    const bookRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token1}`)
      .send({ slotId: slot._id.toString() });
    expect(bookRes.status).toBe(201);
    const bookingId = bookRes.body.booking._id;

    // 2. User 2 joins waitlist
    const waitlistRes = await request(app)
      .post('/api/v1/waitlist')
      .set('Authorization', `Bearer ${token2}`)
      .send({ slotId: slot._id.toString() });
    expect(waitlistRes.status).toBe(201);

    // 3. User 1 cancels -> triggers automatic promotion of User 2
    const cancelRes = await request(app)
      .post(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token1}`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.promoted).toBeDefined();

    // 4. Verify User 2 has a confirmed booking
    const user2Booking = await Booking.findOne({ userId: user2._id, slotId: slot._id, status: 'confirmed' });
    expect(user2Booking).not.toBeNull();

    // 5. Verify User 2 entry was removed from Waitlist
    const waitlistCount = await Waitlist.countDocuments({ userId: user2._id, slotId: slot._id });
    expect(waitlistCount).toBe(0);
  });
});
