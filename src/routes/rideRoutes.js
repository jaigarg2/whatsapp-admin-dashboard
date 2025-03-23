const express = require('express');
const {
  getRides,
  getRide,
  createRide,
  updateRide,
  deleteRide,
  assignDriver,
  updateRideStatus,
  addChatMessage
} = require('../controllers/rideController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router
  .route('/')
  .get(getRides)
  .post(createRide);

router
  .route('/:id')
  .get(getRide)
  .put(updateRide)
  .delete(deleteRide);

router.route('/:id/assign').put(assignDriver);
router.route('/:id/status').put(updateRideStatus);
router.route('/:id/chat').post(addChatMessage);

module.exports = router;