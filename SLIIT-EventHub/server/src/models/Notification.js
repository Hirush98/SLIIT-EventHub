const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['payment_confirmed', 'order_completed'],
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MerchOrder',
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
