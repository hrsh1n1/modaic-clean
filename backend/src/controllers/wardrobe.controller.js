/**
 * modaic/backend/src/controllers/wardrobe.controller.js
 */

const wardrobeService = require('../services/wardrobe.service');
const { analyzeClothingItem } = require('../services/gemini.service');
const { createSuccess, createPaginated } = require('../utils/apiResponse');

const addItem = async (req, res, next) => {
  try {
    let itemData = { ...req.body };

    // Parse JSON fields sent as strings in multipart form
    ['colors', 'occasions', 'seasons', 'aiTags'].forEach(field => {
      if (typeof itemData[field] === 'string') {
        try { itemData[field] = JSON.parse(itemData[field]); } catch {}
      }
    });

    // AI auto-analyze if image uploaded and no category provided
    if (req.file && !itemData.category) {
      const analysis = await analyzeClothingItem(req.file.path);
      itemData = { ...analysis, ...itemData };
    }

    const item = await wardrobeService.addItem(req.user._id, itemData, req.file);
    res.status(201).json(createSuccess(item, 'Item added to your wardrobe! 👗'));
  } catch (err) {
    next(err);
  }
};

const getItems = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await wardrobeService.getUserItems(
      req.user._id,
      req.query
    );
    res.status(200).json(createPaginated(items, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getItem = async (req, res, next) => {
  try {
    const WardrobeItem = require('../models/WardrobeItem.model');
    const item = await WardrobeItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json(createSuccess(item));
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await wardrobeService.updateItem(req.user._id, req.params.id, req.body);
    res.status(200).json(createSuccess(item, 'Item updated ✨'));
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const result = await wardrobeService.deleteItem(req.user._id, req.params.id);
    res.status(200).json(createSuccess(null, result.message));
  } catch (err) {
    next(err);
  }
};

const recordWear = async (req, res, next) => {
  try {
    const item = await wardrobeService.recordWear(req.user._id, req.params.id);
    res.status(200).json(createSuccess(item, 'Wear recorded! 🌸'));
  } catch (err) {
    next(err);
  }
};

module.exports = { addItem, getItems, getItem, updateItem, deleteItem, recordWear };
