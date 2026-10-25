// backend/src/routes/slots.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // needed for :id from parent
const { protect } = require('../middleware/auth.js');
const { getAvailability } = require('../controllers/slotController.js');

// GET /api/v1/resources/:id/availability?date=YYYY-MM-DD
router.get('/availability', getAvailability);

module.exports = router;
