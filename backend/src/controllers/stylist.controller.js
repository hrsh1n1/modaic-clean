/**
 * modaic/backend/src/controllers/stylist.controller.js
 * AI stylist with style embedding, outfit memory (RAG), weather context
 */

const rateLimit = require('express-rate-limit');
const ChatSession = require('../models/ChatSession.model');
const WardrobeItem = require('../models/WardrobeItem.model');
const User = require('../models/User.model');
const { chatWithStylist, generateOutfitSuggestions } = require('../services/gemini.service');
const { getWeatherForLocation, geocodeCity } = require('../services/weather.service');
const { createSuccess, createPaginated } = require('../utils/apiResponse');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 20,
  message: { success: false, message: 'Too many AI requests. Please slow down! ✨' },
});

const chat = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Load full user with outfit memory and style embedding
    const fullUser = await User.findById(req.user._id).select('+outfitMemory');

    // Load/create session
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

    // Get wardrobe
    const wardrobeItems = await WardrobeItem.find({ userId: req.user._id, isActive: true })
      .select('name category colors occasions wearCount').limit(30);

    // Build history (valid alternating pairs only)
    const history = session.messages.slice(-8).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response with full user context
    const aiResponse = await chatWithStylist(
      history,
      message,
      wardrobeItems,
      {
        styleProfile:   fullUser.styleProfile,
        styleEmbedding: fullUser.styleEmbedding,
        outfitMemory:   fullUser.outfitMemory,
      }
    );

    // Save messages
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: aiResponse });
    session.lastMessageAt = new Date();
    await session.save();

    // Update stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.aiChats': 1 } });

    res.status(200).json(createSuccess({ response: aiResponse, sessionId: session._id }));
  } catch (err) {
    next(err);
  }
};

const generateOutfits = async (req, res, next) => {
  try {
    const { occasion, season, mood, itemIds, city } = req.body;

    const query = { userId: req.user._id, isActive: true };
    if (itemIds?.length) query._id = { $in: itemIds };

    const [items, fullUser] = await Promise.all([
      WardrobeItem.find(query).limit(30),
      User.findById(req.user._id).select('+outfitMemory'),
    ]);

    if (items.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Add at least 2 items to your wardrobe to generate outfits! 👗',
      });
    }

    // Fetch real weather if city provided or user has saved location
    let weatherData = null;
    const targetCity = city || fullUser.location?.city;
    if (targetCity) {
      const geo = await geocodeCity(targetCity);
      if (geo) {
        weatherData = await getWeatherForLocation(geo.lat, geo.lon);
        // Save location for future use
        if (city && !fullUser.location?.city) {
          await User.findByIdAndUpdate(req.user._id, {
            'location.city': geo.name,
            'location.lat':  geo.lat,
            'location.lon':  geo.lon,
          });
        }
      }
    }

    const outfits = await generateOutfitSuggestions(
      items,
      {
        occasion,
        season,
        mood,
        weather: weatherData?.summary || null,
      },
      fullUser.styleProfile,
      fullUser.styleEmbedding,
      fullUser.outfitMemory,
    );

    // Save generated outfits to memory
    if (outfits.length) {
      const memory = {
        outfitName: outfits[0].name,
        items: outfits[0].items || [],
        occasion: occasion || 'casual',
        createdAt: new Date(),
      };
      fullUser.addOutfitMemory(memory);
      await fullUser.save({ validateBeforeSave: false });
    }

    res.status(200).json(createSuccess({
      outfits,
      weather: weatherData,
      itemCount: items.length,
    }));
  } catch (err) {
    next(err);
  }
};

// Update style embedding when user interacts with outfit
const updateStyleEmbedding = async (req, res, next) => {
  try {
    const { action, outfitData } = req.body;
    // action: 'love' | 'wear' | 'skip'
    if (!['love', 'wear', 'skip'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const user = await User.findById(req.user._id);
    user.updateStyleEmbedding(outfitData, action);
    await user.save({ validateBeforeSave: false });

    res.status(200).json(createSuccess(null, `Style preferences updated (${action}) ✨`));
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
        .select('title lastMessageAt messages').sort({ lastMessageAt: -1 }).skip(skip).limit(limit),
      ChatSession.countDocuments({ userId: req.user._id, isActive: true }),
    ]);
    res.status(200).json(createPaginated(sessions, total, page, limit));
  } catch (err) { next(err); }
};

const getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json(createSuccess(session));
  } catch (err) { next(err); }
};

module.exports = { chat, getSessions, getSession, generateOutfits, updateStyleEmbedding, aiLimiter };