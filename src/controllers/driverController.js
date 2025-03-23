const Driver = require('../models/Driver');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private
exports.createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);

    res.status(201).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    await driver.deleteOne();

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

// @desc    Get nearby drivers
// @route   GET /api/drivers/nearby
// @access  Private
exports.getNearbyDrivers = async (req, res) => {
  try {
    const { lat, lng, distance = 5, vehicleType } = req.query;

    // Check if coordinates are provided
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    // Calculate radius using distance
    // Earth Radius is approximately 6378 kilometers
    const radius = distance / 6378;

    // Build query
    let query = {
      status: 'online',
      currentLocation: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius]
        }
      }
    };

    // Add vehicle type filter if provided
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    const drivers = await Driver.find(query);

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update driver location
// @route   PUT /api/drivers/:id/location
// @access  Private
exports.updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    // Check if coordinates are provided
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update driver status
// @route   PUT /api/drivers/:id/status
// @access  Private
exports.updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Check if status is provided
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    // Check if status is valid
    const validStatuses = ['online', 'offline', 'busy', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status, must be one of: online, offline, busy, inactive'
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};