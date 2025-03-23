// src/models/Driver.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Driver = sequelize.define('Driver', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['auto', 'car', 'bike']]
    }
  },
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  currentLocation: {
    type: DataTypes.JSON, // For storing latitude/longitude
    defaultValue: null
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalRides: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalEarnings: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  profileImage: {
    type: DataTypes.STRING,
    defaultValue: 'default-driver.png'
  },
  documents: {
    type: DataTypes.JSON, // For storing document paths and verification status
    defaultValue: {}
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});

module.exports = Driver;