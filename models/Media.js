const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,    
    required: true
  },
  type: {
    type: String,   
    required: true
  },
  category: {
    type: String,    
    required: true
  },
  uploadedAt: {
    type: Date,     
    default: Date.now
  },
  deleted: {
    type: Boolean,
    default: false
  },

}, {
  collection: 'media'  
});

module.exports = mongoose.model('Media', mediaSchema);
