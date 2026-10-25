// backend/src/routes/waitlist.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const { joinWaitlist, getMyWaitlist, leaveWaitlist } = require('../controllers/waitlistController.js');

router.use(protect);
router.post('/', joinWaitlist);               // body: { slotId }
router.get('/me', getMyWaitlist);
router.delete('/:id', leaveWaitlist);        // :id = waitlist entry id

module.exports = router;
