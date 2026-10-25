// backend/src/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Organization = require('./models/Organization');
const Property = require('./models/Property');
const PropertySection = require('./models/PropertySection');
const Resource = require('./models/Resource');
const Slot = require('./models/Slot');
const Booking = require('./models/Booking');
const Waitlist = require('./models/Waitlist');
const AuditLog = require('./models/AuditLog');

const connect = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartslot');
};

const createDemoData = async () => {
  console.log('Seeding SmartSlot V3 Multi-Tenant Property & Resource Platform...');

  // Clean old collections
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Property.deleteMany({}),
    PropertySection.deleteMany({}),
    Resource.deleteMany({}),
    Slot.deleteMany({}),
    Booking.deleteMany({}),
    Waitlist.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. Create standard demo accounts
  const adminPass = await bcrypt.hash('admin123', 10);
  const ownerPass = await bcrypt.hash('owner123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  const admin = await User.create({
    name: 'Platform Administrator',
    email: 'admin@example.com',
    passwordHash: adminPass,
    role: 'admin',
  });

  const owner = await User.create({
    name: 'Sarah Chen (Property Owner)',
    email: 'owner@example.com',
    passwordHash: ownerPass,
    role: 'user',
  });

  const user = await User.create({
    name: 'Alex Rivera (Demo Client)',
    email: 'user@example.com',
    passwordHash: userPass,
    role: 'user',
  });

  // 2. Create Multi-Tenant Organization
  const org = await Organization.create({
    name: 'Nexus Innovation Workspaces',
    slug: 'nexus-workspaces',
    description: 'Premier urban workspace provider across major commercial tech hubs.',
    ownerId: owner._id,
    members: [
      { userId: owner._id, role: 'owner', addedAt: new Date() },
      { userId: admin._id, role: 'manager', addedAt: new Date() },
    ],
  });

  // 3. Create Operating Hours (Mon-Fri 08:00 - 18:00)
  const defaultHours = [];
  for (let d = 1; d <= 5; d++) {
    defaultHours.push({ day: d, start: '08:00', end: '18:00' });
  }

  // 4. Create Published Property (Nexus Tower)
  const publishedProperty = await Property.create({
    organizationId: org._id,
    createdBy: owner._id,
    name: 'Nexus Innovation Tower',
    type: 'coworking',
    description: 'A 3-floor state-of-the-art facility featuring smart meeting pods, AI research labs, and conference suites.',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    contact: {
      phone: '+1 (512) 555-0199',
      email: 'facilities@nexusworkspaces.io',
      website: 'https://nexusworkspaces.io',
    },
    location: {
      address: '400 Congress Avenue, Suite 1200',
      city: 'Austin',
      state: 'Texas',
      postalCode: '78701',
      country: 'USA',
      timezone: 'America/Chicago',
      coordinates: { lat: 30.2672, lng: -97.7431 },
    },
    configuration: {
      floorsCount: 3,
      defaultSlotDuration: 30,
      cancellationPolicy: 'flexible',
      defaultBookingRules: 'Cancellations permitted up to 1 hour before scheduled time. Instant waitlist promotion applies.',
      operatingHours: defaultHours,
    },
    amenities: [
      'Gigabit Fiber Wi-Fi',
      'Air Conditioning & Climate Control',
      '4K Smart Projectors',
      'Interactive Digital Whiteboards',
      'Dedicated Basement Parking',
      'Wheelchair Accessible',
      'Specialty Espresso Bar',
    ],
    customAmenities: ['Podcast Recording Studio', 'Quiet Focus Booths'],
    status: 'published',
    publishedAt: new Date(),
  });

  // 5. Create Draft Property (Lakeside Creative Hub)
  const draftProperty = await Property.create({
    organizationId: org._id,
    createdBy: owner._id,
    name: 'Pacific Heights Creative Hub',
    type: 'office_building',
    description: 'Under renovation. High-ceiling private offices and consultation rooms.',
    coverImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    contact: {
      phone: '+1 (415) 555-8822',
      email: 'sf@nexusworkspaces.io',
    },
    location: {
      address: '2200 Fillmore Street',
      city: 'San Francisco',
      state: 'California',
      postalCode: '94115',
      country: 'USA',
      timezone: 'America/Los_Angeles',
    },
    configuration: {
      floorsCount: 2,
      defaultSlotDuration: 60,
      cancellationPolicy: 'moderate',
      operatingHours: defaultHours,
    },
    amenities: ['Gigabit Fiber Wi-Fi', 'Air Conditioning & Climate Control'],
    status: 'draft',
  });

  // 6. Create Floors / Sections for Published Property
  const floor1 = await PropertySection.create({
    propertyId: publishedProperty._id,
    name: 'Floor 1 — Welcome & Collaboration Zone',
    level: 1,
    description: 'Ground level reception, open cafe seating, and public meeting pods.',
  });

  const floor2 = await PropertySection.create({
    propertyId: publishedProperty._id,
    name: 'Floor 2 — Focus & Research Labs',
    level: 2,
    description: 'Deep focus study pods, hardware test benches, and AI research workstations.',
  });

  const floor3 = await PropertySection.create({
    propertyId: publishedProperty._id,
    name: 'Floor 3 — Executive Suite',
    level: 3,
    description: 'Panoramic skyline conference rooms and private boardrooms.',
  });

  // 7. Create Resources linked to Floors & Property
  const r1 = await Resource.create({
    name: 'Atrium Boardroom 1A',
    propertyId: publishedProperty._id,
    sectionId: floor1._id,
    category: 'Meeting Room',
    resourceType: 'meeting_room',
    location: 'Floor 1, West Wing',
    capacity: 12,
    description: 'Premium glass-walled boardroom equipped with 4K multi-camera telepresence and dual whiteboards.',
    amenities: ['Gigabit Fiber Wi-Fi', '4K Smart Projectors', 'Interactive Digital Whiteboards'],
    pricing: { model: 'free', price: 0, currency: 'USD' },
    openingHours: defaultHours,
    createdBy: owner._id,
    active: true,
    bookable: true,
  });

  const r2 = await Resource.create({
    name: 'Collaboration Pod 1B',
    propertyId: publishedProperty._id,
    sectionId: floor1._id,
    category: 'Meeting Room',
    resourceType: 'meeting_room',
    location: 'Floor 1, East Atrium',
    capacity: 4,
    description: 'Acoustic soundproof booth for sprint planning and private consultations.',
    amenities: ['Gigabit Fiber Wi-Fi', 'Air Conditioning & Climate Control'],
    pricing: { model: 'free', price: 0, currency: 'USD' },
    openingHours: defaultHours,
    createdBy: owner._id,
    active: true,
    bookable: true,
  });

  const r3 = await Resource.create({
    name: 'AI Research Workstation Lab',
    propertyId: publishedProperty._id,
    sectionId: floor2._id,
    category: 'Lab & Equipment',
    resourceType: 'lab',
    location: 'Floor 2, Room 204',
    capacity: 6,
    description: 'Specialized lab space equipped with edge inference hardware and multi-monitor setups.',
    amenities: ['Gigabit Fiber Wi-Fi', 'Air Conditioning & Climate Control', 'Podcast Recording Studio'],
    pricing: { model: 'fixed_slot', price: 25, currency: 'USD' },
    openingHours: defaultHours,
    createdBy: owner._id,
    active: true,
    bookable: true,
  });

  const r4 = await Resource.create({
    name: 'Skyline Executive Suite',
    propertyId: publishedProperty._id,
    sectionId: floor3._id,
    category: 'Meeting Room',
    resourceType: 'meeting_room',
    location: 'Floor 3, Penthouse',
    capacity: 20,
    description: 'Top-floor venue with 360-degree city views, catering preparation area, and executive lounge seating.',
    amenities: ['Gigabit Fiber Wi-Fi', '4K Smart Projectors', 'Specialty Espresso Bar', 'Dedicated Basement Parking'],
    pricing: { model: 'hourly', price: 75, currency: 'USD' },
    openingHours: defaultHours,
    createdBy: owner._id,
    active: true,
    bookable: true,
  });

  // Legacy resource without property to verify backwards compatibility
  const legacyResource = await Resource.create({
    name: 'Community Open Desk',
    category: 'General',
    resourceType: 'desk',
    location: 'Central Campus',
    capacity: 1,
    description: 'Individual hot desk available for community members.',
    openingHours: defaultHours,
    createdBy: admin._id,
    active: true,
    bookable: true,
  });

  // 8. Generate discrete slots for next 5 days
  const resourcesToSeed = [r1, r2, r3, r4, legacyResource];
  const slotDuration = 30; // minutes
  const now = new Date();

  for (let offset = 0; offset < 5; offset++) {
    const targetDate = new Date(now);
    targetDate.setUTCDate(targetDate.getUTCDate() + offset);
    const dateStr = targetDate.toISOString().slice(0, 10);
    const dayOfWeek = new Date(dateStr + 'T00:00:00Z').getUTCDay();

    // Check operating hours
    const activeHours = defaultHours.filter((h) => h.day === dayOfWeek);
    if (activeHours.length === 0) continue;

    for (const resDoc of resourcesToSeed) {
      for (const oh of activeHours) {
        const [sh, sm] = oh.start.split(':').map(Number);
        const [eh, em] = oh.end.split(':').map(Number);

        const start = new Date(dateStr + 'T00:00:00Z');
        start.setUTCHours(sh, sm, 0, 0);

        const end = new Date(dateStr + 'T00:00:00Z');
        end.setUTCHours(eh, em, 0, 0);

        for (let cur = new Date(start); cur < end; cur = new Date(cur.getTime() + slotDuration * 60000)) {
          const slotEnd = new Date(cur.getTime() + slotDuration * 60000);
          await Slot.updateOne(
            { resourceId: resDoc._id, startAt: cur },
            {
              $setOnInsert: {
                resourceId: resDoc._id,
                startAt: cur,
                endAt: slotEnd,
                available: true,
              },
            },
            { upsert: true }
          );
        }
      }
    }
  }

  // 9. Initial Audit Log
  await AuditLog.create({
    actorId: owner._id,
    actorName: owner.name,
    action: 'PROPERTY_PUBLISHED',
    targetType: 'Property',
    targetId: publishedProperty._id.toString(),
    propertyId: publishedProperty._id,
    organizationId: org._id,
    metadata: { initialSeed: true, propertyName: publishedProperty.name },
  });

  console.log('✅ Demo multi-tenant properties and resources seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Admin Account        -> admin@example.com / admin123');
  console.log('Property Owner       -> owner@example.com / owner123');
  console.log('Standard Client User -> user@example.com  / user123');
  console.log('----------------------------------------------------');
  console.log('Published Property   -> Nexus Innovation Tower (Austin, TX)');
  console.log('Draft Property       -> Pacific Heights Creative Hub (San Francisco, CA)');
  process.exit(0);
};

connect().then(createDemoData).catch((err) => {
  console.error(err);
  process.exit(1);
});
