const path         = require('path');
const fs           = require('fs');
const CampusEvent  = require('../models/CampusEvent');

// ── Helper: calculate end time string ─────────────────────
const calcEndTime = (startTime, durationHours) => {
  const [h, m]       = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationHours * 60;
  const endH         = Math.floor(totalMinutes / 60) % 24;
  const endM         = totalMinutes % 60;
  return `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
};

// ── Helper: check time overlap ─────────────────────────────
// Returns true if two time ranges overlap
// Range A: aStart → aEnd
// Range B: bStart → bEnd
const timesOverlap = (aStart, aEnd, bStart, bEnd) => {
  // Convert HH:MM to minutes for easy comparison
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const aS = toMins(aStart), aE = toMins(aEnd);
  const bS = toMins(bStart), bE = toMins(bEnd);
  // Overlap exists if A starts before B ends AND A ends after B starts
  return aS < bE && aE > bS;
};

// ── Helper: build safe event response ─────────────────────
const buildEventResponse = (event) => ({
  id:              event._id,
  title:           event.title,
  description:     event.description,
  category:        event.category,
  eventDate:       event.eventDate,
  startTime:       event.startTime,
  endTime:         event.endTime,
  duration:        event.duration,
  venue:           event.venue,
  capacity:        event.capacity,
  spotsRemaining:  event.capacity - event.participants.length,
  isFull:          event.participants.length >= event.capacity,
  coverImage:      event.coverImage,
  tags:            event.tags,
  status:          event.status,
  rejectionReason: event.rejectionReason,
  hasConflict:     event.hasConflict,
  conflictDetails: event.conflictDetails,
  organizerName:   event.organizerName,
  // Always return createdBy as a plain string ID
  // event.createdBy can be either a populated object or a raw ObjectId
  // In both cases we extract just the string ID so frontend comparison works
  createdBy: event.createdBy?._id
    ? event.createdBy._id.toString()
    : event.createdBy?.toString(),
  participantCount: event.participants.length,
  createdAt:       event.createdAt,
  updatedAt:       event.updatedAt
});

// ══════════════════════════════════════════════════════════
// GET /api/events
// Get all events with optional search + filter
// Public — no auth needed to browse
// ══════════════════════════════════════════════════════════
const getAllEvents = async (req, res, next) => {
  try {
    const {
      search,    // keyword search in title/description
      category,  // filter by category
      status,    // filter by status (default: approved)
      date,      // filter by specific date (YYYY-MM-DD)
      page  = 1,
      limit = 12
    } = req.query;

    // Build MongoDB filter object
    const filter = {};

    // Default to approved events for public view
    filter.status = status || 'approved';

    // Keyword search — searches title and description
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) filter.category = category;

    // Date filter — events on a specific day
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.eventDate = { $gte: start, $lte: end };
    }

    // Pagination
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await CampusEvent.countDocuments(filter);

    const events = await CampusEvent
      .find(filter)
      .sort({ eventDate: 1, startTime: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      data:    events.map(buildEventResponse)
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// GET /api/events/calendar
// Get events grouped by date for calendar dots
// Returns object: { "2025-04-15": 3, "2025-04-20": 1 }
// ══════════════════════════════════════════════════════════
const getCalendarDots = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    const events = await CampusEvent.find({
      status:    'approved',
      eventDate: { $gte: startDate, $lte: endDate }
    }).select('eventDate title startTime endTime venue organizerName');

    // Group by date string
    const grouped = {};
    events.forEach((event) => {
      const dateKey = event.eventDate.toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push({
        id:           event._id,
        title:        event.title,
        startTime:    event.startTime,
        endTime:      event.endTime,
        venue:        event.venue,
        organizerName: event.organizerName
      });
    });

    res.status(200).json({ success: true, data: grouped });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// GET /api/events/check-conflict
// Check if any event overlaps with requested time slot
// Used by form auto-check when organizer fills date+time+duration
// ══════════════════════════════════════════════════════════
const checkConflict = async (req, res, next) => {
  try {
    const { date, startTime, duration, excludeId } = req.query;

    if (!date || !startTime || !duration) {
      return res.status(400).json({
        success: false,
        message: 'date, startTime and duration are required'
      });
    }

    const newEndTime = calcEndTime(startTime, Number(duration));

    // Get all approved events on this date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const filter = {
      status:    { $in: ['approved', 'pending'] },
      eventDate: { $gte: dayStart, $lte: dayEnd }
    };

    // Exclude current event when editing
    if (excludeId) filter._id = { $ne: excludeId };

    const dayEvents = await CampusEvent
      .find(filter)
      .select('title startTime endTime venue organizerName');

    // Check each event for time overlap
    const conflicts = dayEvents.filter((ev) =>
      timesOverlap(startTime, newEndTime, ev.startTime, ev.endTime)
    );

    if (conflicts.length === 0) {
      return res.status(200).json({
        success:     true,
        hasConflict: false,
        message:     'Time slot is free'
      });
    }

    // Return conflict details so frontend can display warning
    res.status(200).json({
      success:     true,
      hasConflict: true,
      message:     `${conflicts.length} event(s) overlap with your selected time`,
      conflicts:   conflicts.map((c) => ({
        id:           c._id,
        title:        c.title,
        startTime:    c.startTime,
        endTime:      c.endTime,
        venue:        c.venue,
        organizerName: c.organizerName
      }))
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// GET /api/events/:id
// Get single event by ID
// ══════════════════════════════════════════════════════════
const getEventById = async (req, res, next) => {
  try {
    const event = await CampusEvent
      .findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data:    buildEventResponse(event)
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// POST /api/events
// Create new event — organizer or admin only
// Handles image upload via multer (set up in routes)
// ══════════════════════════════════════════════════════════
const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, category,
      eventDate, startTime, duration,
      venue, capacity, tags
    } = req.body;

    // Calculate end time
    const endTime = calcEndTime(startTime, Number(duration));

    // Handle uploaded image filename
    const coverImage = req.file ? req.file.filename : '';

    // Check for conflicts with existing events
    const dayStart = new Date(eventDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(eventDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEvents = await CampusEvent.find({
      status:    { $in: ['approved', 'pending'] },
      eventDate: { $gte: dayStart, $lte: dayEnd }
    }).select('title startTime endTime organizerName');

    const conflictingEvents = dayEvents.filter((ev) =>
      timesOverlap(startTime, endTime, ev.startTime, ev.endTime)
    );

    // Build conflict details to store in event
    const conflictDetails = conflictingEvents.map((c) => ({
      eventId:      c._id,
      title:        c.title,
      startTime:    c.startTime,
      endTime:      c.endTime,
      organizerName: c.organizerName
    }));

    // Parse tags — can come as JSON string or array
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch {
        parsedTags = [];
      }
    }

    const event = await CampusEvent.create({
      title,
      description,
      category,
      eventDate:     new Date(eventDate),
      startTime,
      endTime,
      duration:      Number(duration),
      venue,
      capacity:      Number(capacity),
      coverImage,
      tags:          parsedTags,
      createdBy:     req.user._id,
      organizerName: `${req.user.firstName} ${req.user.lastName}`,
      status:        'pending',
      hasConflict:   conflictDetails.length > 0,
      conflictDetails
    });

    res.status(201).json({
      success: true,
      message: conflictDetails.length > 0
        ? 'Event created with conflict warning. Admin will review.'
        : 'Event created successfully. Awaiting admin approval.',
      data:        buildEventResponse(event),
      hasConflict: conflictDetails.length > 0,
      conflicts:   conflictDetails
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// PUT /api/events/:id
// Update event — owner or admin only
// ══════════════════════════════════════════════════════════
const updateEvent = async (req, res, next) => {
  try {
    const event = await CampusEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only owner or admin can edit
    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to edit this event'
      });
    }

    const allowedFields = [
      'title', 'description', 'category',
      'eventDate', 'startTime', 'duration',
      'venue', 'capacity', 'tags'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    // Recalculate endTime if time/duration changed
    if (req.body.startTime || req.body.duration) {
      event.endTime = calcEndTime(event.startTime, Number(event.duration));
    }

    // Update cover image if new file uploaded
    if (req.file) {
      // Delete old image file if exists
      if (event.coverImage) {
        const oldPath = path.join(__dirname, '../../uploads', event.coverImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      event.coverImage = req.file.filename;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data:    buildEventResponse(event)
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// DELETE /api/events/:id
// Delete event — owner or admin only
// ══════════════════════════════════════════════════════════
const deleteEvent = async (req, res, next) => {
  try {
    const event = await CampusEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const isOwner = event.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to delete this event'
      });
    }

    // Delete cover image from server if exists
    if (event.coverImage) {
      const imgPath = path.join(__dirname, '../../uploads', event.coverImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// PUT /api/events/:id/status
// Admin only — approve, reject, complete, cancel
// ══════════════════════════════════════════════════════════
const updateEventStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['approved', 'rejected', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const event = await CampusEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.status = status;

    if (status === 'rejected' && rejectionReason) {
      event.rejectionReason = rejectionReason;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${status} successfully`,
      data:    buildEventResponse(event)
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// POST /api/events/:id/register
// Register current user for an event
// ══════════════════════════════════════════════════════════
const registerForEvent = async (req, res, next) => {
  try {
    const event = await CampusEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only approved events can be registered for
    if (event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This event is not available for registration'
      });
    }

    // Cannot register for past events
    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for a past event'
      });
    }

    // Check capacity
    if (event.participants.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This event is fully booked'
      });
    }

    // Check if already registered
    if (event.isUserRegistered(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    event.participants.push({
      userId:    req.user._id,
      firstName: req.user.firstName,
      lastName:  req.user.lastName,
      email:     req.user.email
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data:    buildEventResponse(event)
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// DELETE /api/events/:id/register
// Cancel registration for current user
// ══════════════════════════════════════════════════════════
const cancelRegistration = async (req, res, next) => {
  try {
    const event = await CampusEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isUserRegistered(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    event.participants = event.participants.filter(
      (p) => p.userId.toString() !== req.user._id.toString()
    );

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data:    buildEventResponse(event)
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// GET /api/events/my-events
// Get all events created by the logged-in organizer
// ══════════════════════════════════════════════════════════
const getMyEvents = async (req, res, next) => {
  try {
    const events = await CampusEvent
      .find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count:   events.length,
      data:    events.map(buildEventResponse)
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
// GET /api/events/my-registrations
// Get all events the logged-in user is registered for
// ══════════════════════════════════════════════════════════
const getMyRegistrations = async (req, res, next) => {
  try {
    const events = await CampusEvent.find({
      'participants.userId': req.user._id,
      status: 'approved'
    }).sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      count:   events.length,
      data:    events.map(buildEventResponse)
    });
  } catch (err) { next(err); }
};

module.exports = {
  getAllEvents,
  getCalendarDots,
  checkConflict,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getMyRegistrations
};
