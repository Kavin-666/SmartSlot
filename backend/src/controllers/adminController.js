// backend/src/controllers/adminController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const Resource = require('../models/Resource.js');
const Booking = require('../models/Booking.js');
const Slot = require('../models/Slot.js');

// @desc Dashboard metrics
// @route GET /api/v1/admin/dashboard
// @access Admin
const getDashboard = asyncHandler(async (req, res) => {
  const [userCount, resourceCount, confirmedCount, cancelledCount, upcomingCount] = await Promise.all([
    User.countDocuments(),
    Resource.countDocuments({ active: true }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Booking.countDocuments({ status: 'confirmed', startAt: { $gte: new Date() } }),
  ]);

  res.json({
    users: userCount,
    resources: resourceCount,
    bookings: {
      confirmed: confirmedCount,
      cancelled: cancelledCount,
      upcoming: upcomingCount,
    },
  });
});

module.exports = { getDashboard };
