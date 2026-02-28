/**
 * modaic/backend/src/controllers/insights.controller.js
 * Caches AI insights for 1 hour per user — saves quota dramatically
 */

const { getWardrobeInsights } = require('../services/insights.service');
const { createSuccess } = require('../utils/apiResponse');

// In-memory cache: userId -> { data, expiresAt }
const insightsCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const cached = insightsCache.get(userId);

    // Return cached if still fresh
    if (cached && cached.expiresAt > Date.now()) {
      return res.status(200).json(createSuccess(cached.data));
    }

    // Fetch fresh — only calls Gemini if cache is stale
    const insights = await getWardrobeInsights(
      req.user._id,
      req.user.styleProfile,
      req.user.styleEmbedding,
    );

    // Cache it
    insightsCache.set(userId, {
      data: insights,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    res.status(200).json(createSuccess(insights));
  } catch (err) {
    next(err);
  }
};

// Call this when user adds/removes items to bust cache
const bustInsightsCache = (userId) => {
  insightsCache.delete(userId.toString());
};

module.exports = { getInsights, bustInsightsCache };