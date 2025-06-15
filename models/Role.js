const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true    
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'roles'  
});

module.exports = mongoose.model('Role', roleSchema);
