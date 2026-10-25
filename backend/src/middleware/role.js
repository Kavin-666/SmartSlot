// backend/src/middleware/role.js
const asyncHandler = require('express-async-handler');

const requireRole = (role) =>
  asyncHandler((req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  });

module.exports = { requireRole };
