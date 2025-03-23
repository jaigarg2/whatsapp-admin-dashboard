// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// Routes for /api/dashboard
router.get('/stats', protect, dashboardController.getDashboardStats);

// Comment out problematic routes
// router.get('/revenue-chart', protect, dashboardController.getRevenueChartData);
// router.get('/ride-distribution', protect, dashboardController.getRideDistribution);

module.exports = router;