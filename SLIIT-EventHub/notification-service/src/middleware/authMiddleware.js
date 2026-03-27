const jwt = require('jsonwebtoken');

// This middleware verifies the same JWT token
// issued by the auth-service
// Both services share the same JWT_SECRET

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user to request
    // Note: only id and role are in the token payload
    req.user = {
      id:        decoded.id,
      role:      decoded.role,
      // firstName and lastName come from request body if needed
      firstName: req.body.firstName || '',
      lastName:  req.body.lastName  || ''
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required: ${roles.join(' or ')}`
    });
  }
  next();
};

module.exports = { protect, restrictTo };
