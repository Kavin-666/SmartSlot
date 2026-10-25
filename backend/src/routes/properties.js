const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const { requirePropertyAccess } = require('../middleware/tenantAuth.js');
const {
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
} = require('../controllers/propertyController.js');

const {
  createSection,
  getPropertySections,
  updateSection,
  deleteSection,
} = require('../controllers/propertySectionController.js');

const {
  createMaintenanceBlock,
  getMaintenanceBlocks,
  deleteMaintenanceBlock,
} = require('../controllers/maintenanceController.js');

const Resource = require('../models/Resource.js');
const AuditLog = require('../models/AuditLog.js');

// Public property discovery
router.get('/public', getPublicProperties);

// Specific property public/preview endpoint
router.get('/:id', (req, res, next) => {
  // Optional auth check: if token present, attach req.user
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, () => getProperty(req, res, next));
  }
  return getProperty(req, res, next);
});

// Authenticated owner endpoints
router.post('/', protect, createProperty);
router.get('/mine/all', protect, getMyProperties);

// Protected property management
router.patch('/:id', protect, requirePropertyAccess('manager'), updateProperty);
router.post('/:id/publish', protect, requirePropertyAccess('manager'), publishProperty);
router.post('/:id/unpublish', protect, requirePropertyAccess('manager'), unpublishProperty);
router.get('/:id/analytics', protect, requirePropertyAccess('viewer'), getPropertyAnalytics);
router.get('/:id/bookings', protect, requirePropertyAccess('viewer'), getPropertyBookings);
router.get('/:id/audit-logs', protect, requirePropertyAccess('viewer'), getPropertyAuditLogs);

// Property Sections / Floors
router.post('/:id/sections', protect, requirePropertyAccess('manager'), createSection);
router.get('/:id/sections', getPropertySections);
router.patch('/sections/:sectionId', protect, updateSection);
router.delete('/sections/:sectionId', protect, deleteSection);

// Resources inside property
router.post(
  '/:id/resources',
  protect,
  requirePropertyAccess('manager'),
  async (req, res) => {
    const propertyId = req.params.id;
    const { name, category, location, capacity, resourceType, pricing, openingHours, sectionId, description, amenities } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Resource name is required' });
    }

    const resource = await Resource.create({
      name,
      propertyId,
      sectionId: sectionId || null,
      category: category || 'General',
      location: location || req.property?.location?.address || 'On-site',
      capacity: capacity || 4,
      resourceType: resourceType || 'meeting_room',
      pricing: pricing || { model: 'free', price: 0, currency: 'USD' },
      openingHours: openingHours || req.property?.configuration?.operatingHours || [],
      description,
      amenities: amenities || [],
      createdBy: req.user._id,
      active: true,
      bookable: true,
    });

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'RESOURCE_CREATED',
      targetType: 'Resource',
      targetId: resource._id.toString(),
      propertyId,
      metadata: { name: resource.name, type: resource.resourceType },
    });

    res.status(201).json({ resource });
  }
);

router.get('/:id/resources', async (req, res) => {
  const propertyId = req.params.id;
  const resources = await Resource.find({ propertyId, active: true }).sort({ name: 1 });
  res.json({ resources });
});

// Maintenance Blocks
router.post(
  '/:propertyId/resources/:resourceId/maintenance',
  protect,
  requirePropertyAccess('manager'),
  createMaintenanceBlock
);
router.get(
  '/:propertyId/resources/:resourceId/maintenance',
  getMaintenanceBlocks
);
router.delete('/maintenance/:id', protect, deleteMaintenanceBlock);

module.exports = router;
