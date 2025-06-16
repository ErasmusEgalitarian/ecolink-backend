const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: String,
  path: String,
  type: String,
  category: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Media', mediaSchema);