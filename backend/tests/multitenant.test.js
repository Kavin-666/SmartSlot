const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/models/User.js');
const Organization = require('../src/models/Organization.js');
const Property = require('../src/models/Property.js');
const PropertySection = require('../src/models/PropertySection.js');
const Resource = require('../src/models/Resource.js');
const Slot = require('../src/models/Slot.js');
const Booking = require('../src/models/Booking.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/smartslot_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Organization.deleteMany({});
  await Property.deleteMany({});
  await PropertySection.deleteMany({});
  await Resource.deleteMany({});
  await Slot.deleteMany({});
  await Booking.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('SmartSlot V3 Multi-Tenant & Property Management Suite', () => {
  test('Owner can create property via wizard and default floors are provisioned', async () => {
    const passHash = await bcrypt.hash('pass123', 8);
    const owner = await User.create({ name: 'Owner 1', email: 'owner1@test.com', passwordHash: passHash });
    const token = jwt.sign({ id: owner._id, role: 'user' }, process.env.JWT_SECRET || 'secret');

    const res = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Apex Innovation Hub',
        type: 'coworking',
        location: {
          address: '500 Tech Parkway',
          city: 'Austin',
          state: 'TX',
          country: 'USA',
        },
        configuration: {
          floorsCount: 3,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.property.name).toBe('Apex Innovation Hub');
    expect(res.body.property.status).toBe('draft');

    // Verify 3 floors were automatically created
    const floors = await PropertySection.find({ propertyId: res.body.property._id });
    expect(floors.length).toBe(3);
    expect(floors[0].name).toBe('Floor 1');
  });

  test('Tenant Isolation: Owner A cannot modify Owner B property (403 Forbidden)', async () => {
    const passHash = await bcrypt.hash('pass123', 8);
    const ownerA = await User.create({ name: 'Owner A', email: 'ownerA@test.com', passwordHash: passHash });
    const ownerB = await User.create({ name: 'Owner B', email: 'ownerB@test.com', passwordHash: passHash });

    const orgB = await Organization.create({
      name: 'Org B',
      slug: 'org-b',
      ownerId: ownerB._id,
      members: [{ userId: ownerB._id, role: 'owner' }],
    });

    const propB = await Property.create({
      organizationId: orgB._id,
      createdBy: ownerB._id,
      name: 'Confidential Property B',
      location: { address: '123 Secret St', city: 'Dallas', country: 'USA' },
      status: 'draft',
    });

    const tokenA = jwt.sign({ id: ownerA._id, role: 'user' }, process.env.JWT_SECRET || 'secret');

    // Owner A attempts to edit Property B -> 403 Forbidden
    const editRes = await request(app)
      .patch(`/api/v1/properties/${propB._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Hacked Property B' });

    expect(editRes.status).toBe(403);
    expect(editRes.body.message).toMatch(/forbidden/i);

    // Verify Property B name was untouched
    const untouched = await Property.findById(propB._id);
    expect(untouched.name).toBe('Confidential Property B');
  });

  test('Draft properties cannot be booked publicly until published', async () => {
    const passHash = await bcrypt.hash('pass123', 8);
    const owner = await User.create({ name: 'Owner', email: 'owner_draft@test.com', passwordHash: passHash });
    const client = await User.create({ name: 'Client', email: 'client@test.com', passwordHash: passHash });

    const org = await Organization.create({
      name: 'Draft Org',
      slug: 'draft-org',
      ownerId: owner._id,
      members: [{ userId: owner._id, role: 'owner' }],
    });

    // Create a draft property
    const draftProp = await Property.create({
      organizationId: org._id,
      createdBy: owner._id,
      name: 'Unpublished Facility',
      location: { address: '77 Ocean Ave', city: 'Miami', country: 'USA' },
      status: 'draft',
    });

    const resource = await Resource.create({
      name: 'Private Suite',
      propertyId: draftProp._id,
      capacity: 4,
      createdBy: owner._id,
      active: true,
      bookable: true,
    });

    const slot = await Slot.create({
      resourceId: resource._id,
      startAt: new Date('2026-11-10T10:00:00Z'),
      endAt: new Date('2026-11-10T10:30:00Z'),
      available: true,
    });

    const clientToken = jwt.sign({ id: client._id, role: 'user' }, process.env.JWT_SECRET || 'secret');

    // Client tries to book slot in draft property -> rejected (400)
    const bookRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ slotId: slot._id.toString() });

    expect(bookRes.status).toBe(400);
    expect(bookRes.body.message).toMatch(/draft/i);
  });

  test('AI Property Draft generation parses natural language and outputs structured schema', async () => {
    const passHash = await bcrypt.hash('pass123', 8);
    const owner = await User.create({ name: 'Owner', email: 'ai_owner@test.com', passwordHash: passHash });
    const token = jwt.sign({ id: owner._id, role: 'user' }, process.env.JWT_SECRET || 'secret');

    const res = await request(app)
      .post('/api/v1/ai/property-draft')
      .set('Authorization', `Bearer ${token}`)
      .send({
        prompt: 'I want to create a two-floor study centre called Quantum Learning Center in Boston with high-speed wifi, quiet study pods, and projector rooms.',
      });

    expect(res.status).toBe(200);
    expect(res.body.draft).toBeDefined();
    expect(res.body.draft.name).toBe('Quantum Learning Center');
    expect(res.body.draft.type).toBe('study_centre');
    expect(res.body.draft.configuration.floorsCount).toBe(2);
    expect(res.body.draft.location.city).toBe('Boston');
    expect(res.body.draft.amenities).toContain('High-Speed Wi-Fi');
  });

  test('Maintenance block marks slots unavailable and prevents booking', async () => {
    const passHash = await bcrypt.hash('pass123', 8);
    const owner = await User.create({ name: 'Owner Maint', email: 'maint_owner@test.com', passwordHash: passHash });
    const client = await User.create({ name: 'Client Maint', email: 'maint_client@test.com', passwordHash: passHash });

    const ownerToken = jwt.sign({ id: owner._id, role: 'user' }, process.env.JWT_SECRET || 'secret');
    const clientToken = jwt.sign({ id: client._id, role: 'user' }, process.env.JWT_SECRET || 'secret');

    const org = await Organization.create({
      name: 'Maint Org',
      slug: 'maint-org',
      ownerId: owner._id,
      members: [{ userId: owner._id, role: 'owner' }],
    });

    const prop = await Property.create({
      organizationId: org._id,
      createdBy: owner._id,
      name: 'Facility M',
      location: { address: '99 Main St', city: 'Seattle', country: 'USA' },
      status: 'published',
    });

    const resource = await Resource.create({
      name: 'Server Room',
      propertyId: prop._id,
      capacity: 2,
      createdBy: owner._id,
      active: true,
      bookable: true,
    });

    const slotStart = new Date('2026-11-15T12:00:00Z');
    const slotEnd = new Date('2026-11-15T12:30:00Z');
    const slot = await Slot.create({
      resourceId: resource._id,
      startAt: slotStart,
      endAt: slotEnd,
      available: true,
    });

    // Schedule maintenance overlapping the slot
    const maintRes = await request(app)
      .post(`/api/v1/properties/${prop._id}/resources/${resource._id}/maintenance`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        startAt: new Date('2026-11-15T11:00:00Z').toISOString(),
        endAt: new Date('2026-11-15T13:00:00Z').toISOString(),
        reason: 'HVAC Duct Maintenance',
      });

    expect(maintRes.status).toBe(201);

    // Client attempts to book the slot during maintenance -> 409
    const bookRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ slotId: slot._id.toString() });

    expect(bookRes.status).toBe(409);
    expect(bookRes.body.message).toMatch(/maintenance/i);
  });
});
