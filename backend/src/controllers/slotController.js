// backend/src/controllers/slotController.js
const asyncHandler = require('express-async-handler');
const Slot = require('../models/Slot.js');
const Resource = require('../models/Resource.js');
const Property = require('../models/Property.js');
const MaintenanceBlock = require('../models/MaintenanceBlock.js');
const { z } = require('zod');

// Helper: generate Date objects for a specific day and time string (HH:MM)
const makeDate = (dateStr, timeStr) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCHours(hour, minute, 0, 0);
  return d;
};

// GET /api/v1/resources/:id/availability?date=YYYY-MM-DD
const getAvailability = asyncHandler(async (req, res) => {
  const { id: resourceId } = req.params;
  const { date } = req.query;

  // Validate date param
  const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
  if (!dateSchema.safeParse(date).success) {
    return res.status(400).json({ message: 'Invalid date format (YYYY-MM-DD)' });
  }

  const resource = await Resource.findById(resourceId).populate('propertyId');
  if (!resource) {
    return res.status(404).json({ message: 'Resource not found' });
  }
  if (!resource.active || !resource.bookable) {
    return res.status(400).json({ message: 'Resource is inactive or non-bookable' });
  }

  // If tied to a property, check that property is published (unless owner/admin)
  if (resource.propertyId && resource.propertyId.status !== 'published') {
    const isOwner = req.user && resource.propertyId.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(400).json({ message: 'Parent property is in draft status and not yet publicly bookable' });
    }
  }

  // Determine operational hours: resource-specific or inherited from property
  let hours = resource.openingHours;
  if (!hours || hours.length === 0) {
    hours = resource.propertyId?.configuration?.operatingHours || [];
  }

  // Determine day of week (0 = Sunday) in UTC for the given date
  const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();
  const todayHours = hours.filter((h) => h.day === dayOfWeek);
  if (!todayHours || todayHours.length === 0) {
    return res.json({ slots: [] }); // closed that day
  }

  // Slot duration in minutes (resource pricing / property configuration or default 30)
  const slotDuration = resource.propertyId?.configuration?.defaultSlotDuration || 30;

  for (const h of todayHours) {
    const start = makeDate(date, h.start);
    const end = makeDate(date, h.end);
    for (let cur = new Date(start); cur < end; cur = new Date(cur.getTime() + slotDuration * 60000)) {
      const slotEnd = new Date(cur.getTime() + slotDuration * 60000);
      try {
        await Slot.updateOne(
          { resourceId, startAt: cur },
          {
            $setOnInsert: {
              resourceId,
              startAt: cur,
              endAt: slotEnd,
              available: true,
            },
          },
          { upsert: true }
        );
      } catch (e) {
        // ignore duplicate key errors
      }
    }
  }

  const dayStart = new Date(date + 'T00:00:00Z');
  const dayEnd = new Date(date + 'T23:59:59Z');

  // Check maintenance blocks that intersect this day
  const maintenanceBlocks = await MaintenanceBlock.find({
    resourceId,
    startAt: { $lte: dayEnd },
    endAt: { $gte: dayStart },
  });

  // Fetch all slots for that day
  const slots = await Slot.find({
    resourceId,
    startAt: { $gte: dayStart, $lt: dayEnd },
  }).sort({ startAt: 1 });

  const result = slots.map((s) => {
    // Check if slot falls inside any maintenance window
    const inMaintenance = maintenanceBlocks.find(
      (mb) => s.startAt < mb.endAt && s.endAt > mb.startAt
    );

    return {
      id: s._id,
      startAt: s.startAt,
      endAt: s.endAt,
      available: inMaintenance ? false : s.available,
      maintenance: !!inMaintenance,
      maintenanceReason: inMaintenance ? inMaintenance.reason : null,
      pricing: resource.pricing,
    };
  });

  res.json({ slots: result, pricing: resource.pricing });
});

module.exports = { getAvailability };
