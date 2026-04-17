const mongoose = require('mongoose');

// ── Participant sub-schema ─────────────────────────────────
// Stored inside each event when someone registers
const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'UserAccount',
      required: true
    },
    firstName:  { type: String, required: true },
    lastName:   { type: String, required: true },
    email:      { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

// ── Conflict detail sub-schema ────────────────────────────
// Stored when system detects a time overlap at submission
const conflictDetailSchema = new mongoose.Schema(
  {
    eventId:      { type: mongoose.Schema.Types.ObjectId, ref: 'CampusEvent' },
    title:        String,
    startTime:    String,
    endTime:      String,
    organizerName: String
  },
  { _id: false }
);

// ── Main Event Schema ──────────────────────────────────────
const campusEventSchema = new mongoose.Schema(
  {
    // Basic info
    title: {
      type:      String,
      required:  [true, 'Event title is required'],
      trim:      true,
      minlength: [5,   'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    description: {
      type:      String,
      required:  [true, 'Event description is required'],
      trim:      true,
      minlength: [20,   'Description must be at least 20 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum: {
        values:  ['Academic', 'Workshop', 'Sports', 'Cultural',
                  'Social', 'Seminar', 'Competition'],
        message: '{VALUE} is not a valid category'
      }
    },

    // Scheduling
    eventDate: {
      type:     Date,
      required: [true, 'Event date is required']
    },

    startTime: {
      type:     String,
      required: [true, 'Start time is required'],
      match:    [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be HH:MM format']
    },

    duration: {
      type:     Number,
      required: [true, 'Duration is required'],
      min:      [1, 'Duration must be at least 1 hour'],
      max:      [8, 'Duration cannot exceed 8 hours']
    },

    // End time is calculated from startTime + duration
    // Stored as string e.g. "11:00"
    endTime: {
      type: String
    },

    // Venue — free text, no validation
    venue: {
      type:     String,
      required: [true, 'Venue is required'],
      trim:     true
    },

    capacity: {
      type:     Number,
      required: [true, 'Capacity is required'],
      min:      [10,  'Capacity must be at least 10'],
      max:      [500, 'Capacity cannot exceed 500']
    },

    // Cover image — stored as filename (uploaded to server)
    coverImage: {
      type:    String,
      default: ''
    },

    // Optional tags
    tags: {
      type:    [String],
      default: []
    },

    // Who created the event
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'UserAccount',
      required: true
    },

    organizerName: {
      type:     String,
      required: true,
      trim:     true
    },

    // Event lifecycle status
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },

    // Rejection reason (set by admin)
    rejectionReason: {
      type:    String,
      default: ''
    },

    // Registered participants
    participants: {
      type:    [participantSchema],
      default: []
    },

    // Conflict detection fields
    hasConflict: {
      type:    Boolean,
      default: false
    },

    conflictDetails: {
      type:    [conflictDetailSchema],
      default: []
    }
  },
  {
    timestamps: true  // auto createdAt + updatedAt
  }
);

// ── Helper: Calculate end time from startTime + duration ──
// e.g. startTime="09:00", duration=2 → endTime="11:00"
campusEventSchema.methods.calculateEndTime = function () {
  const [hours, minutes] = this.startTime.split(':').map(Number);
  const totalMinutes     = hours * 60 + minutes + this.duration * 60;
  const endHours         = Math.floor(totalMinutes / 60) % 24;
  const endMins          = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
};

// ── Pre-save: auto-calculate endTime ──────────────────────
campusEventSchema.pre('save', function (next) {
  if (this.startTime && this.duration) {
    this.endTime = this.calculateEndTime();
  }
  next();
});

// ── Helper: check if a user is registered ─────────────────
campusEventSchema.methods.isUserRegistered = function (userId) {
  return this.participants.some(
    (p) => p.userId.toString() === userId.toString()
  );
};

// ── Virtual: spots remaining ──────────────────────────────
campusEventSchema.virtual('spotsRemaining').get(function () {
  return this.capacity - this.participants.length;
});

// ── Virtual: is event full ────────────────────────────────
campusEventSchema.virtual('isFull').get(function () {
  return this.participants.length >= this.capacity;
});

module.exports = mongoose.model('CampusEvent', campusEventSchema);
