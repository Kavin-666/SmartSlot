// backend/src/controllers/bookingController.js
const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking.js');
const Slot = require('../models/Slot.js');
const Resource = require('../models/Resource.js');
const Property = require('../models/Property.js');
const MaintenanceBlock = require('../models/MaintenanceBlock.js');
const AuditLog = require('../models/AuditLog.js');
const { z } = require('zod');

// Validation schema for creating a booking
const createSchema = z.object({
  slotId: z.string().min(1),
});

// @desc Create a booking (reserve a slot atomically)
// @route POST /api/v1/bookings
// @access Private (user)
const createBooking = asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.format() });
  }
  const { slotId } = parsed.data;
  const userId = req.user._id;

  // 1. Fetch slot to check maintenance blocks and parent property
  const candidateSlot = await Slot.findById(slotId);
  if (!candidateSlot) {
    return res.status(404).json({ message: 'Slot not found' });
  }

  // Check maintenance blocks
  const maintenance = await MaintenanceBlock.findOne({
    resourceId: candidateSlot.resourceId,
    startAt: { $lt: candidateSlot.endAt },
    endAt: { $gt: candidateSlot.startAt },
  });
  if (maintenance) {
    return res.status(409).json({ message: `Slot is unavailable due to maintenance: ${maintenance.reason}` });
  }

  // Load resource to verify active, bookable, property status, and snapshot pricing
  const resource = await Resource.findById(candidateSlot.resourceId).populate('propertyId');
  if (!resource || !resource.active || !resource.bookable) {
    return res.status(400).json({ message: 'Resource is not available for booking' });
  }

  // If part of property, ensure property is published (or user is owner/admin)
  if (resource.propertyId && resource.propertyId.status !== 'published') {
    const isOwner = resource.propertyId.createdBy?.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(400).json({ message: 'Property is in draft mode and not yet published' });
    }
  }

  // 2. Atomically claim the slot if it is still available
  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, available: true },
    { $set: { available: false, bookedBy: userId } },
    { new: true }
  );

  if (!slot) {
    // Slot already taken by concurrent request
    return res.status(409).json({ message: 'Slot already booked' });
  }

  // 3. Create the booking record linked to the slot with pricing and property snapshot
  const booking = await Booking.create({
    userId,
    resourceId: slot.resourceId,
    propertyId: resource.propertyId?._id || resource.propertyId,
    slotId: slot._id,
    startAt: slot.startAt,
    endAt: slot.endAt,
    status: 'confirmed',
    pricing: resource.pricing || { model: 'free', price: 0, currency: 'USD' },
    approved: !resource.requiresApproval,
  });

  // Audit log
  await AuditLog.create({
    actorId: userId,
    actorName: req.user.name,
    action: 'BOOKING_CREATED',
    targetType: 'Booking',
    targetId: booking._id.toString(),
    propertyId: booking.propertyId,
    metadata: { reference: booking.reference, resourceName: resource.name },
  });

  res.status(201).json({ booking });
});

// @desc Get current user's bookings (list)
// @route GET /api/v1/bookings/me
// @access Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('resourceId', 'name category propertyId')
    .populate('propertyId', 'name location coverImage')
    .populate('slotId', 'startAt endAt')
    .sort({ startAt: -1 });
  res.json({ bookings });
});

// @desc Get a single booking (owner, property manager, or admin)
// @route GET /api/v1/bookings/:id
// @access Private
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('resourceId', 'name category propertyId')
    .populate('propertyId', 'name location')
    .populate('slotId', 'startAt endAt')
    .populate('userId', 'name email');
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Authorization: user owner, or admin
  const isUser = booking.userId._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isUser && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden: You cannot view this booking' });
  }
  res.json({ booking });
});

// @desc Cancel a confirmed booking
// @route POST /api/v1/bookings/:id/cancel
// @access Private (owner or manager)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const isUser = booking.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isUser && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (booking.status !== 'confirmed') {
    return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
  }

  // 1. Mark existing booking cancelled and persist immediately so unique index on active booking is cleared
  booking.status = 'cancelled';
  await booking.save();

  // 2. Atomically free the slot
  await Slot.findByIdAndUpdate(booking.slotId, { $set: { available: true, bookedBy: null } });

  // 3. After freeing the slot, try to promote a waitlist entry (if any)
  const { promoteFromWaitlist } = require('./waitlistController.js');
  const promoted = await promoteFromWaitlist(booking.slotId);
  if (promoted) {
    console.log(`Waitlist promotion: user ${promoted.userId} got slot ${promoted.slotId}`);
  }

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'BOOKING_CANCELLED',
    targetType: 'Booking',
    targetId: booking._id.toString(),
    propertyId: booking.propertyId,
    metadata: { reference: booking.reference, promotedUser: promoted ? promoted.userId : null },
  });

  res.json({ message: 'Booking cancelled', booking, promoted });
});

module.exports = { createBooking, getMyBookings, getBooking, cancelBooking };
