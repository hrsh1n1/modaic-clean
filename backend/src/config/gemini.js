/**
 * modaic/backend/src/config/gemini.js
 * Google Gemini AI configuration
 * Get FREE API key at: https://aistudio.google.com/app/apikey
 * Free tier: 15 RPM, 1M tokens/day — plenty for dev + small production
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

let genAI;
let model;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set — AI features disabled');
    return null;
  }

  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  });

  logger.info('✦ Gemini AI initialized');
  return model;
};

const getModel = () => {
  if (!model) return initGemini();
  return model;
};

module.exports = { initGemini, getModel };
