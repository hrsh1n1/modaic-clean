/**
 * modaic/backend/src/controllers/insights.controller.js
 */

const { getWardrobeInsights } = require('../services/insights.service');
const { createSuccess } = require('../utils/apiResponse');

const getInsights = async (req, res, next) => {
  try {
    const insights = await getWardrobeInsights(req.user._id, req.user.styleProfile);
    res.status(200).json(createSuccess(insights));
  } catch (err) {
    next(err);
  }
};

module.exports = { getInsights };
