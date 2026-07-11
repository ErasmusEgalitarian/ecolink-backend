const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
    ecopointId: { type: mongoose.Schema.Types.ObjectId, ref: 'EcoPoint', required: true },
    pickupBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who accepted/collected the ecopoint
    pickupByAnonymized: { type: Boolean, default: false }, // set when the collector account was deleted
    pickupStatus: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    /** Doações que integravam o lote no momento do cancelamento (histórico). */
    cancelledDonationIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
});

PickupSchema.index({ pickupStatus: 1, createdAt: -1 });
PickupSchema.index({ pickupBy: 1, confirmedAt: -1 });

PickupSchema.index(
    { ecopointId: 1 },
    {
        unique: true,
        partialFilterExpression: { pickupStatus: 'pending' }
    }
);

module.exports = mongoose.model('Pickup', PickupSchema, 'pickups');
