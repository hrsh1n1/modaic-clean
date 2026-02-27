/**
 * modaic/backend/src/models/Outfit.model.js
 * Saved outfit combinations
 */

const mongoose = require('mongoose');

const OutfitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  name:        { type: String, trim: true, default: 'My Outfit' },
  description: { type: String },

  // References to wardrobe items used
  items: [{
    itemId:   { type: mongoose.Schema.Types.ObjectId, ref: 'WardrobeItem', required: true },
    position: { type: String, enum: ['top', 'bottom', 'outer', 'shoes', 'accessory', 'full'] },
  }],

  // Context
  occasion: { type: String },
  season:   { type: String },
  weather:  { type: String },

  // AI-generated
  aiGenerated: { type: Boolean, default: false },
  aiPrompt:    { type: String }, // original user prompt
  aiStyleNotes: { type: String }, // stylist explanation

  // Engagement
  isFavorite: { type: Boolean, default: false },
  wearCount:  { type: Number, default: 0 },
  lastWornAt: { type: Date },

  // Social (future feature)
  isPublic: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

OutfitSchema.index({ userId: 1, aiGenerated: 1 });
OutfitSchema.index({ userId: 1, isFavorite: 1 });

module.exports = mongoose.model('Outfit', OutfitSchema);
