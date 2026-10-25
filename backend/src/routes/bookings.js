// backend/src/routes/bookings.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const { createBooking, getMyBookings, getBooking, cancelBooking } = require('../controllers/bookingController.js');

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/me', getMyBookings);
router.get('/:id', getBooking);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
