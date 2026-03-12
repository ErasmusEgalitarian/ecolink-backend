const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ecopointId: { type: mongoose.Schema.Types.ObjectId, ref: 'EcoPoint', required: true }, // Change to reference the Ecopoint model when it's available
    donationDate: { type: Date, default: Date.now },
    materialType: { type: String, enum: ['plastic', 'metal', 'glass', 'paper'], required: true },
    description: { type: String, default: '' },
    qtdMaterial: { type: Number, required: true, min: 0 },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true }, // Required reference to Media model
});

module.exports = mongoose.model('Donation', DonationSchema, 'donations');