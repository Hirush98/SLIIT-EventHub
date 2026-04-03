const express  = require('express');
const router   = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  changeUserRole,
  toggleUserStatus,
  getPlatformStats
} = require('../controllers/adminController');
const { getRiskyUsers } = require('../controllers/riskAnalysisController');

// All admin routes require login + admin role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users',                getAllUsers);
router.get('/stats',                getPlatformStats);
router.get('/risk-analysis',        getRiskyUsers);
router.put('/users/:id/role',       changeUserRole);
router.put('/users/:id/status',     toggleUserStatus);

module.exports = router;
