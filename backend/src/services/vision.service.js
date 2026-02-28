/**
 * modaic/backend/src/services/vision.service.js
 * AI clothing recognition using Groq Vision (llama-4-scout-17b-16e-instruct)
 * Analyzes uploaded clothing photos and returns structured metadata
 */

const Groq = require('groq-sdk');
const https = require('https');
const http = require('http');
const logger = require('../config/logger');

let visionClient = null;

const getVisionClient = () => {
  if (!visionClient && process.env.GROQ_API_KEY) {
    visionClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return visionClient;
};

/**
 * Fetch image from URL and convert to base64
 */
const imageUrlToBase64 = (url) => new Promise((resolve, reject) => {
  const protocol = url.startsWith('https') ? https : http;
  protocol.get(url, (res) => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString('base64'));
    });
    res.on('error', reject);
  }).on('error', reject);
});

/**
 * Analyze a clothing image URL using Groq Vision
 * Returns structured metadata to pre-fill the add-item form
 */
const analyzeClothingImage = async (imageUrl) => {
  const client = getVisionClient();
  if (!client) {
    logger.warn('Vision: Groq client not available');
    return null;
  }

  try {
    // Convert image URL to base64
    const base64Image = await imageUrlToBase64(imageUrl);
    
    // Detect content type from URL
    const contentType = imageUrl.match(/\.(png)/) ? 'image/png' 
      : imageUrl.match(/\.(webp)/) ? 'image/webp' 
      : 'image/jpeg';

    const response = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${contentType};base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: `Analyze this clothing item image. Return ONLY valid JSON, no markdown:
{
  "name": "descriptive item name (e.g. 'Floral Midi Dress', 'White Linen Shirt')",
  "category": "one of: tops|bottoms|dresses|outerwear|shoes|accessories|activewear",
  "subcategory": "specific type (e.g. blouse, jeans, sneakers)",
  "colors": ["list of colors you see"],
  "pattern": "solid|stripes|floral|plaid|animal|geometric|abstract|other",
  "occasions": ["casual","work","formal","date","sport","beach","party"],
  "seasons": ["spring","summer","autumn","winter","all"],
  "aiTags": ["3-5 style keywords like feminine, oversized, vintage"],
  "aiNotes": "one sentence styling tip for this specific item"
}`,
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    const text = response.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const analysis = JSON.parse(jsonMatch[0]);
    logger.info(`Vision: analyzed clothing — ${analysis.name} (${analysis.category})`);
    return analysis;
  } catch (err) {
    logger.error(`Vision analysis error: ${err.message}`);
    return null;
  }
};

module.exports = { analyzeClothingImage };