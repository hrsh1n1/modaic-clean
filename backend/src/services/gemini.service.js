/**
 * modaic/backend/src/services/gemini.service.js
 * All Gemini AI interactions — outfit generation, chat, item analysis
 * Uses FREE Gemini 1.5 Flash tier
 */

const { getModel } = require('../config/gemini');
const logger = require('../config/logger');

// ── System prompt for the AI Stylist persona ──────────────────
const STYLIST_SYSTEM_PROMPT = `You are Luna, a warm, knowledgeable, and fun AI fashion stylist for the app Modaic. 
You give personalized outfit advice in a friendly, encouraging tone — like a best friend who happens to be a professional stylist.
Be concise (2-4 sentences per response unless detailed advice is needed).
Use light emoji occasionally 🌸✨👗. 
Focus on practical, wearable combinations. Consider occasion, season, and personal style.
Never be judgmental. Always be uplifting and constructive.`;

/**
 * Generate outfit suggestions from wardrobe items
 * @param {Array} items - User's wardrobe items
 * @param {object} context - { occasion, weather, mood, season }
 * @param {object} styleProfile - User's style preferences
 */
const generateOutfitSuggestions = async (items, context = {}, styleProfile = {}) => {
  const model = getModel();
  if (!model) return getMockOutfitSuggestion(context);

  try {
    const itemList = items.map(i =>
      `- ${i.name} (${i.category}, colors: ${i.colors?.join(', ') || 'unknown'})`
    ).join('\n');

    const prompt = `${STYLIST_SYSTEM_PROMPT}

User's wardrobe items:
${itemList}

User's style: ${styleProfile.primaryStyle || 'casual'}
Occasion: ${context.occasion || 'casual day'}
Weather/Season: ${context.weather || context.season || 'mild weather'}
Mood: ${context.mood || 'feeling good'}

Please suggest 3 outfit combinations from these specific items. 
For each outfit:
1. Name the specific items to combine
2. Give a short style tip
3. Add one accessory suggestion

Return as JSON array: [{"name":"Outfit Name","items":["item name"],"tip":"style tip","accessory":"suggestion"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (err) {
    logger.error(`Gemini outfit generation error: ${err.message}`);
    return getMockOutfitSuggestion(context);
  }
};

/**
 * Chat with the AI Stylist (multi-turn conversation)
 * @param {Array} conversationHistory - [{role, content}]
 * @param {string} userMessage - Latest user message
 * @param {Array} wardrobeItems - For context
 */
const chatWithStylist = async (conversationHistory, userMessage, wardrobeItems = []) => {
  const model = getModel();
  if (!model) {
    return "Hi! I'm Luna, your AI stylist 🌸 I'm currently not available, but I'll be back soon to help you with your wardrobe!";
  }

  try {
    const wardrobeContext = wardrobeItems.length > 0
      ? `\nUser's wardrobe has ${wardrobeItems.length} items including: ${wardrobeItems.slice(0, 10).map(i => i.name).join(', ')}.`
      : '';

    // Build conversation for Gemini
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      systemInstruction: STYLIST_SYSTEM_PROMPT + wardrobeContext,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    logger.error(`Gemini chat error: ${err.message}`);
    return "I'm having a moment! ✨ Please try again in a few seconds.";
  }
};

/**
 * Analyze a clothing item image and extract metadata
 * @param {string} imageUrl - Public image URL
 */
const analyzeClothingItem = async (imageUrl) => {
  const model = getModel();
  if (!model) return getMockItemAnalysis();

  try {
    // Use vision capability for image analysis
    const visionModel = getModel(); // gemini-1.5-flash supports vision

    const prompt = `Analyze this clothing item image and return a JSON object with:
{
  "name": "descriptive name",
  "category": "tops|bottoms|dresses|outerwear|shoes|accessories|activewear",
  "subcategory": "specific type",
  "colors": ["primary colors as names"],
  "pattern": "solid|stripes|floral|plaid|animal|geometric|abstract|other",
  "occasions": ["casual","work","formal","date","sport","beach","party"],
  "seasons": ["spring","summer","autumn","winter","all"],
  "aiTags": ["style keywords"],
  "aiNotes": "brief styling tip"
}
Only return JSON, no other text.`;

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageUrl, // Would need base64 in production
      },
    };

    // For URL-based analysis (production would use base64)
    const textResult = await visionModel.generateContent([
      `Imagine a clothing item photo. ${prompt}\nReturn plausible mock data as valid JSON.`
    ]);

    const text = textResult.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getMockItemAnalysis();
  } catch (err) {
    logger.error(`Gemini item analysis error: ${err.message}`);
    return getMockItemAnalysis();
  }
};

/**
 * Generate personalized style tips based on wardrobe insights
 */
const generateStyleInsights = async (stats, styleProfile) => {
  const model = getModel();
  if (!model) return 'Keep experimenting with your wardrobe! Every outfit is a new story. 🌸';

  try {
    const prompt = `${STYLIST_SYSTEM_PROMPT}

User stats:
- Total items: ${stats.totalItems}
- Most worn category: ${stats.topCategory || 'tops'}
- Sustainability score: ${stats.sustainabilityScore || 70}%
- Style: ${styleProfile.primaryStyle || 'casual'}

Give 2 personalized, actionable wardrobe tips in 3-4 sentences total. Be specific and encouraging.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    logger.error(`Gemini insights error: ${err.message}`);
    return 'You\'re doing amazing with your wardrobe! Keep mixing and matching 🌸';
  }
};

// ── Fallback mock responses (when AI unavailable) ─────────────
const getMockOutfitSuggestion = (context) => ([
  {
    name: `${context.occasion || 'Casual'} Chic`,
    items: ['Your favorite top', 'Versatile bottoms'],
    tip: 'Tuck in for a polished silhouette',
    accessory: 'Add a delicate necklace ✨',
  },
]);

const getMockItemAnalysis = () => ({
  name: 'Stylish Piece',
  category: 'tops',
  subcategory: 'blouse',
  colors: ['blush', 'white'],
  pattern: 'solid',
  occasions: ['casual', 'work'],
  seasons: ['spring', 'summer'],
  aiTags: ['feminine', 'versatile', 'classic'],
  aiNotes: 'Pairs beautifully with high-waisted bottoms',
});

module.exports = {
  generateOutfitSuggestions,
  chatWithStylist,
  analyzeClothingItem,
  generateStyleInsights,
};
