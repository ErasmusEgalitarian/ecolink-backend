const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    donationDate: { type: Date, default: Date.now },
    materialType: { type: String, required: true },
    description: { type: String, default: '' },
    qtdMaterial: { type: Number, required: true },
});

module.exports = mongoose.model('Donation', DonationSchema, 'donation');
