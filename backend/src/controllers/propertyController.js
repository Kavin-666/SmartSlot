const asyncHandler = require('express-async-handler');
const Property = require('../models/Property.js');
const PropertySection = require('../models/PropertySection.js');
const Resource = require('../models/Resource.js');
const Booking = require('../models/Booking.js');
const Organization = require('../models/Organization.js');
const AuditLog = require('../models/AuditLog.js');
const { z } = require('zod');

// Property creation validation
const propertySchema = z.object({
  organizationId: z.string().optional(),
  name: z.string().min(2),
  type: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  location: z.object({
    address: z.string().min(2),
    city: z.string().min(2),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default('USA'),
    timezone: z.string().default('UTC'),
    coordinates: z
      .object({
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
      .optional(),
  }),
  configuration: z
    .object({
      floorsCount: z.number().int().min(1).default(1),
      defaultSlotDuration: z.number().int().positive().default(30),
      cancellationPolicy: z.enum(['flexible', 'moderate', 'strict']).default('flexible'),
      defaultBookingRules: z.string().optional(),
      operatingHours: z
        .array(
          z.object({
            day: z.number().int().min(0).max(6),
            start: z.string(),
            end: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
  amenities: z.array(z.string()).optional(),
  customAmenities: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

// @desc Create a property (via wizard or direct)
// @route POST /api/v1/properties
// @access Private (Owner / Manager)
const createProperty = asyncHandler(async (req, res) => {
  const parsed = propertySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid property data', errors: parsed.error.format() });
  }

  const data = parsed.data;

  // Resolve or create user's organization if not supplied
  let orgId = data.organizationId;
  if (!orgId) {
    let org = await Organization.findOne({ ownerId: req.user._id });
    if (!org) {
      const slug = `${req.user.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      org = await Organization.create({
        name: `${req.user.name}'s Properties`,
        slug: slug,
        ownerId: req.user._id,
        members: [{ userId: req.user._id, role: 'owner' }],
      });
    }
    orgId = org._id;
  }

  const property = await Property.create({
    ...data,
    organizationId: orgId,
    createdBy: req.user._id,
  });

  // Automatically seed default floor sections according to floorsCount
  const floorsCount = data.configuration?.floorsCount || 1;
  const sectionsToCreate = [];
  for (let f = 1; f <= floorsCount; f++) {
    sectionsToCreate.push({
      propertyId: property._id,
      name: `Floor ${f}`,
      level: f,
      description: `Level ${f} facility zone`,
    });
  }
  if (sectionsToCreate.length > 0) {
    await PropertySection.insertMany(sectionsToCreate);
  }

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'PROPERTY_CREATED',
    targetType: 'Property',
    targetId: property._id.toString(),
    organizationId: orgId,
    propertyId: property._id,
    metadata: { name: property.name, status: property.status },
  });

  res.status(201).json({ property });
});

// @desc Get properties owned or managed by current user
// @route GET /api/v1/properties/mine
// @access Private
const getMyProperties = asyncHandler(async (req, res) => {
  // Find organizations user belongs to
  const userOrgs = await Organization.find({
    $or: [{ ownerId: req.user._id }, { 'members.userId': req.user._id }],
  }).select('_id');

  const orgIds = userOrgs.map((o) => o._id);

  const filter = {
    $or: [{ organizationId: { $in: orgIds } }, { createdBy: req.user._id }],
  };

  const properties = await Property.find(filter)
    .populate('organizationId', 'name slug')
    .sort({ createdAt: -1 });

  // Augment with resource counts
  const propertyIds = properties.map((p) => p._id);
  const resourceCounts = await Resource.aggregate([
    { $match: { propertyId: { $in: propertyIds } } },
    { $group: { _id: '$propertyId', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  resourceCounts.forEach((rc) => {
    countMap[rc._id.toString()] = rc.count;
  });

  const augmented = properties.map((p) => ({
    ...p.toObject(),
    resourceCount: countMap[p._id.toString()] || 0,
  }));

  res.json({ properties: augmented });
});

// @desc Public property discovery with search and filters
// @route GET /api/v1/properties/public
// @access Public
const getPublicProperties = asyncHandler(async (req, res) => {
  const { city, type, search, amenity } = req.query;

  const query = { status: 'published' };

  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' };
  }
  if (type) {
    query.type = type;
  }
  if (amenity) {
    query.amenities = amenity;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const properties = await Property.find(query)
    .populate('organizationId', 'name')
    .sort({ publishedAt: -1, createdAt: -1 });

  res.json({ properties });
});

// @desc Get single property detail (public if published, protected if draft)
// @route GET /api/v1/properties/:id
// @access Public / Private
const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('organizationId', 'name slug')
    .populate('createdBy', 'name email');

  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  // If draft or archived, only owner/manager or platform admin can view
  if (property.status !== 'published') {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required for unpublished draft' });
    }
    const isCreator = property.createdBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) {
      const org = await Organization.findById(property.organizationId);
      const isMember = org && (org.ownerId.toString() === req.user._id.toString() ||
        org.members.some((m) => m.userId.toString() === req.user._id.toString()));
      if (!isMember) {
        return res.status(403).json({ message: 'Forbidden: You cannot view this draft property' });
      }
    }
  }

  // Load floors and resources
  const [sections, resources] = await Promise.all([
    PropertySection.find({ propertyId: property._id, active: true }).sort({ level: 1 }),
    Resource.find({ propertyId: property._id, active: true }).sort({ name: 1 }),
  ]);

  res.json({
    property,
    sections,
    resources,
  });
});

// @desc Update property details
// @route PATCH /api/v1/properties/:id
// @access Private (Owner / Manager)
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  const updated = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'PROPERTY_UPDATED',
    targetType: 'Property',
    targetId: property._id.toString(),
    organizationId: property.organizationId,
    propertyId: property._id,
    metadata: { updatedFields: Object.keys(req.body) },
  });

  res.json({ property: updated });
});

