// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Routes for /api/users
router.route('/')
  .get(protect, authorize('admin'), userController.getUsers)
  .post(protect, authorize('admin'), userController.createUser);

router.route('/:id')
  .get(protect, authorize('admin'), userController.getUser)
  .put(protect, authorize('admin'), userController.updateUser)
  .delete(protect, authorize('admin'), userController.deleteUser);

module.exports = router;