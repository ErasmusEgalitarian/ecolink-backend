const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: String,
  path: String,
  type: String,
  category: String,
  purpose: {
    type: String,
    enum: ['donation', 'content_cover', 'content_inline'],
    default: 'donation',
  },
  articleSlug: {
    type: String,
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Media', mediaSchema);
