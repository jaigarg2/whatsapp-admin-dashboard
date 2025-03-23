// src/controllers/rideController.js
const { Ride, Driver } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// @desc    Get all rides
// @route   GET /api/rides
// @access  Private/Admin
exports.getRides = async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (req.query.status) {
      whereConditions.status = req.query.status;
    }
    
    if (req.query.vehicleType) {
      whereConditions.vehicleType = req.query.vehicleType;
    }
    
    if (req.query.driverId) {
      whereConditions.driverId = req.query.driverId;
    }
    
    if (req.query.userId) {
      whereConditions.userId = req.query.userId;
    }
    
    // Date range filtering
    if (req.query.startDate && req.query.endDate) {
      whereConditions.requestTime = {
        [Op.between]: [
          new Date(req.query.startDate),
          new Date(req.query.endDate)
        ]
      };
    } else if (req.query.startDate) {
      whereConditions.requestTime = {
        [Op.gte]: new Date(req.query.startDate)
      };
    } else if (req.query.endDate) {
      whereConditions.requestTime = {
        [Op.lte]: new Date(req.query.endDate)
      };
    }
    
    // Get rides with pagination
    const { count, rows: rides } = await Ride.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'name', 'phone', 'vehicleNumber']
        }
      ],
      limit,
      offset: startIndex,
      order: [['requestTime', 'DESC']]
    });
    
    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < count) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.json({
      success: true,
      count,
      pagination,
      data: rides
    });
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Private/Admin
exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findByPk(req.params.id, {
      include: [
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'name', 'phone', 'vehicleNumber', 'vehicleType', 'rating']
        }
      ]
    });
    
    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ride not found' 
      });
    }
    
    res.json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create new ride
// @route   POST /api/rides
// @access  Private/Admin
exports.createRide = async (req, res) => {
  try {
    const { 
      userId, 
      userName,
      pickupLocation, 
      dropoffLocation,
      pickupAddress,
      dropoffAddress,
      vehicleType,
      scheduledTime,
      estimatedFare
    } = req.body;
    
    // Create ride
    const ride = await Ride.create({
      userId,
      userName,
      pickupLocation,
      dropoffLocation,
      pickupAddress,
      dropoffAddress,
      vehicleType,
      scheduledTime: scheduledTime || new Date(),
      estimatedFare,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      data: ride
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private/Admin
exports.updateRide = async (req, res) => {
  try {
    // Find ride by ID
    const ride = await Ride.findByPk(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ride not found' 
      });
    }
    
    // Update fields
    // Only update fields that are provided in the request
    const updatableFields = [
      'status', 'driverId', 'startTime', 'endTime', 
      'actualFare', 'paymentMethod', 'paymentStatus',
      'rating', 'feedback', 'cancellationReason',
      'cancellationTime', 'cancelledBy'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        ride[field] = req.body[field];
      }
    });
    
    // Special case for status transitions
    if (req.body.status === 'completed' && !ride.endTime) {
      ride.endTime = new Date();
    }
    
    if (req.body.status === 'cancelled' && !ride.cancellationTime) {
      ride.cancellationTime = new Date();
      ride.cancelledBy = req.body.cancelledBy || 'admin';
    }
    
    // Save ride
    await ride.save();
    
    // If the ride was completed, update driver statistics
    if (req.body.status === 'completed' && ride.driverId) {
      const driver = await Driver.findByPk(ride.driverId);
      if (driver) {
        driver.totalRides += 1;
        driver.totalEarnings = (parseFloat(driver.totalEarnings) || 0) + (parseFloat(ride.actualFare) || 0);
        await driver.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Ride updated successfully',
      data: ride
    });
  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Private/Admin
exports.deleteRide = async (req, res) => {
  try {
    // Find ride by ID
    const ride = await Ride.findByPk(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ride not found' 
      });
    }
    
    // Check if ride is active
    if (['accepted', 'arriving', 'in_progress'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active ride'
      });
    }
    
    // Delete ride
    await ride.destroy();
    
    res.json({
      success: true,
      message: 'Ride deleted successfully'
    });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get ride statistics
// @route   GET /api/rides/stats
// @access  Private/Admin
exports.getRideStats = async (req, res) => {
  try {
    // Get date range
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Last 30 days by default
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date();
    
    // Count total rides
    const totalRides = await Ride.count({
      where: {
        requestTime: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    // Count by status
    const statusCounts = await Ride.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        requestTime: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['status'],
      raw: true
    });
    
    // Total revenue
    const totalRevenue = await Ride.sum('actualFare', {
      where: {
        status: 'completed',
        endTime: {
          [Op.between]: [startDate, endDate]
        }
      }
    }) || 0;
    
    // Count by vehicle type
    const vehicleCounts = await Ride.findAll({
      attributes: [
        'vehicleType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        requestTime: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: ['vehicleType'],
      raw: true
    });
    
    // Average rating
    const avgRating = await Ride.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      where: { 
        rating: { [Op.not]: null },
        endTime: {
          [Op.between]: [startDate, endDate]
        }
      },
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        totalRides,
        byStatus: statusCounts.reduce((acc, curr) => {
          acc[curr.status] = parseInt(curr.count);
          return acc;
        }, {}),
        totalRevenue,
        byVehicleType: vehicleCounts.reduce((acc, curr) => {
          acc[curr.vehicleType] = parseInt(curr.count);
          return acc;
        }, {}),
        averageRating: avgRating?.avgRating || 0,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    console.error('Get ride stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};