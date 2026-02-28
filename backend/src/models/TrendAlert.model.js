/**
 * modaic/backend/src/models/TrendAlert.model.js
 * Stores pre-generated weekly trend alerts per user
 */

const mongoose = require('mongoose');

const TrendAlertSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  title:       { type: String, required: true },
  summary:     { type: String, required: true },
  tips:        [{ type: String }],
  suggestion:  { type: String },
  badge:       { type: String, default: '✨' },
  generatedAt: { type: Date, default: Date.now },
  expiresAt:   { type: Date, required: true },
}, { timestamps: true });

TrendAlertSchema.index({ userId: 1 });
TrendAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete expired

module.exports = mongoose.model('TrendAlert', TrendAlertSchema);