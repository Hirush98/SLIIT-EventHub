const crypto       = require('crypto');
const UserAccount  = require('../models/UserAccount');
const { OAuth2Client } = require('google-auth-library');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  buildUserPayload
} = require('../utils/tokenUtils');
const { sendPasswordResetEmail } = require('../utils/emailUtils');

// ── POST /api/auth/register ────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if email already registered
    const existing = await UserAccount.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const user = await UserAccount.create({
      firstName,
      lastName,
      email,
      password
    });

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success:      true,
      message:      'Account created successfully.',
      user:         buildUserPayload(user),
      accessToken,
      refreshToken
    });
  } catch (err) { next(err); }
};

// ── POST /api/auth/login ───────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Select password (hidden by default)
    const user = await UserAccount.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact admin.'
      });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success:      true,
      message:      'Login successful.',
      user:         buildUserPayload(user),
      accessToken,
      refreshToken
    });
  } catch (err) { next(err); }
};

// ── GET /api/auth/me ───────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await UserAccount.findById(req.user._id);
    res.status(200).json({
      success: true,
      user:    buildUserPayload(user)
    });
  } catch (err) { next(err); }
};

// ── PUT /api/auth/profile ──────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await UserAccount.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName  = lastName;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user:    buildUserPayload(user)
    });
  } catch (err) { next(err); }
};

// ── POST /api/auth/refresh ─────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    const decoded = verifyRefreshToken(token);
    const user    = await UserAccount.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    res.status(200).json({
      success:     true,
      accessToken: generateAccessToken(user)
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.'
      });
    }

    const user = await UserAccount.findOne({ email });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.'
      });
    }

    const rawToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.CLIENT_URL}/reset-password/${rawToken}`
      : `http://localhost:3000/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail({ email: user.email, resetUrl });
      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email.'
      });
    } catch {
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Try again later.'
      });
    }
  } catch (err) { next(err); }
};

// ── POST /api/auth/reset-password/:token ──────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await UserAccount.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired.'
      });
    }

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success:      true,
      message:      'Password reset successful. You can now log in.',
      accessToken:  generateAccessToken(user),
      refreshToken: generateRefreshToken(user)
    });
  } catch (err) { next(err); }
};

// ── POST /api/auth/google ──────────────────────────────────
const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required.'
      });
    }

    const client  = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket  = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token.'
      });
    }

    const { email, given_name, family_name, picture } = payload;

    let user = await UserAccount.findOne({ email });

    // Auto-create account if first Google login
    if (!user) {
      const tempPassword = crypto.randomBytes(16).toString('hex') + 'Aa1!';
      user = await UserAccount.create({
        firstName: given_name  || 'User',
        lastName:  family_name || '',
        email,
        password:  tempPassword,
        profilePhoto: picture || ''
      });
    }

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success:      true,
      message:      'Google login successful.',
      user:         buildUserPayload(user, { profilePhoto: picture || user.profilePhoto }),
      accessToken,
      refreshToken
    });
  } catch (err) { next(err); }
};

// ── POST /api/auth/logout ──────────────────────────────────
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleAuth,
  logout
};
