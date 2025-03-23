const Ride = require('../models/Ride');
const Driver = require('../models/Driver');

// @desc    Get all rides
// @route   GET /api/rides
// @access  Private
exports.getRides = async (req, res) => {
  try {
    // Allow filtering by status and date range
    const { status, startDate, endDate, customerId, driverId } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query['timestamps.created'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (customerId) {
      query['customer.phone'] = customerId;
    }
    
    if (driverId) {
      query.driver = driverId;
    }
    
    const rides = await Ride.find(query)
      .populate('driver', 'name phone vehicleNumber vehicleType')
      .sort({ 'timestamps.created': -1 });
    
    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Private
exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name phone vehicleNumber vehicleType');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new ride
// @route   POST /api/rides
// @access  Private
exports.createRide = async (req, res) => {
  try {
    const ride = await Ride.create(req.body);

    res.status(201).json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private
exports.updateRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('driver', 'name phone vehicleNumber vehicleType');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Private
exports.deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    await ride.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Assign driver to ride
// @route   PUT /api/rides/:id/assign
// @access  Private
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide driver ID'
      });
    }

    // Check if driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if driver is available
    if (driver.status !== 'online') {
      return res.status(400).json({
        success: false,
        message: 'Driver is not available'
      });
    }

    // Update ride with driver and status
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      {
        driver: driverId,
        status: 'accepted',
        'timestamps.accepted': Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('driver', 'name phone vehicleNumber vehicleType');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Update driver status to busy
    await Driver.findByIdAndUpdate(driverId, { status: 'busy' });

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update ride status
// @route   PUT /api/rides/:id/status
// @access  Private
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    // Check if status is valid
    const validStatuses = ['pending', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Prepare update object
    const updateObj = { status };
    
    // Add timestamp based on status
    if (status === 'arrived') {
      updateObj['timestamps.arrived'] = Date.now();
    } else if (status === 'in_progress') {
      updateObj['timestamps.started'] = Date.now();
    } else if (status === 'completed') {
      updateObj['timestamps.completed'] = Date.now();
    } else if (status === 'cancelled') {
      updateObj['timestamps.cancelled'] = Date.now();
    }

    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      updateObj,
      {
        new: true,
        runValidators: true
      }
    ).populate('driver', 'name phone vehicleNumber vehicleType');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // If ride is completed or cancelled, update driver status to online
    if (status === 'completed' || status === 'cancelled') {
      if (ride.driver) {
        await Driver.findByIdAndUpdate(ride.driver, { status: 'online' });
      }
    }

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add message to ride chat history
// @route   POST /api/rides/:id/chat
// @access  Private
exports.addChatMessage = async (req, res) => {
  try {
    const { sender, message } = req.body;

    if (!sender || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide sender and message'
      });
    }

    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          chatHistory: {
            sender,
            message,
            timestamp: Date.now()
          }
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ride.chatHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};