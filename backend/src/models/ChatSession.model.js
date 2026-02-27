/**
 * modaic/backend/src/models/ChatSession.model.js
 * AI Stylist conversation history
 */

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  // If AI suggested outfits or items, store references
  suggestedOutfits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Outfit' }],
}, { _id: true });

const ChatSessionSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:     { type: String, default: 'Style Chat' },
  messages:  [MessageSchema],
  isActive:  { type: Boolean, default: true },
  lastMessageAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

ChatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
