const Feedback = require("../models/Feedback");
const Event = require('../models/CampusEvent');
const { GoogleGenerativeAI } = require('@google/generative-ai');


const QRCode = require("qrcode");
const mongoose = require("mongoose");

// Submit feedback for an event (logged-in users only)
exports.submitFeedback = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.feedbackEnabled) {
      return res.status(403).json({
        success: false,
        message: "Feedback is closed"
      });
    }

    const userId = req.user.id;
    const { rating, comments } = req.body;

    const feedback = new Feedback({
      event: event._id,
      userId,
      rating,
      comments,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });

  } catch (err) {

    // ✅ Handle duplicate feedback (unique index error)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted feedback for this event",
      });
    }

    next(err);
  }
};

// Get all feedback for an event (Organizer/Admin only)
exports.getEventFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Authorization: only event creator or admin/organizer can view feedback
    if (
      event.createdBy.toString() !== req.user.id &&
      !["admin", "organizer"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view feedback",
      });
    }

    // Fetch feedbacks for this event, sorted by newest first
    const feedbacks = await Feedback.find({ event: eventId })
      .sort({ createdAt: -1 }) // newest first
      .select("_id userId rating comments createdAt"); // only send necessary fields

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// Generate QR code for feedback form (Organizer/Admin only)
exports.generateFeedbackQR = async (req, res, next) => {
  try {

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Only organizer or admin can generate QR
    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Add redirectTo param so users are sent to login first if needed
    const feedbackUrl = `${process.env.CLIENT_URL}/signin?redirectTo=/feedback/${event._id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(feedbackUrl);

    res.status(200).json({
      success: true,
      qrCode: qrCodeDataUrl,
      url: feedbackUrl, // send full link for reference or copying
    });
  } catch (err) {
    next(err);
  }
};

// Get single feedback by ID (Organizer/Admin only)
exports.getSingleFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate("userId", "firstName lastName email");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });

  } catch (err) {
    next(err);
  }
};

// start feedback
exports.startFeedback = async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.eventId,
    { feedbackEnabled: true },
    { new: true }
  );

  res.json({
    success: true,
    message: "Feedback started",
    feedbackEnabled: event.feedbackEnabled
  });
};

// stop feedback
exports.stopFeedback = async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.eventId,
    { feedbackEnabled: false },
    { new: true }
  );

  res.json({
    success: true,
    message: "Feedback stopped",
    feedbackEnabled: event.feedbackEnabled
  });
};

// Check if feedback is enabled for an event
exports.isFeedbackEnabled = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId).select('feedbackEnabled');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, feedbackEnabled: event.feedbackEnabled });
  } catch (err) {
    next(err);
  }
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// Get AI-generated summary of feedback for an event
exports.getFeedbackSummary = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // 1. Fetch feedback from DB
    // We only need comments and ratings to give Gemini better context
    const feedbacks = await Feedback.find({ event: eventId }).select('comments rating -_id');

    if (!feedbacks || feedbacks.length === 0) {
      return res.json({ summary: 'No feedback available yet to summarize.' });
    }

    // 2. Prepare data
    let feedbackData = feedbacks
      .filter(f => f.comments && f.comments.trim() !== '')
      .map(f => `Rating: ${f.rating}/5 - Comment: ${f.comments}`);

    if (feedbackData.length === 0) {
      return res.json({ summary: 'No written comments available yet.' });
    }

    // 3. Sampling (Keep it under token limits)
    if (feedbackData.length > 100) {
      feedbackData = shuffleArray(feedbackData).slice(0, 100);
    }

    // 4. Gemini Implementation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      You are an event coordinator analyzing participant feedback. 
      Summarize the following feedback comments into a professional, concise paragraph.
      Focus on the general sentiment, recurring praise, common complaints, and specific suggestions for improvement.
      
      Feedback Data:
      ${feedbackData.join('\n')}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({
      summary: summary || 'Unable to generate summary at this time.',
      count: feedbacks.length
    });

  } catch (err) {
    console.error("Gemini Error:", err);
    // Fallback if AI fails
    res.status(500).json({ message: "Error generating AI summary." });
  }
};

// Utility: Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}