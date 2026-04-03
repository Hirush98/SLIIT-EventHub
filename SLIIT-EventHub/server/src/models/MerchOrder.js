const mongoose = require('mongoose');

const MerchOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    paymentMethod: {
      type: String,
      enum: ['bank', 'collection'],
      required: true
    },
    paymentSlipName: {
      type: String,
      default: ''
    },
    paymentSlipPath: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending_confirmation', 'confirmed'],
      default: 'not_required'
    },
    orderStatus: {
      type: String,
      enum: ['pending_collection', 'completed'],
      default: 'pending_collection'
    },
    stockDeducted: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        category: { type: String, default: '', trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.models.MerchOrder || mongoose.model('MerchOrder', MerchOrderSchema);
