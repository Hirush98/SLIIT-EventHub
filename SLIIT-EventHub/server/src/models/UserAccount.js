const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const UserAccountSchema = new mongoose.Schema(
  {
    firstName: {
      type: String, required: [true, 'First name is required'],
      trim: true, minlength: [2, 'First name must be at least 2 characters']
    },
    lastName: {
      type: String, required: [true, 'Last name is required'],
      trim: true, minlength: [2, 'Last name must be at least 2 characters']
    },
    email: {
      type: String, required: [true, 'Email is required'],
      unique: true, trim: true, lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String, required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['participant', 'organizer', 'admin'],
      default: 'participant'
    },
    profilePhoto: { type: String, default: '' },
    description:  { type: String, default: '' },
    category:     { type: String, default: 'Other' },
    memberCount:  { type: Number, default: 0 },
    isActive:     { type: Boolean, default: true },
    resetPasswordToken:  { type: String, select: false },
    resetPasswordExpiry: { type: Date,   select: false }
  },
  { timestamps: true }
);

UserAccountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserAccountSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

UserAccountSchema.methods.generateResetToken = function () {
  const rawToken           = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken  = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.resetPasswordExpiry = Date.now() + 30 * 60 * 1000;
  return rawToken;
};

module.exports = mongoose.model('UserAccount', UserAccountSchema);