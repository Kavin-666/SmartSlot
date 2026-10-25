// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const { requireRole } = require('../middleware/role.js');
const { getDashboard } = require('../controllers/adminController.js');

router.use(protect, requireRole('admin'));
router.get('/dashboard', getDashboard);

module.exports = router;
