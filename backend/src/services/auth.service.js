/**
 * modaic/backend/src/services/auth.service.js
 * Authentication business logic — decoupled from HTTP layer
 */

const User = require('../models/User.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

/**
 * Register new user
 */
const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Remove sensitive fields before sending to client
 */
const sanitizeUser = (user) => ({
  _id:          user._id,
  name:         user.name,
  email:        user.email,
  avatar:       user.avatar,
  plan:         user.plan,
  styleProfile: user.styleProfile,
  stats:        user.stats,
  createdAt:    user.createdAt,
});

module.exports = { registerUser, loginUser, sanitizeUser };
