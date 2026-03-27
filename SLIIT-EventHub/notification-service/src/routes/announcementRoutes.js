const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getAllAnnouncements,
  getLatestAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

// Public — anyone can read announcements
router.get('/',        getAllAnnouncements);
router.get('/latest',  getLatestAnnouncements);
router.get('/:id',     getAnnouncementById);

// Protected — only organizer or admin can create/edit/delete
router.post('/',
  protect,
  restrictTo('organizer', 'admin'),
  createAnnouncement
);

router.put('/:id',
  protect,
  restrictTo('organizer', 'admin'),
  updateAnnouncement
);

router.delete('/:id',
  protect,
  deleteAnnouncement
);

module.exports = router;
