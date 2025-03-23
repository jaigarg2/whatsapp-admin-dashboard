// src/models/index.js
const User = require('./User');
const Driver = require('./Driver');
const Ride = require('./Ride');
const Setting = require('./Setting');

// Define relationships
Ride.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });
Driver.hasMany(Ride, { foreignKey: 'driverId', as: 'rides' });

// Export all models
module.exports = {
  User,
  Driver,
  Ride,
  Setting
};