const mongoose = require('mongoose');



const EcoPointSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        coordinates: {type: {type: String, required: true, default: 'Point'}, coordinates: {type: [Number],required: true}},
        acceptedMaterials: {type: [String], enum: ['plastic', 'metal', 'glass', 'paper']},
        status: {type: String,enum: ['Open', 'Closed', 'Full'],default: 'Open'},
        operatingHours: { type: String, default: '' },
        phone: { type: String, default: '' },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

EcoPointSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('EcoPoint', EcoPointSchema, 'ecopoints');
