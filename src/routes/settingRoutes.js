// src/routes/settingRoutes.js
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

// Routes for /api/settings
router.route('/')
  .get(protect, settingController.getSettings)
  .post(protect, authorize('admin'), settingController.createSetting);

router.route('/:key')
  .get(protect, settingController.getSetting)
  .put(protect, authorize('admin'), settingController.updateSetting)
  .delete(protect, authorize('admin'), settingController.deleteSetting);

// Comment out problematic route
// router.get('/category/:category', protect, settingController.getSettingsByCategory);

module.exports = router;