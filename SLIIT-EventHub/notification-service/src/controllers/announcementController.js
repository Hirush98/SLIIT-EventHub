const Announcement = require('../models/Announcement');

// ── GET /api/announcements ─────────────────────────────────
// Get all active announcements (newest first)
const getAllAnnouncements = async (req, res, next) => {
  try {
    const { priority, limit = 20, page = 1 } = req.query;

    const filter = { isActive: true };
    if (priority) filter.priority = priority;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Announcement.countDocuments(filter);

    const announcements = await Announcement
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      data:    announcements
    });
  } catch (err) { next(err); }
};

// ── GET /api/announcements/latest ─────────────────────────
// Get latest 5 announcements for homepage widget
const getLatestAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, data: announcements });
  } catch (err) { next(err); }
};

// ── GET /api/announcements/:id ─────────────────────────────
const getAnnouncementById = async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann || !ann.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    res.status(200).json({ success: true, data: ann });
  } catch (err) { next(err); }
};

// ── POST /api/announcements ────────────────────────────────
// Create announcement — organizer or admin only
// After creation → emit Socket.IO event to all connected clients
const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title, content, priority,
      relatedEventId, relatedEventTitle
    } = req.body;

    const ann = await Announcement.create({
      title,
      content,
      priority:          priority || 'normal',
      relatedEventId:    relatedEventId    || '',
      relatedEventTitle: relatedEventTitle || '',
      createdBy:         req.user.id,
      authorName:        `${req.user.firstName} ${req.user.lastName}`,
      authorRole:        req.user.role
    });

    // ── Emit real-time event to all connected clients ──────
    // Every browser listening on Socket.IO will receive this instantly
    const io = req.app.get('io');
    if (io) {
      io.emit('new_announcement', {
        id:          ann._id,
        title:       ann.title,
        content:     ann.content,
        priority:    ann.priority,
        authorName:  ann.authorName,
        createdAt:   ann.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created and broadcast to all users',
      data:    ann
    });
  } catch (err) { next(err); }
};

// ── PUT /api/announcements/:id ─────────────────────────────
// Update announcement — owner or admin only
const updateAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);

    if (!ann) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Only creator or admin can edit
    const isOwner = ann.createdBy === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorised to edit this announcement'
      });
    }

    const { title, content, priority } = req.body;
    if (title)    ann.title    = title;
    if (content)  ann.content  = content;
    if (priority) ann.priority = priority;

    await ann.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated',
      data:    ann
    });
  } catch (err) { next(err); }
};

// ── DELETE /api/announcements/:id ─────────────────────────
// Soft delete — sets isActive to false
const deleteAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);

    if (!ann) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    const isOwner = ann.createdBy === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorised to delete this announcement'
      });
    }

    ann.isActive = false;
    await ann.save();

    res.status(200).json({
      success: true,
      message: 'Announcement removed'
    });
  } catch (err) { next(err); }
};

module.exports = {
  getAllAnnouncements,
  getLatestAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
