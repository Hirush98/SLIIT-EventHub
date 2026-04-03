const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  markAllNotificationsRead
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/mine', protect, getMyNotifications);
router.patch('/mine/read', protect, markAllNotificationsRead);

module.exports = router;
