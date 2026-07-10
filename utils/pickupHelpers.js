const mongoose = require('mongoose');
const Pickup = require('../models/Pickup');
const Donation = require('../models/Donation');

const normalizeEcopointId = (ecopointId) => {
    if (!ecopointId) {
        return ecopointId;
    }

    if (ecopointId instanceof mongoose.Types.ObjectId) {
        return ecopointId;
    }

    if (mongoose.Types.ObjectId.isValid(ecopointId)) {
        return new mongoose.Types.ObjectId(String(ecopointId));
    }

    return ecopointId;
};

const findPendingPickupForEcopoint = async (ecopointId) =>
    Pickup.findOne({
        ecopointId: normalizeEcopointId(ecopointId),
        pickupStatus: 'pending',
    });

const createPendingPickupForEcopoint = async (ecopointId) => {
    const normalizedId = normalizeEcopointId(ecopointId);

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await Pickup.create({
                ecopointId: normalizedId,
                pickupStatus: 'pending',
                createdAt: new Date(),
            });
        } catch (error) {
            if (error.code === 11000 && attempt === 0) {
                const existing = await findPendingPickupForEcopoint(normalizedId);
                if (existing) {
                    return existing;
                }
            }
            throw error;
        }
    }
};

/**
 * Retorna a coleta pendente do ecoponto, se existir.
 * Só cria uma nova coleta quando não há nenhuma pendente (ex.: nova doação).
 */
const getOrCreateOpenPickup = async (ecopointId) => {
    const existing = await findPendingPickupForEcopoint(ecopointId);
    if (existing) {
        return existing;
    }

    return createPendingPickupForEcopoint(ecopointId);
};

/**
 * Marca a coleta como cancelada (mantém pickupBy para histórico do editor),
 * cria uma nova coleta pendente no ecoponto e reassocia as doações.
 */
const cancelPickupWithReplacement = async (pickup) => {
    const oldPickupId = pickup._id;
    const ecopointId = normalizeEcopointId(pickup.ecopointId);

    pickup.pickupStatus = 'cancelled';
    pickup.cancelledAt = pickup.cancelledAt || new Date();

    const donations = await Donation.find({ pickupId: oldPickupId }).select('_id').lean();
    pickup.cancelledDonationIds = donations.map((donation) => donation._id);

    await pickup.save();

    const replacementPickup = await createPendingPickupForEcopoint(ecopointId);

    await Donation.updateMany(
        { pickupId: oldPickupId },
        { $set: { pickupId: replacementPickup._id, status: 'pending' } }
    );

    return replacementPickup;
};

module.exports = {
    normalizeEcopointId,
    findPendingPickupForEcopoint,
    createPendingPickupForEcopoint,
    getOrCreateOpenPickup,
    cancelPickupWithReplacement,
};
