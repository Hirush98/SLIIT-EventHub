const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || '1d' }
);

const generateRefreshToken = (user) => jwt.sign(
  { id: user._id },
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
);

const verifyRefreshToken = (token) => jwt.verify(
  token,
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
);

const buildUserPayload = (user, extra = {}) => ({
  id:           user._id,
  firstName:    user.firstName,
  lastName:     user.lastName,
  email:        user.email,
  role:         user.role,
  profilePhoto: user.profilePhoto || '',
  ...extra
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  buildUserPayload
};