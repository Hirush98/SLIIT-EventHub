const UserAccount = require('../models/UserAccount');

// ── GET /api/admin/users ───────────────────────────────────
// List all users with search + filter
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role)   filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } }
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await UserAccount.countDocuments(filter);

    const users = await UserAccount
      .find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
      data:  users.map((u) => ({
        id:        u._id,
        firstName: u.firstName,
        lastName:  u.lastName,
        email:     u.email,
        role:      u.role,
        isActive:  u.isActive,
        createdAt: u.createdAt
      }))
    });
  } catch (err) { next(err); }
};

// ── PUT /api/admin/users/:id/role ──────────────────────────
// Change user role
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['participant', 'organizer', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await UserAccount.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        isActive:  user.isActive
      }
    });
  } catch (err) { next(err); }
};

// ── PUT /api/admin/users/:id/status ───────────────────────
// Activate or deactivate a user account
const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await UserAccount.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'}`,
      data: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        isActive:  user.isActive
      }
    });
  } catch (err) { next(err); }
};

// ── GET /api/admin/stats ───────────────────────────────────
// Platform statistics
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers      = await UserAccount.countDocuments();
    const activeUsers     = await UserAccount.countDocuments({ isActive: true });
    const organizerCount  = await UserAccount.countDocuments({ role: 'organizer' });
    const participantCount = await UserAccount.countDocuments({ role: 'participant' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        organizerCount,
        participantCount
      }
    });
  } catch (err) { next(err); }
};

module.exports = {
  getAllUsers,
  changeUserRole,
  toggleUserStatus,
  getPlatformStats
};