// @desc Publish property
// @route POST /api/v1/properties/:id/publish
// @access Private (Owner / Manager)
const publishProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  // Verification requirements
  if (!property.location?.address || !property.location?.city) {
    return res.status(400).json({ message: 'Address and city are required before publishing' });
  }

  // Check if at least one active resource exists
  const resourceCount = await Resource.countDocuments({ propertyId: property._id, active: true });
  if (resourceCount === 0) {
    return res.status(400).json({
      message: 'You must add at least one active resource/room before publishing this property',
    });
  }

  property.status = 'published';
  property.publishedAt = new Date();
  await property.save();

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'PROPERTY_PUBLISHED',
    targetType: 'Property',
    targetId: property._id.toString(),
    organizationId: property.organizationId,
    propertyId: property._id,
  });

  res.json({ message: 'Property is now published and publicly bookable!', property });
});

// @desc Unpublish property
// @route POST /api/v1/properties/:id/unpublish
// @access Private (Owner / Manager)
const unpublishProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  property.status = 'draft';
  await property.save();

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'PROPERTY_UNPUBLISHED',
    targetType: 'Property',
    targetId: property._id.toString(),
    organizationId: property.organizationId,
    propertyId: property._id,
  });

  res.json({ message: 'Property unpublished to draft', property });
});

// @desc Property-specific analytics
// @route GET /api/v1/properties/:id/analytics
// @access Private (Owner / Manager)
const getPropertyAnalytics = asyncHandler(async (req, res) => {
  const propertyId = req.params.id;
  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  const resources = await Resource.find({ propertyId }).select('_id name category');
  const resourceIds = resources.map((r) => r._id);

  const [totalBookings, confirmedBookings, cancelledBookings, upcomingBookings] =
    await Promise.all([
      Booking.countDocuments({ resourceId: { $in: resourceIds } }),
      Booking.countDocuments({ resourceId: { $in: resourceIds }, status: 'confirmed' }),
      Booking.countDocuments({ resourceId: { $in: resourceIds }, status: 'cancelled' }),
      Booking.countDocuments({
        resourceId: { $in: resourceIds },
        status: 'confirmed',
        startAt: { $gte: new Date() },
      }),
    ]);

  const cancellationRate =
    totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

  res.json({
    metrics: {
      totalResources: resources.length,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      upcomingBookings,
      cancellationRate: `${cancellationRate}%`,
    },
  });
});

// @desc Property-specific bookings
// @route GET /api/v1/properties/:id/bookings
// @access Private (Owner / Manager)
const getPropertyBookings = asyncHandler(async (req, res) => {
  const propertyId = req.params.id;
  const resources = await Resource.find({ propertyId }).select('_id');
  const resourceIds = resources.map((r) => r._id);

  const filter = { resourceId: { $in: resourceIds } };
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const bookings = await Booking.find(filter)
    .populate('userId', 'name email')
    .populate('resourceId', 'name category')
    .populate('slotId', 'startAt endAt')
    .sort({ startAt: -1 })
    .limit(100);

  res.json({ bookings });
});

// @desc Property-specific audit logs
// @route GET /api/v1/properties/:id/audit-logs
// @access Private (Owner / Manager)
const getPropertyAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find({ propertyId: req.params.id })
    .sort({ timestamp: -1 })
    .limit(50);
  res.json({ logs });
});

module.exports = {
  createProperty,
  getMyProperties,
  getPublicProperties,
  getProperty,
  updateProperty,
  publishProperty,
  unpublishProperty,
  getPropertyAnalytics,
  getPropertyBookings,
  getPropertyAuditLogs,
};
