const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// POST /api/feedback - submit feedback
router.post('/', feedbackController.submitFeedback);

// GET /api/feedback - get all feedback (admin only)
router.get('/', feedbackController.getAllFeedback);

module.exports = router;