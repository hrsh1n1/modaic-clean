/**
 * modaic/backend/src/app.js
 * Main Express application entry point
 * Bootstraps middleware, routes, and database connection
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./config/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ── Route imports ─────────────────────────────────────────────
const authRoutes       = require('./routes/auth.routes');
const wardrobeRoutes   = require('./routes/wardrobe.routes');
const outfitRoutes     = require('./routes/outfit.routes');
const stylistRoutes    = require('./routes/stylist.routes');
const insightsRoutes   = require('./routes/insights.routes');
const userRoutes       = require('./routes/user.routes');

const app = express();

// ── Database ──────────────────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ── Global Rate Limiter ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// ── General Middleware ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✦ Modaic API is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/wardrobe', wardrobeRoutes);
app.use('/api/v1/outfits',  outfitRoutes);
app.use('/api/v1/stylist',  stylistRoutes);
app.use('/api/v1/insights', insightsRoutes);
app.use('/api/v1/users',    userRoutes);

// ── Error Handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`✦ Modaic API listening on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app; // for tests
