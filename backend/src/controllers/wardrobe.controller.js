/**
 * modaic/backend/src/controllers/wardrobe.controller.js
 * With AI vision recognition — auto-detects clothing from photos
 */

const wardrobeService = require('../services/wardrobe.service');
const { analyzeClothingImage } = require('../services/vision.service');
const { bustInsightsCache } = require('./insights.controller');
const { createSuccess, createPaginated } = require('../utils/apiResponse');
const logger = require('../config/logger');

/**
 * POST /api/v1/wardrobe
 * Add item — with AI vision auto-fill if no category provided
 */
const addItem = async (req, res, next) => {
  try {
    let itemData = { ...req.body };

    // Parse JSON fields sent as strings in multipart form
    ['colors', 'occasions', 'seasons', 'aiTags'].forEach(field => {
      if (typeof itemData[field] === 'string') {
        try { itemData[field] = JSON.parse(itemData[field]); } catch {}
      }
    });

    // AI vision auto-analyze if image uploaded
    // Only runs if user hasn't filled in details manually (no category set)
    if (req.file && req.file.path && !req.body.skipAI) {
      try {
        const imageUrl = req.file.path; // Cloudinary URL
        const analysis = await analyzeClothingImage(imageUrl);
        if (analysis) {
          // Merge AI results — user-provided data takes priority
          itemData = {
            ...analysis,         // AI fills everything
            ...itemData,         // User overrides anything they typed
            aiTags: analysis.aiTags || [],
            aiNotes: analysis.aiNotes || '',
          };
          logger.info(`Vision AI auto-filled: ${analysis.name} (${analysis.category})`);
        }
      } catch (err) {
        logger.warn(`Vision analysis failed, continuing without: ${err.message}`);
      }
    }

    const item = await wardrobeService.addItem(req.user._id, itemData, req.file);

    // Bust insights cache so stats update immediately
    bustInsightsCache(req.user._id);

    res.status(201).json(createSuccess(item, 'Item added to your wardrobe! 👗'));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/wardrobe/analyze-image
 * Preview AI analysis before adding item — used by frontend to pre-fill form
 */
const analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const imageUrl = req.file.path;
    const analysis = await analyzeClothingImage(imageUrl);

    if (!analysis) {
      return res.status(200).json({
        success: true,
        data: { analysis: null, imageUrl },
        message: 'Could not analyze image — please fill in details manually',
      });
    }

    res.status(200).json(createSuccess({ analysis, imageUrl }, 'AI analysis complete ✨'));
  } catch (err) {
    next(err);
  }
};

const getItems = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await wardrobeService.getUserItems(req.user._id, req.query);
    res.status(200).json(createPaginated(items, total, page, limit));
  } catch (err) { next(err); }
};

const getItem = async (req, res, next) => {
  try {
    const WardrobeItem = require('../models/WardrobeItem.model');
    const item = await WardrobeItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json(createSuccess(item));
  } catch (err) { next(err); }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await wardrobeService.updateItem(req.user._id, req.params.id, req.body);
    res.status(200).json(createSuccess(item, 'Item updated ✨'));
  } catch (err) { next(err); }
};

const deleteItem = async (req, res, next) => {
  try {
    const result = await wardrobeService.deleteItem(req.user._id, req.params.id);
    bustInsightsCache(req.user._id);
    res.status(200).json(createSuccess(null, result.message));
  } catch (err) { next(err); }
};

const recordWear = async (req, res, next) => {
  try {
    const item = await wardrobeService.recordWear(req.user._id, req.params.id);
    res.status(200).json(createSuccess(item, 'Wear recorded! 🌸'));
  } catch (err) { next(err); }
};

module.exports = { addItem, analyzeImage, getItems, getItem, updateItem, deleteItem, recordWear };