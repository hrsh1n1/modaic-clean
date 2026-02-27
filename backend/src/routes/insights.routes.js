// modaic/backend/src/routes/insights.routes.js
const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getInsights } = require('../controllers/insights.controller');
router.use(protect);
router.get('/', getInsights);
module.exports = router;
