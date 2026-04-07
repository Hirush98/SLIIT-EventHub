const mongoose = require('mongoose');
const ClubFeedback = require('../models/ClubFeedback');
const UserAccount = require('../models/UserAccount');

// ── POST /api/feedback ────────────────────────────────────
// Submit or update a review
const createFeedback = async (req, res, next) => {
  try {
    const { organizerId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!organizerId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Organizer ID and rating are required.'
      });
    }

    // Check if organizer exists and is indeed an organizer
    const organizer = await UserAccount.findOne({ _id: organizerId, role: 'organizer' });
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Club/Organizer not found.'
      });
    }

    // Upsert feedback: Update if exists, else create
    const feedback = await ClubFeedback.findOneAndUpdate(
      { userId, organizerId },
      { rating, comment },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback
    });
  } catch (err) { next(err); }
};

// ── GET /api/feedback/organizer/:id ───────────────────────
// Get all feedback for a specific club
const getOrganizerFeedback = async (req, res, next) => {
  try {
    const { id: organizerId } = req.params;

    const feedbacks = await ClubFeedback.find({ organizerId })
      .populate('userId', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
  } catch (err) { next(err); }
};

// ── GET /api/feedback/stats/:id ───────────────────────────
// Get stats (average rating) for a club
const getOrganizerStats = async (req, res, next) => {
  try {
    const { id: organizerId } = req.params;

    const stats = await ClubFeedback.aggregate([
      { $match: { organizerId: new mongoose.Types.ObjectId(organizerId) } },
      {
        $group: {
          _id: '$organizerId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || { averageRating: 0, totalReviews: 0 }
    });
  } catch (err) { next(err); }
};

module.exports = {
  createFeedback,
  getOrganizerFeedback,
  getOrganizerStats
};
