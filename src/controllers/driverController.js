// src/controllers/driverController.js
const { Driver, Ride } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private/Admin
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll();
    
    res.json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private/Admin
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id, {
      include: [
        {
          model: Ride,
          as: 'rides',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }
    
    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private/Admin
exports.createDriver = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      vehicleType, 
      vehicleNumber, 
      licenseNumber 
    } = req.body;
    
    // Check if driver with that phone already exists
    const driverExists = await Driver.findOne({ where: { phone } });
    
    if (driverExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Driver with that phone number already exists' 
      });
    }
    
    // Create driver
    const driver = await Driver.create({
      name,
      phone,
      email,
      vehicleType,
      vehicleNumber,
      licenseNumber
    });
    
    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private/Admin
exports.updateDriver = async (req, res) => {
  try {
    // Find driver by ID
    const driver = await Driver.findByPk(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }
    
    // Update fields
    // Only update fields that are provided in the request
    const updatableFields = [
      'name', 'phone', 'email', 'vehicleType', 'vehicleNumber',
      'licenseNumber', 'isActive', 'currentLocation', 'isOnline',
      'profileImage', 'documents', 'notes'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        driver[field] = req.body[field];
      }
    });
    
    // Save driver
    await driver.save();
    
    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private/Admin
exports.deleteDriver = async (req, res) => {
  try {
    // Find driver by ID
    const driver = await Driver.findByPk(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }
    
    // Check if driver has any active rides
    const activeRides = await Ride.count({
      where: {
        driverId: driver.id,
        status: {
          [Op.in]: ['accepted', 'arriving', 'in_progress']
        }
      }
    });
    
    if (activeRides > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver with active rides'
      });
    }
    
    // Delete driver
    await driver.destroy();
    
    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get driver statistics
// @route   GET /api/drivers/:id/stats
// @access  Private/Admin
exports.getDriverStats = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }
    
    // Get ride statistics
    const totalRides = await Ride.count({
      where: { driverId: driver.id }
    });
    
    const completedRides = await Ride.count({
      where: { 
        driverId: driver.id,
        status: 'completed'
      }
    });
    
    const cancelledRides = await Ride.count({
      where: { 
        driverId: driver.id,
        status: 'cancelled'
      }
    });
    
    const totalEarnings = await Ride.sum('actualFare', {
      where: { 
        driverId: driver.id,
        status: 'completed'
      }
    }) || 0;
    
    // Get average rating
    const avgRating = await Ride.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      where: { 
        driverId: driver.id,
        rating: { [Op.not]: null }
      },
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        totalRides,
        completedRides,
        cancelledRides,
        completionRate: totalRides > 0 ? (completedRides / totalRides) * 100 : 0,
        totalEarnings,
        averageRating: avgRating?.avgRating || 0
      }
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};