// src/routes/driverRoutes.js
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

// Routes for /api/drivers
router.route('/')
  .get(protect, driverController.getDrivers)
  .post(protect, authorize('admin'), driverController.createDriver);

router.route('/:id')
  .get(protect, driverController.getDriver)
  .put(protect, authorize('admin'), driverController.updateDriver)
  .delete(protect, authorize('admin'), driverController.deleteDriver);

// Comment out the problematic route until the controller function is implemented
// router.get('/:id/stats', protect, driverController.getDriverStats);

module.exports = router;