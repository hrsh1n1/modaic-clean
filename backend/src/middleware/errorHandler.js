/**
 * modaic/backend/src/middleware/errorHandler.js
 * Centralized error handling — converts all errors to consistent API format
 */

const logger = require('../config/logger');
const { createError } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${req.method} ${req.path} — ${err.stack}`);
  } else {
    logger.warn(`[${statusCode}] ${req.method} ${req.path} — ${message}`);
  }

  res.status(statusCode).json(
    createError(message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined)
  );
};

module.exports = { notFound, errorHandler };
