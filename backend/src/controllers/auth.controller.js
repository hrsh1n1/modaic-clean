/**
 * modaic/backend/src/controllers/auth.controller.js
 * Handles HTTP layer for auth routes — delegates to service
 */

const { registerUser, loginUser } = require('../services/auth.service');
const { createSuccess } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser({ name, email, password });
    res.status(201).json(createSuccess(result, 'Account created! Welcome to Modaic ✨'));
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.status(200).json(createSuccess(result, 'Welcome back! 🌸'));
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.status(200).json(createSuccess(req.user, 'Profile retrieved'));
};

const updateProfile = async (req, res, next) => {
  try {
    const User = require('../models/User.model');
    const allowed = ['name', 'avatar', 'styleProfile'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.status(200).json(createSuccess(user, 'Profile updated ✨'));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile };
