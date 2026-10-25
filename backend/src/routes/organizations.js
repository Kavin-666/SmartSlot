const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  addMember,
} = require('../controllers/organizationController.js');

router.use(protect);

router.post('/', createOrganization);
router.get('/me', getMyOrganizations);
router.get('/:id', getOrganization);
router.post('/:id/members', addMember);

module.exports = router;
