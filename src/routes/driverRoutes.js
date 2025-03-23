const express = require('express');
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getNearbyDrivers,
  updateDriverLocation,
  updateDriverStatus
} = require('../controllers/driverController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/nearby').get(getNearbyDrivers);

router
  .route('/')
  .get(getDrivers)
  .post(createDriver);

router
  .route('/:id')
  .get(getDriver)
  .put(updateDriver)
  .delete(deleteDriver);

router.route('/:id/location').put(updateDriverLocation);
router.route('/:id/status').put(updateDriverStatus);

module.exports = router;