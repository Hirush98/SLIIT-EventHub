const UserAccount = require('../models/UserAccount');

// ── GET /api/users/organizers ─────────────────────────────
// Public: Fetch all organizers (Clubs) for browsing
const getAllOrganizers = async (req, res, next) => {
  try {
    const organizers = await UserAccount.find({
      role:     'organizer',
      isActive: true
    }).select('firstName lastName profilePhoto description category memberCount');

    res.status(200).json({
      success: true,
      count:   organizers.length,
      data:    organizers
    });
  } catch (err) { next(err); }
};

module.exports = {
  getAllOrganizers
};
