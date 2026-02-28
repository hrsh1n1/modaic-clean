/**
 * modaic/backend/src/services/gemini.service.js
 * AI service using Groq — FREE, 14,400 req/day, ultra fast
 * Model: llama-3.3-70b-versatile
 */

const { getModel, getModelName } = require('../config/gemini');
const logger = require('../config/logger');

const LUNA_PERSONA = `You are Luna, a warm and fun AI fashion stylist for the app Modaic.
Give personalized outfit advice in a friendly tone — like a best friend who is a professional stylist.
Be concise (2-4 sentences). Use light emoji 🌸✨👗.
Focus on practical combinations. Consider occasion, season, weather, and personal style.
Never be judgmental. Always be uplifting and constructive.
When you know the user's wardrobe items, reference them specifically by name.`;

/**
 * Core Groq API call — single function used by all features
 */
const groqChat = async (messages) => {
  const client = getModel();
  if (!client) throw new Error('Groq client not initialized');

  const result = await client.chat.completions.create({
    model: getModelName(),
    messages,
    temperature: 0.8,
    max_tokens: 1024,
  });

  return result.choices[0].message.content.trim();
};

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
    if (styleEmbedding?.colors) {
      const entries = styleEmbedding.colors instanceof Map
        ? [...styleEmbedding.colors.entries()]
        : Object.entries(styleEmbedding.colors || {});
      const top = entries.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
      if (top.length) lines.push(`Loves colors: ${top.join(', ')}`);
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
 * Chat with Luna — multi-turn with wardrobe + style context
 */
const chatWithStylist = async (conversationHistory, userMessage, wardrobeItems = [], user = {}) => {
  const client = getModel();
  if (!client) {
    return "Hi! I'm Luna 🌸 I'm currently unavailable, please try again shortly!";
  }

  try {
    const wardrobeContext = wardrobeItems.length > 0
      ? `\nWardrobe (${wardrobeItems.length} items): ${wardrobeItems.slice(0, 15).map(i => `${i.name} (${i.category})`).join(', ')}.`
      : '\nWardrobe: empty — encourage user to add items.';

    const styleContext  = buildStyleContext(user.styleProfile, user.styleEmbedding);
    const memoryContext = buildMemoryContext(user.outfitMemory);

    const systemPrompt = LUNA_PERSONA + wardrobeContext + styleContext + memoryContext;

    // Build messages array for Groq (OpenAI format)
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    for (const msg of conversationHistory.slice(-8)) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    }

    // Add current message
    messages.push({ role: 'user', content: userMessage });

    return await groqChat(messages);
  } catch (err) {
    logger.error(`Groq chat error: ${err.message}`);
    return "I'm having a moment! ✨ Please try again in a few seconds.";
  }
};

/**
 * Generate outfit suggestions with full context
 */
const generateOutfitSuggestions = async (items, context = {}, styleProfile = {}, styleEmbedding = {}, outfitMemory = []) => {
  const client = getModel();
  if (!client) return getMockOutfitSuggestion(context);

  try {
    const itemList = items.map(i =>
      `- ${i.name} (${i.category}, colors: ${i.colors?.join(', ') || 'unknown'})`
    ).join('\n');

    const styleContext  = buildStyleContext(styleProfile, styleEmbedding);
    const memoryContext = buildMemoryContext(outfitMemory);
    const weatherNote   = context.weather ? `Current weather: ${context.weather}` : '';

    const messages = [
      {
        role: 'system',
        content: LUNA_PERSONA + styleContext + memoryContext,
      },
      {
        role: 'user',
        content: `My wardrobe:\n${itemList}

Occasion: ${context.occasion || 'casual'}
${weatherNote || `Season: ${context.season || 'any'}`}
Mood: ${context.mood || 'feeling good'}

Suggest 3 outfit combinations using ONLY my listed items.
Return ONLY a valid JSON array, no markdown or extra text:
[{"name":"Outfit Name","items":["exact item name"],"tip":"styling tip","accessory":"accessory suggestion","whyItWorks":"why this suits me specifically"}]`,
      },
    ];

    const text = await groqChat(messages);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return getMockOutfitSuggestion(context);
  } catch (err) {
    logger.error(`Groq outfit error: ${err.message}`);
    return getMockOutfitSuggestion(context);
  }
};

/**
 * Generate style insights
 */
const generateStyleInsights = async (stats, styleProfile, styleEmbedding = {}) => {
  const client = getModel();
  if (!client) return 'Keep experimenting with your wardrobe! 🌸';

  try {
    const styleContext = buildStyleContext(styleProfile, styleEmbedding);

    const messages = [
      { role: 'system', content: LUNA_PERSONA + styleContext },
      {
        role: 'user',
        content: `My wardrobe stats: ${stats.totalItems} items, sustainability score ${stats.sustainabilityScore}%, avg ${stats.avgWears} wears/item, most worn category: ${stats.topCategory || 'tops'}.
Give me 2 specific actionable wardrobe tips. Keep it to 3-4 sentences. Be encouraging and personal.`,
      },
    ];

    return await groqChat(messages);
  } catch (err) {
    logger.error(`Groq insights error: ${err.message}`);
    return "You're doing amazing! Keep mixing and matching 🌸";
  }
};

/**
 * Analyze clothing item
 */
const analyzeClothingItem = async (itemName, category) => {
  const client = getModel();
  if (!client) return getMockItemAnalysis();

  try {
    const messages = [
      { role: 'system', content: 'You are a fashion AI that analyzes clothing items. Always respond with valid JSON only, no markdown.' },
      {
        role: 'user',
        content: `Analyze "${itemName}" (category: ${category}). Return ONLY valid JSON:
{"subcategory":"type","occasions":["casual","work"],"seasons":["spring","summer"],"aiTags":["tag1","tag2","tag3"],"aiNotes":"one sentence styling tip"}`,
      },
    ];

    const text = await groqChat(messages);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getMockItemAnalysis();
  } catch (err) {
    logger.error(`Groq analyze error: ${err.message}`);
    return getMockItemAnalysis();
  }
};

// Fallbacks
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