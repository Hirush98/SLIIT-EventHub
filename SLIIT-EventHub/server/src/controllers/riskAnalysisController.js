const CampusEvent = require('../models/CampusEvent');
const UserAccount = require('../models/UserAccount');

// ── GET /api/admin/risk-analysis ──────────────────────────
// Analyse organizer behaviour and return risk scores
const getRiskyUsers = async (req, res, next) => {
  try {
    // Aggregate per-organizer stats from CampusEvent
    const pipeline = [
      {
        $group: {
          _id: '$createdBy',
          totalEvents:    { $sum: 1 },
          rejectedCount:  { $sum: { $cond: [{ $eq: ['$status', 'rejected'] },  1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          conflictCount:  { $sum: { $cond: [{ $eq: ['$hasConflict', true] },   1, 0] } },
        },
      },
      {
        // Only include users who have created at least one event
        $match: { totalEvents: { $gte: 1 } },
      },
    ];

    const stats = await CampusEvent.aggregate(pipeline);

    // Fetch user details for each organizer
    const userIds = stats.map((s) => s._id);
    const users = await UserAccount.find({ _id: { $in: userIds } })
      .select('firstName lastName email role profilePhoto')
      .lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    // Calculate risk scores and classify
    const results = stats
      .map((s) => {
        const total = s.totalEvents;
        const rejectionRate  = total > 0 ? s.rejectedCount  / total : 0;
        const cancellationRate = total > 0 ? s.cancelledCount / total : 0;
        const conflictRate   = total > 0 ? s.conflictCount  / total : 0;

        // Weighted risk score (0–100)
        const riskScore = Math.round(
          rejectionRate    * 40 +
          cancellationRate * 35 +
          conflictRate     * 25
        );

        // Classify risk level
        let riskLevel;
        if (riskScore >= 60)      riskLevel = 'High';
        else if (riskScore >= 30) riskLevel = 'Medium';
        else                      riskLevel = 'Low';

        const user = userMap[s._id.toString()];

        return {
          userId:         s._id,
          firstName:      user?.firstName || 'Unknown',
          lastName:       user?.lastName  || '',
          email:          user?.email     || '',
          role:           user?.role      || '',
          profilePhoto:   user?.profilePhoto || '',
          totalEvents:    total,
          rejectedCount:  s.rejectedCount,
          cancelledCount: s.cancelledCount,
          conflictCount:  s.conflictCount,
          riskScore,
          riskLevel,
        };
      })
      // Sort by risk score descending (highest risk first)
      .sort((a, b) => b.riskScore - a.riskScore);

    // Summary counts
    const summary = {
      totalAnalyzed: results.length,
      highRisk:   results.filter((r) => r.riskLevel === 'High').length,
      mediumRisk: results.filter((r) => r.riskLevel === 'Medium').length,
      lowRisk:    results.filter((r) => r.riskLevel === 'Low').length,
    };

    res.status(200).json({
      success: true,
      summary,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRiskyUsers };
