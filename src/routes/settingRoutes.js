const express = require('express');
const {
  getSettings,
  getSetting,
  createSetting,
  updateSetting,
  deleteSetting,
  getSettingByName
} = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Special route to get setting by category and name
router.route('/byName').get(getSettingByName);

router
  .route('/')
  .get(getSettings)
  .post(authorize('admin'), createSetting);

router
  .route('/:id')
  .get(getSetting)
  .put(authorize('admin'), updateSetting)
  .delete(authorize('admin'), deleteSetting);

module.exports = router;