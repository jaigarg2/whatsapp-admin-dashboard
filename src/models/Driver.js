const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please add a vehicle number'],
    unique: true
  },
  vehicleType: {
    type: String,
    enum: ['auto', 'car', 'bike'],
    default: 'auto'
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'busy', 'inactive'],
    default: 'offline'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  earnings: {
    daily: {
      type: Number,
      default: 0
    },
    weekly: {
      type: Number,
      default: 0
    },
    monthly: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  documents: {
    license: {
      url: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    registration: {
      url: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    insurance: {
      url: String,
      verified: {
        type: Boolean,
        default: false
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
DriverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', DriverSchema);