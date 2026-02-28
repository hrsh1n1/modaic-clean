/**
 * modaic/backend/src/services/gemini.service.js
 * Fixed for @google/generative-ai@0.1.3 — no systemInstruction support
 * Works by injecting context directly into the first user message
 */

const { getModel } = require('../config/gemini');
const logger = require('../config/logger');

const LUNA_PERSONA = `You are Luna, a warm and fun AI fashion stylist for the app Modaic. 
Give personalized outfit advice in a friendly tone — like a best friend who is a professional stylist.
Be concise (2-4 sentences). Use light emoji 🌸✨👗. 
Focus on practical combinations. Consider occasion, season, and personal style.
Never be judgmental. Always be uplifting.`;

const buildStyleContext = (styleProfile = {}, styleEmbedding = {}) => {
  const lines = [];
  if (styleProfile?.primaryStyle) lines.push(`Style: ${styleProfile.primaryStyle}`);
  if (styleProfile?.colorPalette?.length) lines.push(`Fav colors: ${styleProfile.colorPalette.join(', ')}`);
  if (styleProfile?.preferredOccasions?.length) lines.push(`Dresses for: ${styleProfile.preferredOccasions.join(', ')}`);

  try {
    if (styleEmbedding?.categories) {
      const entries = styleEmbedding.categories instanceof Map
        ? [...styleEmbedding.categories.entries()]
        : Object.entries(styleEmbedding.categories || {});
      const top = entries.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
      if (top.length) lines.push(`Loves wearing: ${top.join(', ')}`);
    }
  } catch {}

  return lines.length ? `\nUser profile: ${lines.join(' | ')}` : '';
};

const buildMemoryContext = (outfitMemory = []) => {
  if (!outfitMemory?.length) return '';
  const memories = outfitMemory.slice(0, 3).map(m =>
    `"${m.outfitName}" for ${m.occasion || 'casual'}`
  ).join('; ');
  return `\nRecent outfits: ${memories}`;
};

/**
 * Simple generateContent call — works with all SDK versions
 * We build a single prompt with full context instead of using startChat
 */
const chatWithStylist = async (conversationHistory, userMessage, wardrobeItems = [], user = {}) => {
  const model = getModel();
  if (!model) {
    return "Hi! I'm Luna 🌸 I'm currently unavailable, please try again shortly!";
  }

  try {
    const wardrobeContext = wardrobeItems.length > 0
      ? `\nWardrobe (${wardrobeItems.length} items): ${wardrobeItems.slice(0, 12).map(i => `${i.name} (${i.category})`).join(', ')}.`
      : '\nWardrobe: empty.';

    const styleContext  = buildStyleContext(user.styleProfile, user.styleEmbedding);
    const memoryContext = buildMemoryContext(user.outfitMemory);

    // Build conversation context from history
    const historyContext = conversationHistory.slice(-6).map(m =>
      `${m.role === 'user' ? 'User' : 'Luna'}: ${m.content}`
    ).join('\n');

    // Single prompt with everything embedded — works with v0.1.3
    const fullPrompt = `${LUNA_PERSONA}${wardrobeContext}${styleContext}${memoryContext}

${historyContext ? `Previous conversation:\n${historyContext}\n` : ''}
User: ${userMessage}
Luna:`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    return text.trim();
  } catch (err) {
    logger.error(`Gemini chat error: ${err.message}`);
    // Try absolute minimal fallback
    try {
      const fallback = getModel();
      const result = await fallback.generateContent(
        `You are Luna, an AI fashion stylist. Answer this question helpfully: ${userMessage}`
      );
      return result.response.text().trim();
    } catch (e2) {
      logger.error(`Gemini fallback error: ${e2.message}`);
      return "I'm having a moment! ✨ Please try again in a few seconds.";
    }
  }
};

/**
 * Generate outfit suggestions
 */
const generateOutfitSuggestions = async (items, context = {}, styleProfile = {}, styleEmbedding = {}, outfitMemory = []) => {
  const model = getModel();
  if (!model) return getMockOutfitSuggestion(context);

  try {
    const itemList = items.map(i =>
      `- ${i.name} (${i.category}, colors: ${i.colors?.join(', ') || 'unknown'})`
    ).join('\n');

    const styleContext  = buildStyleContext(styleProfile, styleEmbedding);
    const memoryContext = buildMemoryContext(outfitMemory);
    const weatherNote   = context.weather ? `Current weather: ${context.weather}` : '';

    const prompt = `${LUNA_PERSONA}${styleContext}${memoryContext}

Wardrobe items:
${itemList}

Occasion: ${context.occasion || 'casual'}
${weatherNote || `Season: ${context.season || 'any'}`}
Mood: ${context.mood || 'feeling good'}

Suggest 3 outfit combinations from the listed items.
Return ONLY a JSON array, no markdown or explanation:
[{"name":"Outfit Name","items":["item name"],"tip":"styling tip","accessory":"suggestion","whyItWorks":"why this suits this user"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return getMockOutfitSuggestion(context);
  } catch (err) {
    logger.error(`Gemini outfit error: ${err.message}`);
    return getMockOutfitSuggestion(context);
  }
};

/**
 * Style insights
 */
const generateStyleInsights = async (stats, styleProfile, styleEmbedding = {}) => {
  const model = getModel();
  if (!model) return 'Keep experimenting with your wardrobe! 🌸';

  try {
    const styleContext = buildStyleContext(styleProfile, styleEmbedding);

    const prompt = `${LUNA_PERSONA}${styleContext}

Wardrobe: ${stats.totalItems} items, sustainability score ${stats.sustainabilityScore}%, avg ${stats.avgWears} wears/item, most worn: ${stats.topCategory || 'tops'}.

Give 2 specific actionable wardrobe tips for this user. 3-4 sentences. Be encouraging and personal.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    logger.error(`Gemini insights error: ${err.message}`);
    return "You're doing amazing! Keep mixing and matching 🌸";
  }
};

/**
 * Analyze clothing item
 */
const analyzeClothingItem = async (itemName, category) => {
  const model = getModel();
  if (!model) return getMockItemAnalysis();

  try {
    const prompt = `Fashion AI: analyze "${itemName}" (${category}). Return ONLY JSON, no markdown:
{"subcategory":"type","occasions":["casual","work"],"seasons":["spring"],"aiTags":["tag1","tag2"],"aiNotes":"styling tip"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getMockItemAnalysis();
  } catch (err) {
    logger.error(`Gemini analyze error: ${err.message}`);
    return getMockItemAnalysis();
  }
};

const getMockOutfitSuggestion = (context) => ([{
  name: `${context.occasion || 'Casual'} Chic`,
  items: ['Your favourite top', 'Versatile bottoms'],
  tip: 'Tuck in for a polished silhouette',
  accessory: 'Add a delicate necklace ✨',
  whyItWorks: 'A timeless combination that works for any style.',
}]);

const getMockItemAnalysis = () => ({
  subcategory: 'blouse', occasions: ['casual', 'work'],
  seasons: ['spring', 'summer'], aiTags: ['feminine', 'versatile'],
  aiNotes: 'Pairs beautifully with high-waisted bottoms',
});

module.exports = { chatWithStylist, generateOutfitSuggestions, generateStyleInsights, analyzeClothingItem };