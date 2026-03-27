const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      minlength: [3,   'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    content: {
      type:      String,
      required:  [true, 'Content is required'],
      trim:      true,
      minlength: [10,   'Content must be at least 10 characters'],
      maxlength: [2000, 'Content cannot exceed 2000 characters']
    },

    // Priority affects how it is displayed
    priority: {
      type:    String,
      enum:    ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },

    // Optional link to a specific event
    relatedEventId: {
      type:    String,
      default: ''
    },

    relatedEventTitle: {
      type:    String,
      default: ''
    },

    // Who created the announcement
    createdBy: {
      type:     String,   // user ID as string (cross-service)
      required: true
    },

    authorName: {
      type:     String,
      required: true
    },

    authorRole: {
      type: String,
      enum: ['admin', 'organizer'],
      default: 'organizer'
    },

    // Soft delete / unpublish
    isActive: {
      type:    Boolean,
      default: true
    },

    // Track who has read it (array of user IDs)
    readBy: {
      type:    [String],
      default: []
    }
  },
  { timestamps: true }
);

// Mark as read by a user
announcementSchema.methods.markReadBy = function (userId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId);
  }
};

module.exports = mongoose.model('Announcement', announcementSchema);
