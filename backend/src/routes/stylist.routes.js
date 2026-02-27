/**
 * modaic/backend/src/routes/stylist.routes.js
 * AI stylist chat & outfit generation endpoints
 */

const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { chat, getSessions, getSession, generateOutfits, aiLimiter } = require('../controllers/stylist.controller');

router.use(protect);

router.post('/chat',             aiLimiter, chat);
router.post('/generate-outfits', aiLimiter, generateOutfits);
router.get('/sessions',          getSessions);
router.get('/sessions/:id',      getSession);

module.exports = router;
