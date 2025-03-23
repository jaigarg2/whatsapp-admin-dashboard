const express = require('express');
const {
  getDashboardStats,
  getEarningsByPeriod
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/').get(getDashboardStats);
router.route('/earnings').get(getEarningsByPeriod);

module.exports = router;