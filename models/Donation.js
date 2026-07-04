const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    anonymized: { type: Boolean, default: false },
    ecopointId: { type: mongoose.Schema.Types.ObjectId, ref: 'EcoPoint', required: true },
    donationDate: { type: Date, default: Date.now },
    materialType: { type: String, enum: ['plastic', 'metal', 'glass', 'paper'], required: true },
    description: { type: String, default: '' },
    qtdMaterial: { type: Number, required: true, min: 0 },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    pickupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pickup', default: null },
    status: { type: String, enum: ['pending', 'collected'], default: 'pending' },
});

DonationSchema.index({ userId: 1, donationDate: -1 });
DonationSchema.index({ pickupId: 1 });

module.exports = mongoose.model('Donation', DonationSchema, 'donations');
