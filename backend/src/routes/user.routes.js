// modaic/backend/src/routes/user.routes.js
const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const { createSuccess } = require('../utils/apiResponse');

router.use(protect);

// Update style quiz / profile
router.put('/style-profile', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { styleProfile: { ...req.user.styleProfile.toObject(), ...req.body, quizCompleted: true } },
      { new: true }
    );
    res.json(createSuccess(user.styleProfile, 'Style profile updated ✨'));
  } catch (err) { next(err); }
});

module.exports = router;
