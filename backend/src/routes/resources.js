// backend/src/routes/resources.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const { requireRole } = require('../middleware/role.js');
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController.js');
const { getAvailability } = require('../controllers/slotController.js');

// Public endpoints
router.get('/', getResources);
router.get('/:id', getResource);
router.get('/:id/availability', getAvailability);

// Admin only
router.post('/', protect, requireRole('admin'), createResource);
router.patch('/:id', protect, requireRole('admin'), updateResource);
router.delete('/:id', protect, requireRole('admin'), deleteResource);

module.exports = router;
