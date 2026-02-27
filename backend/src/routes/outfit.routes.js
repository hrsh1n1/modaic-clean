/**
 * modaic/backend/src/routes/outfit.routes.js
 */

const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const Outfit = require('../models/Outfit.model');
const User = require('../models/User.model');
const { createSuccess, createPaginated } = require('../utils/apiResponse');

router.use(protect);

// GET all outfits
router.get('/', async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip  = (page - 1) * limit;
    const query = { userId: req.user._id };
    if (req.query.favorite) query.isFavorite = true;
    if (req.query.aiGenerated) query.aiGenerated = true;
    const [outfits, total] = await Promise.all([
      Outfit.find(query).populate('items.itemId', 'name imageUrl category').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Outfit.countDocuments(query),
    ]);
    res.json(createPaginated(outfits, total, page, limit));
  } catch (err) { next(err); }
});

// POST save outfit
router.post('/', async (req, res, next) => {
  try {
    const outfit = await Outfit.create({ userId: req.user._id, ...req.body });
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.outfitsCreated': 1 } });
    res.status(201).json(createSuccess(outfit, 'Outfit saved! 💕'));
  } catch (err) { next(err); }
});

// PATCH toggle favorite
router.patch('/:id/favorite', async (req, res, next) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!outfit) return res.status(404).json({ success: false, message: 'Not found' });
    outfit.isFavorite = !outfit.isFavorite;
    await outfit.save();
    res.json(createSuccess(outfit));
  } catch (err) { next(err); }
});

// DELETE outfit
router.delete('/:id', async (req, res, next) => {
  try {
    await Outfit.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json(createSuccess(null, 'Outfit deleted'));
  } catch (err) { next(err); }
});

module.exports = router;
