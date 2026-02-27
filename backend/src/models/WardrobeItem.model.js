/**
 * modaic/backend/src/models/WardrobeItem.model.js
 * Clothing item schema with AI-generated metadata
 */

const mongoose = require('mongoose');

const WardrobeItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Core item info
  name:     { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'activewear', 'swimwear', 'lingerie'] },
  subcategory: { type: String }, // e.g. "blouse", "jeans", "sneakers"

  // Appearance
  colors:   [{ type: String }], // primary colors as hex or name
  pattern:  { type: String, enum: ['solid', 'stripes', 'floral', 'plaid', 'animal', 'geometric', 'abstract', 'other'] },
  fabric:   { type: String }, // cotton, silk, etc.
  brand:    { type: String, trim: true },
  size:     { type: String },

  // Image
  imageUrl:    { type: String, required: true },
  imagePublicId: { type: String }, // Cloudinary public ID for deletion
  thumbnailUrl: { type: String },

  // Occasion & Season tags
  occasions: [{ type: String, enum: ['casual', 'work', 'formal', 'date', 'sport', 'beach', 'party', 'travel'] }],
  seasons:   [{ type: String, enum: ['spring', 'summer', 'autumn', 'winter', 'all'] }],

  // AI-generated style metadata
  aiTags:   [{ type: String }],
  aiNotes:  { type: String }, // e.g. "Pairs well with high-waisted bottoms"

  // Usage tracking for insights
  wearCount:  { type: Number, default: 0 },
  lastWornAt: { type: Date },
  purchasedAt: { type: Date },
  purchasePrice: { type: Number },

  isFavorite: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true }, // soft delete
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// ── Indexes for query performance ─────────────────────────────
WardrobeItemSchema.index({ userId: 1, category: 1 });
WardrobeItemSchema.index({ userId: 1, isActive: 1 });
WardrobeItemSchema.index({ userId: 1, isFavorite: 1 });

// ── Virtual: cost per wear ────────────────────────────────────
WardrobeItemSchema.virtual('costPerWear').get(function () {
  if (!this.purchasePrice || this.wearCount === 0) return null;
  return Math.round(this.purchasePrice / this.wearCount);
});

module.exports = mongoose.model('WardrobeItem', WardrobeItemSchema);
