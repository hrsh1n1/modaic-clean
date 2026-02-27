/**
 * modaic/backend/src/services/wardrobe.service.js
 * Wardrobe CRUD and query logic
 */

const WardrobeItem = require('../models/WardrobeItem.model');
const User = require('../models/User.model');
const { deleteCloudinaryImage } = require('../middleware/upload.middleware');

const addItem = async (userId, itemData, imageFile) => {
  const item = await WardrobeItem.create({
    userId,
    ...itemData,
    imageUrl: imageFile?.path || itemData.imageUrl,
    imagePublicId: imageFile?.filename || undefined,
    thumbnailUrl: imageFile?.path || itemData.imageUrl,
  });

  await User.findByIdAndUpdate(userId, { $inc: { 'stats.totalItems': 1 } });
  return item;
};

const getUserItems = async (userId, filters = {}) => {
  const query = { userId, isActive: true };

  if (filters.category) query.category = filters.category;
  if (filters.occasion) query.occasions = { $in: [filters.occasion] };
  if (filters.season)   query.seasons   = { $in: [filters.season] };
  if (filters.search)   query.name      = { $regex: filters.search, $options: 'i' };
  if (filters.favorite) query.isFavorite = true;

  const page  = parseInt(filters.page)  || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip  = (page - 1) * limit;

  const [items, total] = await Promise.all([
    WardrobeItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    WardrobeItem.countDocuments(query),
  ]);

  return { items, total, page, limit };
};

const updateItem = async (userId, itemId, updates) => {
  const item = await WardrobeItem.findOneAndUpdate(
    { _id: itemId, userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!item) {
    const err = new Error('Item not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
};

const deleteItem = async (userId, itemId) => {
  const item = await WardrobeItem.findOne({ _id: itemId, userId });
  if (!item) {
    const err = new Error('Item not found');
    err.statusCode = 404;
    throw err;
  }

  // Delete from Cloudinary
  if (item.imagePublicId) {
    await deleteCloudinaryImage(item.imagePublicId);
  }

  // Soft delete
  item.isActive = false;
  await item.save();

  await User.findByIdAndUpdate(userId, { $inc: { 'stats.totalItems': -1 } });
  return { message: 'Item removed from wardrobe' };
};

const recordWear = async (userId, itemId) => {
  return WardrobeItem.findOneAndUpdate(
    { _id: itemId, userId },
    { $inc: { wearCount: 1 }, lastWornAt: new Date() },
    { new: true }
  );
};

module.exports = { addItem, getUserItems, updateItem, deleteItem, recordWear };
