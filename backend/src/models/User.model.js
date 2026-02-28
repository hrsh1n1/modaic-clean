/**
 * modaic/backend/src/models/User.model.js
 * User schema with style embedding + outfit memory for intelligent AI
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StyleProfileSchema = new mongoose.Schema({
  primaryStyle: { type: String, enum: ['romantic', 'casual', 'minimalist', 'bold', 'vintage', 'streetwear', 'preppy', 'bohemian'], default: 'casual' },
  colorPalette: [{ type: String }],
  preferredOccasions: [{ type: String }],
  avoidColors: [{ type: String }],
  bodyType: { type: String },
  quizCompleted: { type: Boolean, default: false },
}, { _id: false });

// Style Embedding — weighted vector built from user interactions
// loved=+2, worn=+1, skipped=-1
const StyleEmbeddingSchema = new mongoose.Schema({
  categories: { type: Map, of: Number, default: {} },
  colors:     { type: Map, of: Number, default: {} },
  occasions:  { type: Map, of: Number, default: {} },
  lastUpdated:{ type: Date, default: Date.now },
}, { _id: false });

// Outfit Memory — last 10 outfits for RAG context in AI chat
const OutfitMemorySchema = new mongoose.Schema({
  outfitName: { type: String },
  items:      [{ type: String }],
  occasion:   { type: String },
  rating:     { type: Number, min: 1, max: 5 },
  createdAt:  { type: Date, default: Date.now },
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar:   { type: String, default: '' },

  // For weather feature
  location: {
    city: { type: String, default: '' },
    lat:  { type: Number },
    lon:  { type: Number },
  },

  styleProfile:   { type: StyleProfileSchema,   default: () => ({}) },
  styleEmbedding: { type: StyleEmbeddingSchema, default: () => ({}) },
  outfitMemory:   { type: [OutfitMemorySchema],  default: [], select: false },

  plan: { type: String, enum: ['free', 'pro'], default: 'free' },

  stats: {
    totalItems:     { type: Number, default: 0 },
    outfitsCreated: { type: Number, default: 0 },
    aiChats:        { type: Number, default: 0 },
  },

  isActive:    { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Pre-save: hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Update style embedding from outfit interactions
UserSchema.methods.updateStyleEmbedding = function (outfitData, action) {
  const weight = action === 'love' ? 2 : action === 'wear' ? 1 : -1;
  const emb = this.styleEmbedding;
  outfitData.categories?.forEach(cat => {
    emb.categories.set(cat, Math.max(0, (emb.categories.get(cat) || 0) + weight));
  });
  outfitData.colors?.forEach(color => {
    emb.colors.set(color, Math.max(0, (emb.colors.get(color) || 0) + weight));
  });
  if (outfitData.occasion) {
    emb.occasions.set(outfitData.occasion, Math.max(0, (emb.occasions.get(outfitData.occasion) || 0) + weight));
  }
  emb.lastUpdated = new Date();
  this.markModified('styleEmbedding');
};

// Add to outfit memory (keep max 10)
UserSchema.methods.addOutfitMemory = function (memory) {
  this.outfitMemory.unshift(memory);
  if (this.outfitMemory.length > 10) this.outfitMemory = this.outfitMemory.slice(0, 10);
  this.markModified('outfitMemory');
};

module.exports = mongoose.model('User', UserSchema);