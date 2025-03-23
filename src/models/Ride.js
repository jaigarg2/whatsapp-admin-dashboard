const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  customer: {
    name: String,
    phone: {
      type: String,
      required: [true, 'Please add a phone number']
    },
    whatsappId: String
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  pickup: {
    address: {
      type: String,
      required: [true, 'Please add a pickup address']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  dropoff: {
    address: {
      type: String,
      required: [true, 'Please add a dropoff address']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  rideType: {
    type: String,
    enum: ['auto', 'car', 'bike'],
    default: 'auto'
  },
  fare: {
    estimated: {
      type: Number,
      required: true
    },
    final: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'online', 'wallet'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    transactionId: String
  },
  schedule: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    scheduledTime: Date
  },
  timestamps: {
    created: {
      type: Date,
      default: Date.now
    },
    accepted: Date,
    arrived: Date,
    started: Date,
    completed: Date,
    cancelled: Date
  },
  distance: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  rating: {
    driver: {
      type: Number,
      min: 1,
      max: 5
    },
    customer: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  feedback: {
    driver: String,
    customer: String
  },
  cancellationReason: String,
  chatHistory: [{
    sender: {
      type: String,
      enum: ['system', 'customer', 'driver', 'admin']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

// Create geospatial indexes for location-based queries
RideSchema.index({ 'pickup.location': '2dsphere' });
RideSchema.index({ 'dropoff.location': '2dsphere' });

module.exports = mongoose.model('Ride', RideSchema);