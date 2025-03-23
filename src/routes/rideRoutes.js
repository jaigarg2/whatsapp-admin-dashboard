// src/routes/rideRoutes.js
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { protect, authorize } = require('../middleware/auth');

// Routes for /api/rides
router.route('/')
  .get(protect, rideController.getRides)
  .post(protect, rideController.createRide);

router.route('/:id')
  .get(protect, rideController.getRide)
  .put(protect, rideController.updateRide)
  .delete(protect, authorize('admin'), rideController.deleteRide);

// Comment out problematic routes
// router.get('/stats', protect, rideController.getRideStats);

module.exports = router;