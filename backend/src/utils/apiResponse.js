/**
 * modaic/backend/src/utils/apiResponse.js
 * Standardized API response helpers
 * All controllers use these to ensure consistent response shape
 */

/**
 * Success response
 * @param {*} data - Response payload
 * @param {string} message - Human-readable message
 * @param {object} meta - Optional pagination/extra metadata
 */
const createSuccess = (data = null, message = 'Success', meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta) response.meta = meta;
  return response;
};

/**
 * Error response
 * @param {string} message - Error description
 * @param {number} statusCode - HTTP status
 * @param {*} details - Optional debug details
 */
const createError = (message = 'Something went wrong', statusCode = 500, details = null) => {
  const response = { success: false, message, statusCode };
  if (details) response.details = details;
  return response;
};

/**
 * Paginated list response
 */
const createPaginated = (data, total, page, limit) => ({
  success: true,
  message: 'Success',
  data,
  meta: {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  },
});

module.exports = { createSuccess, createError, createPaginated };
