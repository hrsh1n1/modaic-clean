/**
 * modaic/backend/src/routes/wardrobe.routes.js
 */

const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const ctrl = require('../controllers/wardrobe.controller');

router.use(protect);

router.get('/',                       ctrl.getItems);
router.post('/',                      upload.single('image'), ctrl.addItem);
router.post('/analyze-image',         upload.single('image'), ctrl.analyzeImage); // AI vision preview
router.get('/:id',                    ctrl.getItem);
router.put('/:id',                    ctrl.updateItem);
router.delete('/:id',                 ctrl.deleteItem);
router.post('/:id/wear',              ctrl.recordWear);

module.exports = router;