/**
 * modaic/backend/src/middleware/auth.middleware.js
 * JWT-based authentication guard
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { createError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    // Support Bearer token in Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json(createError('No token provided. Please log in.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json(createError('User not found or deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(createError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(createError('Token expired. Please log in again.', 401));
    }
    next(error);
  }
};

/** Optional: restrict to Pro plan */
const requirePro = (req, res, next) => {
  if (req.user?.plan !== 'pro') {
    return res.status(403).json(createError('This feature requires a Pro plan. ✨', 403));
  }
  next();
};

module.exports = { protect, requirePro };
