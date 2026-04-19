const Notification = require('../models/Notification');

const serializeNotification = (notification) => ({
  id: notification._id.toString(),
  title: notification.title,
  message: notification.message,
  type: notification.type,
  orderId: notification.order?.toString?.() || notification.order,
  read: notification.read,
  createdAt: notification.createdAt
});

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      unreadCount: notifications.filter((item) => !item.read).length,
      notifications: notifications.map(serializeNotification)
    });
  } catch (err) {
    next(err);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markAllNotificationsRead };
