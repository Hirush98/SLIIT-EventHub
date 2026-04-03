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

// ── Helper to convert HH:MM to total minutes ──
const timeToMins = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// ── GET /api/admin/participant-risk ───────────────────────
// Analyse participant behaviour based on double bookings
const getRiskyParticipants = async (req, res, next) => {
  try {
    // Only analyze approved events (future or past)
    const activeEvents = await CampusEvent.find({ status: 'approved' })
      .select('eventDate startTime endTime participants')
      .lean();

    const userRegistrations = {};

    // Group registrations by user
    activeEvents.forEach((ev) => {
      // Create a consistent date string (YYYY-MM-DD)
      const dateStr = new Date(ev.eventDate).toISOString().split('T')[0];
      const startMins = timeToMins(ev.startTime);
      const endMins = timeToMins(ev.endTime);

      ev.participants.forEach((p) => {
        const uid = p.userId.toString();
        if (!userRegistrations[uid]) {
          userRegistrations[uid] = {
            userId: uid,
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            events: [],
            doubleBookingCount: 0,
            totalRegistrations: 0
          };
        }
        
        userRegistrations[uid].totalRegistrations++;
        userRegistrations[uid].events.push({
          eventId: ev._id,
          dateStr,
          startMins,
          endMins
        });
      });
    });

    // Detect double bookings
    Object.values(userRegistrations).forEach((user) => {
      let conflicts = 0;
      const events = user.events;

      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          const e1 = events[i];
          const e2 = events[j];
          
          if (e1.dateStr === e2.dateStr) {
            // Check for time overlap
            if (e1.startMins < e2.endMins && e1.endMins > e2.startMins) {
              conflicts++;
            }
          }
        }
      }
      user.doubleBookingCount = conflicts;
    });

    // Format output
    const results = Object.values(userRegistrations)
      // Only return users who have registered for at least one event
      .filter((u) => u.totalRegistrations > 0)
      .map((u) => {
        // Simple risk calculation
        const ratio = u.doubleBookingCount / u.totalRegistrations;
        
        // Base score on double bookings
        let riskScore = Math.round((ratio * 50) + (u.doubleBookingCount * 25));
        
        // Factor in Ticket Hoarding (excessive registrations)
        const isHoarding = u.totalRegistrations >= 5;
        if (isHoarding) {
          riskScore += 40; // Add significant penalty for hoarding
        }
        
        riskScore = Math.min(100, riskScore);

        let riskLevel;
        if (riskScore >= 60 || u.doubleBookingCount >= 2 || isHoarding) {
          riskLevel = 'High';
        } else if (riskScore >= 30 || u.doubleBookingCount === 1) {
          riskLevel = 'Medium';
        } else {
          riskLevel = 'Low';
        }
        
        // Set an appropriate attendance note
        let note = "OK";
        if (u.doubleBookingCount > 0 && isHoarding) note = "Hoarding & Overlaps";
        else if (u.doubleBookingCount > 0) note = "Potential No-Show (Overlaps)";
        else if (isHoarding) note = "Ticket Hoarding (Excessive)";

        return {
          userId: u.userId,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          totalRegistrations: u.totalRegistrations,
          doubleBookingCount: u.doubleBookingCount,
          attendanceNote: note,
          riskScore: riskLevel === 'Low' ? 0 : riskScore || Math.floor(Math.random() * 20),
          riskLevel,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);

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

module.exports = { getRiskyUsers, getRiskyParticipants };
