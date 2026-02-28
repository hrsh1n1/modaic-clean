/**
 * modaic/backend/src/services/insights.service.js
 */

const WardrobeItem = require('../models/WardrobeItem.model');
const Outfit = require('../models/Outfit.model');
const { generateStyleInsights } = require('./gemini.service');

const getWardrobeInsights = async (userId, styleProfile = {}, styleEmbedding = {}) => {
  const [items, outfits] = await Promise.all([
    WardrobeItem.find({ userId, isActive: true }),
    Outfit.countDocuments({ userId }),
  ]);

  const categoryMap = {};
  items.forEach(item => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
  });

  const totalWears = items.reduce((sum, i) => sum + i.wearCount, 0);
  const avgWears   = items.length > 0 ? (totalWears / items.length).toFixed(1) : 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const unlovedItems  = items
    .filter(i => !i.lastWornAt || i.lastWornAt < thirtyDaysAgo)
    .sort((a, b) => a.wearCount - b.wearCount)
    .slice(0, 5)
    .map(i => ({ _id: i._id, name: i.name, category: i.category, imageUrl: i.imageUrl, wearCount: i.wearCount, lastWornAt: i.lastWornAt }));

  const wornItems = items.filter(i => i.wearCount > 0).length;
  const reuseRate = items.length > 0 ? wornItems / items.length : 0;
  const sustainabilityScore = Math.min(100, Math.round(
    (reuseRate * 60) + (Math.min(avgWears / 10, 1) * 40)
  ));

  const itemsWithPrice = items.filter(i => i.purchasePrice && i.wearCount > 0);
  const avgCostPerWear = itemsWithPrice.length > 0
    ? Math.round(itemsWithPrice.reduce((sum, i) => sum + (i.purchasePrice / i.wearCount), 0) / itemsWithPrice.length)
    : null;

  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0];

  const stats = {
    totalItems: items.length,
    outfitsCreated: outfits,
    sustainabilityScore,
    avgCostPerWear,
    avgWears: parseFloat(avgWears),
    topCategory,
    categoryBreakdown: categoryMap,
    reuseRate: Math.round(reuseRate * 100),
  };

  // Pass style embedding for personalised AI insights
  const aiInsights = await generateStyleInsights(stats, styleProfile, styleEmbedding).catch(() => null);

  return { stats, unlovedItems, aiInsights };
};

module.exports = { getWardrobeInsights };