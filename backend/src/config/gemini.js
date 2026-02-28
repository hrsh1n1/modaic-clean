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
  
  // Force gemini-1.5-flash — free tier friendly
  const modelName = 'gemini-2.0-flash';
  
  model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  });

  logger.info(`✦ Gemini AI initialized with model: ${modelName}`);
  return model;
};

const getModel = () => {
  if (!model) return initGemini();
  return model;
};

module.exports = { initGemini, getModel };