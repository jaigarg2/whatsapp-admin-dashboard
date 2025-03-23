// src/models/Ride.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Ride = sequelize.define('Ride', {
  rideId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.STRING, // WhatsApp number or user identifier
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING
  },
  driverId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Drivers',
      key: 'id'
    },
    allowNull: true // Null until assigned to a driver
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled']]
    }
  },
  pickupLocation: {
    type: DataTypes.JSON, // Store full location data including lat/long
    allowNull: false
  },
  dropoffLocation: {
    type: DataTypes.JSON,
    allowNull: false
  },
  pickupAddress: {
    type: DataTypes.STRING
  },
  dropoffAddress: {
    type: DataTypes.STRING
  },
  requestTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  scheduledTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  startTime: {
    type: DataTypes.DATE
  },
  endTime: {
    type: DataTypes.DATE
  },
  estimatedFare: {
    type: DataTypes.FLOAT
  },
  actualFare: {
    type: DataTypes.FLOAT
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'cash'
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'completed', 'failed']]
    }
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['auto', 'car', 'bike']]
    }
  },
  distance: {
    type: DataTypes.FLOAT
  },
  duration: {
    type: DataTypes.INTEGER // in minutes
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  feedback: {
    type: DataTypes.TEXT
  },
  cancellationReason: {
    type: DataTypes.STRING
  },
  cancellationTime: {
    type: DataTypes.DATE
  },
  cancelledBy: {
    type: DataTypes.STRING // 'user' or 'driver' or 'admin'
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (ride) => {
      // Generate a unique ride ID if not provided
      if (!ride.rideId) {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        ride.rideId = `RIDE${timestamp}${random}`;
      }
    }
  }
});

module.exports = Ride;