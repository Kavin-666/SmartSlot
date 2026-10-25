const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const {
  generatePropertyDraft,
  getResourceRecommendations,
} = require('../controllers/aiAssistantController.js');

// AI Property Draft Generation (Private)
router.post('/property-draft', protect, generatePropertyDraft);

// AI Resource Recommendations (Public / Private)
router.post('/recommendations', getResourceRecommendations);

module.exports = router;
