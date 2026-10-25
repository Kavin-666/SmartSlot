// backend/src/controllers/waitlistController.js
const asyncHandler = require('express-async-handler');
const Waitlist = require('../models/Waitlist.js');
const Slot = require('../models/Slot.js');
const Booking = require('../models/Booking.js');
const { z } = require('zod');

// Join waitlist for a specific slot
const joinWaitlist = asyncHandler(async (req, res) => {
  const schema = z.object({
    slotId: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.format() });
  }
  const { slotId } = parsed.data;
  const slot = await Slot.findById(slotId);
  if (!slot) return res.status(404).json({ message: 'Slot not found' });
  if (slot.available) return res.status(400).json({ message: 'Slot is still available; you can book directly' });

  try {
    const entry = await Waitlist.create({
      userId: req.user._id,
      resourceId: slot.resourceId,
      slotId: slot._id,
    });
    res.status(201).json({ entry });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Already on waitlist for this slot' });
    }
    throw err;
  }
});

// Get current user's waitlist entries
const getMyWaitlist = asyncHandler(async (req, res) => {
  const entries = await Waitlist.find({ userId: req.user._id })
    .populate('resourceId', 'name')
    .populate('slotId', 'startAt endAt')
    .sort({ createdAt: 1 });
  res.json({ entries });
});

// Remove an entry (user can withdraw)
const leaveWaitlist = asyncHandler(async (req, res) => {
  const { id } = req.params; // waitlist entry id
  const entry = await Waitlist.findById(id);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  if (entry.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await entry.deleteOne();
  res.json({ message: 'Removed from waitlist' });
});

// Internal helper: promote earliest waitlist entry when a slot becomes free
// Called by cancellation flow (backend will invoke this function)
const promoteFromWaitlist = async (slotId) => {
  const candidate = await Waitlist.findOne({ slotId }).sort({ createdAt: 1 });
  if (!candidate) return null;
  // Attempt to claim the slot atomically (same as booking flow)
  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, available: true },
    { $set: { available: false, bookedBy: candidate.userId } },
    { new: true }
  );
  if (!slot) return null; // race condition, another process claimed it

  // Create booking record
  const booking = await Booking.create({
    userId: candidate.userId,
    resourceId: slot.resourceId,
    slotId: slot._id,
    startAt: slot.startAt,
    endAt: slot.endAt,
    status: 'confirmed',
  });
  // Remove waitlist entry
  await candidate.deleteOne();
  return booking;
};

module.exports = { joinWaitlist, getMyWaitlist, leaveWaitlist, promoteFromWaitlist };
