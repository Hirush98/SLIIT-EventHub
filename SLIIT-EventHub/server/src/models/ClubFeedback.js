const mongoose = require('mongoose');

const clubFeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: [true, 'User ID is required']
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: [true, 'Organizer (Club) ID is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews: One user can only review a club once.
clubFeedbackSchema.index({ userId: 1, organizerId: 1 }, { unique: true });

module.exports = mongoose.model('ClubFeedback', clubFeedbackSchema);
