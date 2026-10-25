const asyncHandler = require('express-async-handler');
const MaintenanceBlock = require('../models/MaintenanceBlock.js');
const Resource = require('../models/Resource.js');
const Booking = require('../models/Booking.js');
const AuditLog = require('../models/AuditLog.js');
const { z } = require('zod');

const maintenanceSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string().min(2),
});

// @desc Schedule a maintenance block
// @route POST /api/v1/properties/:propertyId/resources/:resourceId/maintenance
// @access Private (Owner / Manager)
const createMaintenanceBlock = asyncHandler(async (req, res) => {
  const { propertyId, resourceId } = req.params;
  const parsed = maintenanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid maintenance period', errors: parsed.error.format() });
  }

  const { startAt, endAt, reason } = parsed.data;
  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  if (endDate <= startDate) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  // Check if any confirmed bookings conflict with this maintenance period
  const conflictingBookings = await Booking.find({
    resourceId,
    status: 'confirmed',
    $or: [
      { startAt: { $lt: endDate, $gte: startDate } },
      { endAt: { $gt: startDate, $lte: endDate } },
    ],
  });

  const block = await MaintenanceBlock.create({
    resourceId,
    propertyId,
    startAt: startDate,
    endAt: endDate,
    reason,
    createdBy: req.user._id,
  });

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'MAINTENANCE_CREATED',
    targetType: 'MaintenanceBlock',
    targetId: block._id.toString(),
    propertyId,
    metadata: { resourceId, reason, startAt, endAt, conflictingBookingsCount: conflictingBookings.length },
  });

  res.status(201).json({
    block,
    warning: conflictingBookings.length > 0 ? `${conflictingBookings.length} existing booking(s) intersect with this maintenance window` : null,
    conflictingBookings,
  });
});

// @desc Get maintenance blocks for a resource
// @route GET /api/v1/properties/:propertyId/resources/:resourceId/maintenance
// @access Public / Private
const getMaintenanceBlocks = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const blocks = await MaintenanceBlock.find({ resourceId }).sort({ startAt: 1 });
  res.json({ blocks });
});

// @desc Delete maintenance block
// @route DELETE /api/v1/maintenance/:id
// @access Private (Owner / Manager)
const deleteMaintenanceBlock = asyncHandler(async (req, res) => {
  const block = await MaintenanceBlock.findById(req.params.id);
  if (!block) return res.status(404).json({ message: 'Maintenance block not found' });

  await block.deleteOne();
  res.json({ message: 'Maintenance block removed' });
});

module.exports = {
  createMaintenanceBlock,
  getMaintenanceBlocks,
  deleteMaintenanceBlock,
};
