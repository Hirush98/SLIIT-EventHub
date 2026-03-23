const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  getMe,
  updateProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleAuth,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register',                  register);
router.post('/login',                     login);
router.post('/refresh',                   refreshToken);
router.post('/forgot-password',           forgotPassword);
router.post('/reset-password/:token',     resetPassword);
router.post('/google',                    googleAuth);

// Protected routes
router.get ('/me',      protect, getMe);
router.put ('/profile', protect, updateProfile);
router.post('/logout',  protect, logout);

module.exports = router;
