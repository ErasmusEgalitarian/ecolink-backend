const mongoose = require('mongoose');

const EcoPointSchema = new mongoose.Schema(
    {
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true
        },
        label: { type: String, required: true, trim: true },
        acceptedMaterials: {
            type: [String],
            enum: ['plastic', 'metal', 'glass', 'paper'],
            required: true
        },
        status: {
            type: String,
            enum: ['open', 'full', 'closed', 'offline'],
            default: 'open'
        },
        qrCode: { type: String, trim: true, default: '' }
    },
    { timestamps: true }
);

EcoPointSchema.index({ locationId: 1 });
EcoPointSchema.index({ qrCode: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('EcoPoint', EcoPointSchema, 'ecopoints');
