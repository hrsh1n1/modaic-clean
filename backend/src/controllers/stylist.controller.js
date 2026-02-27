/**
 * modaic/backend/src/controllers/stylist.controller.js
 * AI stylist chat controller — Gemini powered
 */

const rateLimit = require('express-rate-limit');
const ChatSession = require('../models/ChatSession.model');
const WardrobeItem = require('../models/WardrobeItem.model');
const { chatWithStylist, generateOutfitSuggestions } = require('../services/gemini.service');
const { createSuccess, createPaginated } = require('../utils/apiResponse');

/** Rate limit specifically for AI endpoints */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 20,
  message: { success: false, message: 'Too many AI requests. Please slow down! ✨' },
});

const chat = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Load or create session
    let session = sessionId
      ? await ChatSession.findOne({ _id: sessionId, userId: req.user._id })
      : null;

    if (!session) {
      session = await ChatSession.create({
        userId: req.user._id,
        title: message.slice(0, 40),
        messages: [],
      });
    }

    // Get user's wardrobe for context
    const wardrobeItems = await WardrobeItem.find({ userId: req.user._id, isActive: true })
      .select('name category colors').limit(30);

    // Build history (last 10 messages for context window)
    const history = session.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response
    const aiResponse = await chatWithStylist(history, message, wardrobeItems);

    // Save messages
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: aiResponse });
    session.lastMessageAt = new Date();
    await session.save();

    // Increment stat
    req.user.stats.aiChats += 1;
    await req.user.save({ validateBeforeSave: false });

    res.status(200).json(createSuccess({
      response: aiResponse,
      sessionId: session._id,
    }));
  } catch (err) {
    next(err);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      ChatSession.find({ userId: req.user._id, isActive: true })
        .select('title lastMessageAt messages')
        .sort({ lastMessageAt: -1 })
        .skip(skip).limit(limit),
      ChatSession.countDocuments({ userId: req.user._id, isActive: true }),
    ]);

    res.status(200).json(createPaginated(sessions, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json(createSuccess(session));
  } catch (err) {
    next(err);
  }
};

const generateOutfits = async (req, res, next) => {
  try {
    const { occasion, weather, season, mood, itemIds } = req.body;

    const query = { userId: req.user._id, isActive: true };
    if (itemIds?.length) query._id = { $in: itemIds };

    const items = await WardrobeItem.find(query).limit(30);
    if (items.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Add at least 2 items to your wardrobe to generate outfits! 👗',
      });
    }

    const outfits = await generateOutfitSuggestions(
      items,
      { occasion, weather, season, mood },
      req.user.styleProfile
    );

    res.status(200).json(createSuccess({ outfits, itemCount: items.length }));
  } catch (err) {
    next(err);
  }
};

module.exports = { chat, getSessions, getSession, generateOutfits, aiLimiter };
