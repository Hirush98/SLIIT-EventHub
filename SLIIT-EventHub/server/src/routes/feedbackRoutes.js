const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  submitFeedback,
  getEventFeedback,
  generateFeedbackQR,
  getSingleFeedback,
  getFeedbackSummary,
  startFeedback,
  stopFeedback,
  isFeedbackEnabled,
  checkUserFeedbackStatus,
  getFeedbackStats
} = require("../controllers/feedbackController");
const { checkFeedbackEnabled } = require("../middleware/checkFeedbackMiddleware");


// Get AI-generated summary of feedback for an event
router.get('/:eventId/feedback-summary', protect, restrictTo('organizer', 'admin'), getFeedbackSummary);

// Generate QR for an event (organizer/admin only)
router.get(
  "/qr/:eventId",
  protect,
  restrictTo('organizer', 'admin'),
  generateFeedbackQR
);

// Get single feedback by ID (organizer/admin only)
router.get(
  "/single/:id",
  protect,
  restrictTo('organizer', 'admin'),
  getSingleFeedback
);

// Submit feedback (logged-in users only)
router.post(
  "/:eventId", 
  protect,
  checkFeedbackEnabled, 
  submitFeedback
);

// Get all feedback for an event (organizer/admin only)
router.get(
  "/:eventId",
  protect,
  restrictTo('organizer', 'admin'),
  getEventFeedback
);


router.patch(
  "/start/:eventId",
  protect,
  restrictTo('organizer', 'admin'),
  startFeedback
);

router.patch(
  "/stop/:eventId",
  protect,
  restrictTo('organizer', 'admin'),
  stopFeedback
);

// Check feedback status (public)
router.get("/:eventId/status", protect, isFeedbackEnabled);

// Check if user has already submitted feedback for this event
router.get("/:eventId/user-status", protect, checkUserFeedbackStatus);

// Get feedback stats (any user - for displaying avg rating)
router.get("/:eventId/stats", protect, getFeedbackStats);


module.exports = router;