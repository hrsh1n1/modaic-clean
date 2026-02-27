/**
 * modaic/backend/src/routes/auth.routes.js
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * GET  /api/v1/auth/me
 * PUT  /api/v1/auth/profile
 */

const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../validations/validate');

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get('/me',        protect, getMe);
router.put('/profile',   protect, updateProfile);

module.exports = router;
