const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        coordinates: {
            type: { type: String, required: true, default: 'Point' },
            coordinates: { type: [Number], required: true }
        },
        imageUrl: { type: String, default: '', trim: true },
        operatingHours: { type: String, default: '', trim: true },
        isExtern: { type: Boolean, default: false }
    },
    { timestamps: true }
);

LocationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Location', LocationSchema, 'locations');
