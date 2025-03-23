// src/controllers/userController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user with that email already exists
    const userExists = await User.findOne({ where: { email } });
    
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with that email already exists' 
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by model hook
      role: role || 'admin'
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Find user by ID
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    
    // If password is included, update it
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Save user
    await user.save();
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Delete user
    await user.destroy();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};