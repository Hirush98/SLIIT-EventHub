// middleware/eventMiddleware.js
const Event = require('../models/CampusEvent');

exports.checkFeedbackEnabled = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        if (!event.feedbackEnabled) {
            return res.status(403).json({
                success: false,
                message: "Feedback is closed for this event"
            });
        }

        req.event = event; // pass forward
        next();

    } catch (err) {
        next(err);
    }
};