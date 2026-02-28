/**
 * modaic/backend/src/routes/trends.routes.js
 */

const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getUserTrendAlert, generateTrendAlertForUser } = require('../services/trends.service');
const { createSuccess } = require('../utils/apiResponse');

router.use(protect);

// GET current trend alert for user
router.get('/', async (req, res, next) => {
  try {
    let alert = await getUserTrendAlert(req.user._id);

    // Auto-generate if none exists
    if (!alert) {
      alert = await generateTrendAlertForUser(req.user._id);
    }

    res.status(200).json(createSuccess(alert));
  } catch (err) { next(err); }
});

// POST manually refresh trend alert (for testing)
router.post('/refresh', async (req, res, next) => {
  try {
    const alert = await generateTrendAlertForUser(req.user._id);
    res.status(200).json(createSuccess(alert, 'Trend alert refreshed! ✨'));
  } catch (err) { next(err); }
});

module.exports = router;