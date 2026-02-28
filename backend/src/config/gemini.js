/**
 * modaic/backend/src/config/gemini.js
 * Groq AI configuration — FREE tier, 14,400 req/day, no credit card
 * Get free key at: https://console.groq.com
 */

const Groq = require('groq-sdk');
const logger = require('./logger');

let client = null;

const MODEL = 'llama-3.3-70b-versatile'; // Fast, smart, free

const initGemini = () => {
  if (!process.env.GROQ_API_KEY) {
    logger.warn('GROQ_API_KEY not set — AI features disabled');
    return null;
  }
  try {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    logger.info(`✦ Groq AI initialized (${MODEL})`);
    return client;
  } catch (err) {
    logger.error(`Groq init error: ${err.message}`);
    return null;
  }
};

const getModel = () => {
  if (!client) return initGemini();
  return client;
};

const getModelName = () => MODEL;

module.exports = { initGemini, getModel, getModelName };