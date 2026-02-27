/**
 * modaic/backend/src/models/User.model.js
 * User schema — authentication + style profile
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StyleProfileSchema = new mongoose.Schema({
  primaryStyle: { type: String, enum: ['romantic', 'casual', 'minimalist', 'bold', 'vintage', 'streetwear', 'preppy', 'bohemian'], default: 'casual' },
  colorPalette: [{ type: String }], // hex codes
  preferredOccasions: [{ type: String }], // work, casual, formal, sport
  avoidColors: [{ type: String }],
  bodyType: { type: String },
  quizCompleted: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar:   { type: String, default: '' },
  
  styleProfile: { type: StyleProfileSchema, default: () => ({}) },
  
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  
  stats: {
    totalItems:     { type: Number, default: 0 },
    outfitsCreated: { type: Number, default: 0 },
    aiChats:        { type: Number, default: 0 },
  },

  isActive:    { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ── Indexes ───────────────────────────────────────────────────
UserSchema.index({ email: 1 });

// ── Pre-save: hash password ───────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Virtual: wardrobe utilization ────────────────────────────
UserSchema.virtual('wardrobeItems', {
  ref: 'WardrobeItem',
  localField: '_id',
  foreignField: 'userId',
  count: true,
});

module.exports = mongoose.model('User', UserSchema);
