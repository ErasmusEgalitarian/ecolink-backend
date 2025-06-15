const mongoose = require('mongoose');

const mediaDeletionLogSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    default: null
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('media_deletion_logs', mediaDeletionLogSchema);
