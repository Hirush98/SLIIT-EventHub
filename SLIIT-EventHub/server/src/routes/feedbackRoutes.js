const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  submitFeedback,
  getEventFeedback,
  generateFeedbackQR,
  getSingleFeedback,
  getFeedbackSummary,
} = require("../controllers/feedbackController");


// Get AI-generated summary of feedback for an event
router.get('/:eventId/feedback-summary', getFeedbackSummary);

// Submit feedback (logged-in users only)
router.post("/:eventId", protect, submitFeedback);

// Get all feedback for an event (organizer/admin only)
router.get("/:eventId", protect, getEventFeedback);

// Generate QR for an event (organizer/admin only)
router.get("/qr/:eventId", protect, restrictTo('organizer', 'admin'), generateFeedbackQR);

// Get single feedback by ID (organizer/admin only)
router.get("/single/:id", protect, restrictTo('organizer', 'admin'), getSingleFeedback);

module.exports = router;