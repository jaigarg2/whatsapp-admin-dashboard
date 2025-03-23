const Setting = require('../models/Setting');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const settings = await Setting.find(query).sort('category name');
    
    res.status(200).json({
      success: true,
      count: settings.length,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single setting
// @route   GET /api/settings/:id
// @access  Private
exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new setting
// @route   POST /api/settings
// @access  Private/Admin
exports.createSetting = async (req, res) => {
  try {
    // Add user ID to updatedBy field
    req.body.updatedBy = req.user.id;
    
    const setting = await Setting.create(req.body);

    res.status(201).json({
      success: true,
      data: setting
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A setting with this name already exists in this category'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update setting
// @route   PUT /api/settings/:id
// @access  Private/Admin
exports.updateSetting = async (req, res) => {
  try {
    // Add user ID to updatedBy field and update lastUpdated timestamp
    req.body.updatedBy = req.user.id;
    req.body.lastUpdated = Date.now();
    
    const setting = await Setting.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete setting
// @route   DELETE /api/settings/:id
// @access  Private/Admin
exports.deleteSetting = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    await setting.deleteOne();

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

// @desc    Get settings by category and name
// @route   GET /api/settings/byName
// @access  Private
exports.getSettingByName = async (req, res) => {
  try {
    const { category, name } = req.query;
    
    if (!category || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category and name'
      });
    }
    
    const setting = await Setting.findOne({ category, name });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};