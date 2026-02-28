/**
 * modaic/backend/src/services/gemini.service.js
 * Intelligent AI — style embedding, outfit memory (RAG), weather context
 * Uses FREE Gemini 1.5 Flash
 */

const { getModel } = require('../config/gemini');
const logger = require('../config/logger');

// ── Luna's persona prompt ─────────────────────────────────────
const LUNA_PERSONA = `You are Luna, a warm, knowledgeable, and fun AI fashion stylist for the app Modaic.
You give personalized outfit advice in a friendly, encouraging tone — like a best friend who happens to be a professional stylist.
Be concise but helpful (2-5 sentences unless detailed advice is needed).
Use light emoji occasionally 🌸✨👗.
Focus on practical, wearable combinations. Consider occasion, season, weather, and personal style.
Never be judgmental. Always be uplifting and constructive.
When you know the user's wardrobe items, reference them specifically by name.`;

/**
 * Build a rich style context string from user's style embedding
 * This is what makes the AI "learn" from interactions
 */
const buildStyleContext = (styleProfile = {}, styleEmbedding = {}) => {
  const lines = [];

  if (styleProfile.primaryStyle) {
    lines.push(`Primary style: ${styleProfile.primaryStyle}`);
  }
  if (styleProfile.colorPalette?.length) {
    lines.push(`Favourite colours: ${styleProfile.colorPalette.join(', ')}`);
  }
  if (styleProfile.preferredOccasions?.length) {
    lines.push(`Dresses for: ${styleProfile.preferredOccasions.join(', ')}`);
  }

  // Inject learned preferences from style embedding
  if (styleEmbedding.categories && styleEmbedding.categories.size > 0) {
    const topCats = [...styleEmbedding.categories.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    if (topCats.length) lines.push(`Most loved clothing types: ${topCats.join(', ')}`);
  }
  if (styleEmbedding.colors && styleEmbedding.colors.size > 0) {
    const topColors = [...styleEmbedding.colors.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    if (topColors.length) lines.push(`Most loved colors (from behaviour): ${topColors.join(', ')}`);
  }
  if (styleEmbedding.occasions && styleEmbedding.occasions.size > 0) {
    const topOcc = [...styleEmbedding.occasions.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
    if (topOcc.length) lines.push(`Most styled for: ${topOcc.join(', ')}`);
  }

  return lines.length ? `\nUser Style Profile:\n${lines.map(l => `- ${l}`).join('\n')}` : '';
};

/**
 * Build outfit memory context (RAG — Retrieval Augmented Generation)
 * Injects last 10 outfits so Luna "remembers" what the user wore
 */
const buildMemoryContext = (outfitMemory = []) => {
  if (!outfitMemory.length) return '';
  const memories = outfitMemory.slice(0, 5).map(m => {
    const rating = m.rating ? ` (rated ${m.rating}/5 ⭐)` : '';
    const ago = m.createdAt
      ? `${Math.floor((Date.now() - new Date(m.createdAt)) / 86400000)} days ago`
      : 'recently';
    return `- "${m.outfitName}" for ${m.occasion || 'casual'}${rating} — ${ago}`;
  }).join('\n');
  return `\nRecent Outfit History (use this to give personalised advice):\n${memories}`;
};

/**
 * Chat with Luna — now with style embedding + outfit memory context
 */
const chatWithStylist = async (conversationHistory, userMessage, wardrobeItems = [], user = {}) => {
  const model = getModel();
  if (!model) {
    return "Hi! I'm Luna, your AI stylist 🌸 I'm currently unavailable but I'll be back soon!";
  }

  try {
    // Build wardrobe context
    const wardrobeContext = wardrobeItems.length > 0
      ? `\nWardrobe (${wardrobeItems.length} items): ${wardrobeItems.slice(0, 15).map(i => `${i.name} (${i.category})`).join(', ')}.`
      : '\nWardrobe: empty — encourage user to add items.';

    // Build style context from embedding (learned preferences)
    const styleContext = buildStyleContext(user.styleProfile, user.styleEmbedding);

    // Build memory context (RAG)
    const memoryContext = buildMemoryContext(user.outfitMemory);

    // Combine everything into system instruction
    const systemInstruction = LUNA_PERSONA + wardrobeContext + styleContext + memoryContext;

    // Build conversation history for Gemini (must alternate user/model)
    // Filter to valid alternating pairs only
    const validHistory = [];
    let lastRole = null;
    for (const msg of conversationHistory.slice(-8)) {
      const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
      if (geminiRole !== lastRole) {
        validHistory.push({ role: geminiRole, parts: [{ text: msg.content }] });
        lastRole = geminiRole;
      }
    }

    const chat = model.startChat({ history: validHistory, systemInstruction });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    logger.error(`Gemini chat error: ${err.message}`);
    // Fallback: try without history
    try {
      const fallbackModel = getModel();
      const prompt = `${LUNA_PERSONA}\nUser asks: ${userMessage}\nRespond helpfully as Luna.`;
      const result = await fallbackModel.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      logger.error(`Gemini fallback error: ${e.message}`);
      return "I'm having a moment! ✨ Please try again in a few seconds.";
    }
  }
};

/**
 * Generate outfit suggestions with style embedding + weather context
 */
const generateOutfitSuggestions = async (items, context = {}, styleProfile = {}, styleEmbedding = {}, outfitMemory = []) => {
  const model = getModel();
  if (!model) return getMockOutfitSuggestion(context);

  try {
    const itemList = items.map(i =>
      `- ${i.name} (${i.category}, colors: ${i.colors?.join(', ') || 'unknown'}${i.occasions?.length ? ', for: ' + i.occasions.join('/') : ''})`
    ).join('\n');

    const styleContext = buildStyleContext(styleProfile, styleEmbedding);
    const memoryContext = buildMemoryContext(outfitMemory);
    const weatherNote = context.weather ? `Current weather: ${context.weather}` : '';

    const prompt = `${LUNA_PERSONA}
${styleContext}
${memoryContext}

Wardrobe items available:
${itemList}

Request:
- Occasion: ${context.occasion || 'casual day'}
- ${weatherNote || `Season: ${context.season || 'any'}`}
- Mood/vibe: ${context.mood || 'feeling good'}

Suggest 3 outfit combinations using ONLY the listed items.
For each outfit return ONLY valid JSON — no markdown, no explanation outside JSON.

Return format:
[
  {
    "name": "Outfit Name",
    "items": ["exact item name from list"],
    "tip": "one styling tip",
    "accessory": "one accessory suggestion",
    "whyItWorks": "one sentence explaining why this suits this user specifically"
  }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getMockOutfitSuggestion(context);
  } catch (err) {
    logger.error(`Gemini outfit generation error: ${err.message}`);
    return getMockOutfitSuggestion(context);
  }
};

/**
 * Generate style insights — uses embedding for personalisation
 */
const generateStyleInsights = async (stats, styleProfile, styleEmbedding = {}) => {
  const model = getModel();
  if (!model) return 'Keep experimenting with your wardrobe! Every outfit is a new story. 🌸';

  try {
    const styleContext = buildStyleContext(styleProfile, styleEmbedding);

    const prompt = `${LUNA_PERSONA}
${styleContext}

Wardrobe stats:
- Total items: ${stats.totalItems}
- Most worn category: ${stats.topCategory || 'tops'}
- Sustainability score: ${stats.sustainabilityScore || 70}%
- Average wears per item: ${stats.avgWears || 1}

Give 2 specific, actionable wardrobe tips based on this user's actual style data. 
Reference their preferences if known. Be encouraging and specific. Keep it to 3-4 sentences total.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    logger.error(`Gemini insights error: ${err.message}`);
    return "You're doing amazing with your wardrobe! Keep mixing and matching 🌸";
  }
};

/**
 * Analyze a clothing item — generates smart tags
 */
const analyzeClothingItem = async (itemName, category) => {
  const model = getModel();
  if (!model) return getMockItemAnalysis();

  try {
    const prompt = `You are a fashion AI. Analyze this clothing item and return JSON metadata.

Item: "${itemName}" (category: ${category})

Return ONLY valid JSON, no markdown:
{
  "subcategory": "specific type",
  "occasions": ["casual","work","formal","date","sport","beach","party"],
  "seasons": ["spring","summer","autumn","winter","all"],
  "aiTags": ["3-5 style keywords"],
  "aiNotes": "one sentence styling tip"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getMockItemAnalysis();
  } catch (err) {
    logger.error(`Gemini item analysis error: ${err.message}`);
    return getMockItemAnalysis();
  }
};

// ── Fallbacks ─────────────────────────────────────────────────
const getMockOutfitSuggestion = (context) => ([{
  name: `${context.occasion || 'Casual'} Chic`,
  items: ['Your favourite top', 'Versatile bottoms'],
  tip: 'Tuck in for a polished silhouette',
  accessory: 'Add a delicate necklace ✨',
  whyItWorks: 'A timeless combination that works for any style.',
}]);

const getMockItemAnalysis = () => ({
  subcategory: 'blouse',
  occasions: ['casual', 'work'],
  seasons: ['spring', 'summer'],
  aiTags: ['feminine', 'versatile', 'classic'],
  aiNotes: 'Pairs beautifully with high-waisted bottoms',
});

module.exports = {
  chatWithStylist,
  generateOutfitSuggestions,
  generateStyleInsights,
  analyzeClothingItem,
};