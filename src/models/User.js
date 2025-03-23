// src/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 100]
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'admin',
    validate: {
      isIn: [['admin', 'operator']]
    }
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'default-avatar.png'
  },
  resetPasswordToken: {
    type: DataTypes.STRING
  },
  resetPasswordExpire: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Match user entered password to hashed password in database
User.prototype.matchPassword = async