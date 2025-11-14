const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who registered the waste
    pickupBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who accepted the pickup
    pickupStatus: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pickup', PickupSchema, 'pickups');