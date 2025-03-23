// src/controllers/settingController.js
const { Setting } = require('../models');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    // Check if we should only return public settings
    const whereConditions = {};
    if (req.query.public === 'true') {
      whereConditions.isPublic = true;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      whereConditions.category = req.query.category;
    }
    
    const settings = await Setting.findAll({
      where: whereConditions
    });
    
    // Transform to a more friendly format
    const formattedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isPublic: setting.isPublic
      };
      return acc;
    }, {});
    
    res.json({
      success: true,
      count: settings.length,
      data: formattedSettings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single setting
// @route   GET /api/settings/:key
// @access  Private/Admin
exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findByPk(req.params.key);
    
    if (!setting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Setting not found' 
      });
    }
    
    res.json({
      success: true,
      data: {
        key: setting.key,
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isPublic: setting.isPublic
      }
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create new setting
// @route   POST /api/settings
// @access  Private/Admin
exports.createSetting = async (req, res) => {
  try {
    const { key, value, category, description, isPublic } = req.body;
    
    // Check if setting already exists
    const settingExists = await Setting.findByPk(key);
    
    if (settingExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Setting with that key already exists' 
      });
    }
    
    // Create setting
    const setting = await Setting.create({
      key,
      value,
      category: category || 'general',
      description,
      isPublic: isPublic !== undefined ? isPublic : false
    });
    
    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      data: setting
    });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update setting
// @route   PUT /api/settings/:key
// @access  Private/Admin
exports.updateSetting = async (req, res) => {
  try {
    const { value, category, description, isPublic } = req.body;
    
    // Find setting by key
    const setting = await Setting.findByPk(req.params.key);
    
    if (!setting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Setting not found' 
      });
    }
    
    // Update fields
    if (value !== undefined) setting.value = value;
    if (category !== undefined) setting.category = category;
    if (description !== undefined) setting.description = description;
    if (isPublic !== undefined) setting.isPublic = isPublic;
    
    // Save setting
    await setting.save();
    
    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete setting
// @route   DELETE /api/settings/:key
// @access  Private/Admin
exports.deleteSetting = async (req, res) => {
  try {
    // Find setting by key
    const setting = await Setting.findByPk(req.params.key);
    
    if (!setting) {
      return res.status(404).json({ 
        success: false, 
        message: 'Setting not found' 
      });
    }
    
    // Delete setting
    await setting.destroy();
    
    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get settings by category
// @route   GET /api/settings/category/:category
// @access  Private/Admin
exports.getSettingsByCategory = async (req, res) => {
  try {
    const settings = await Setting.findAll({
      where: {
        category: req.params.category
      }
    });
    
    res.json({
      success: true,
      count: settings.length,
      data: settings
    });
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};