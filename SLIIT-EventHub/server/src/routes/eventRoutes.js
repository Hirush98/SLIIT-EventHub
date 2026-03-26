const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const router   = express.Router();

const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/eventController');

// ── Multer setup for image uploads ────────────────────────
// Images saved to server/uploads/ folder
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    // Unique filename: timestamp + original extension
    const uniqueName = `event-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG and WEBP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// ── Routes ─────────────────────────────────────────────────

// Public routes — no login needed
router.get('/',          getAllEvents);
router.get('/calendar',  getCalendarDots);
router.get('/check-conflict', checkConflict);

// Protected routes — login needed
router.get('/my-events',        protect, getMyEvents);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/:id',              getEventById);

// Organizer + Admin — create event with optional image
router.post('/',
  protect,
  restrictTo('organizer', 'admin'),
  upload.single('coverImage'),
  createEvent
);

// Owner or Admin — update event
router.put('/:id',
  protect,
  upload.single('coverImage'),
  updateEvent
);

// Admin only — approve/reject/complete/cancel
router.put('/:id/status',
  protect,
  restrictTo('admin'),
  updateEventStatus
);

// Any authenticated user — register/cancel
router.post('/:id/register',   protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

// Owner or Admin — delete
router.delete('/:id', protect, deleteEvent);

module.exports = router;
