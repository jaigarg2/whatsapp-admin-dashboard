// Create src/models/Setting.js if it doesn't exist
const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['pricing', 'system', 'notification', 'chat'],
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Compound index for category and name
SettingSchema.index({ category: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Setting', SettingSchema);