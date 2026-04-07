const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getOrganizerFeedback,
  getOrganizerStats
} = require('../controllers/clubFeedbackController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Publicly viewable stats/reviews
router.get('/organizer/:id', getOrganizerFeedback);
router.get('/stats/:id', getOrganizerStats);

// Protected: Only participants can leave feedback
router.post('/', protect, restrictTo('participant'), createFeedback);

module.exports = router;
