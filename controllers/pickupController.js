const Pickup = require('../models/Pickup');
const Donation = require('../models/Donation');
const User = require('../models/User');
const EcoPoint = require('../models/EcoPoint');
const { ECOPOINT_WITH_LOCATION_POPULATE } = require('../utils/locationHelpers');
const { cancelPickupWithReplacement } = require('../utils/pickupHelpers');

const getPickupDonations = (pickupId) =>
    Donation.find({ pickupId })
        .populate('userId', 'username email phone address')
        .populate('mediaId')
        .sort({ donationDate: -1 })
        .lean();

const getPickupDonationsForDetail = (pickup) => {
    if (pickup.pickupStatus === 'cancelled' && pickup.cancelledDonationIds?.length) {
        return Donation.find({ _id: { $in: pickup.cancelledDonationIds } })
            .populate('userId', 'username email phone address')
            .populate('mediaId')
            .sort({ donationDate: -1 })
            .lean();
    }

    return getPickupDonations(pickup._id);
};

/**
 * @description Lista todos os pickups (com filtros)
 * @route GET /api/pickups
 * @access Private
 */
const getAllPickups = async (req, res, next) => {
    try {
        const { pickupStatus, ecopointId, page = 1, limit = 10 } = req.query;
        
        const filters = {};
        if (pickupStatus) filters.pickupStatus = pickupStatus;
        if (ecopointId) filters.ecopointId = ecopointId;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pickups = await Pickup.find(filters)
            .populate(ECOPOINT_WITH_LOCATION_POPULATE)
            .populate('pickupBy', 'username email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Pickup.countDocuments(filters);
        
        res.status(200).json({
            success: true,
            data: pickups,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching pickups:', error);
        next(error);
    }
};

/**
 * @description Lista pickups que contêm doações do usuário autenticado
 * @route GET /api/pickups/my
 * @access Private
 */
const getMyPickups = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pickupIds = await Donation.distinct('pickupId', {
            userId: req.user.id,
            pickupId: { $ne: null }
        });
        
        const filters = { _id: { $in: pickupIds } };
        
        const pickups = await Pickup.find(filters)
            .populate(ECOPOINT_WITH_LOCATION_POPULATE)
            .populate('pickupBy', 'username email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Pickup.countDocuments(filters);
        
        res.status(200).json({
            success: true,
            data: pickups,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching user pickups:', error);
        next(error);
    }
};

/**
 * @description Lista pickups aceitos pelo usuário autenticado
 * @route GET /api/pickups/accepted
 * @access Private
 */
const getAcceptedPickups = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pickups = await Pickup.find({ pickupBy: req.user.id })
            .populate(ECOPOINT_WITH_LOCATION_POPULATE)
            .sort({ confirmedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Pickup.countDocuments({ pickupBy: req.user.id });
        
        res.status(200).json({
            success: true,
            data: pickups,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching accepted pickups:', error);
        next(error);
    }
};

/**
 * @description Lista pickups pendentes (Editor/Admin)
 * @route GET /api/pickups/pending
 * @access Private (Editor/Admin)
 */
const getPendingPickups = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('roleId');

        if (user?.roleId?.name !== 'Editor' && user?.roleId?.name !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Editors and Admins can view pending pickups'
            });
        }
        
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pickups = await Pickup.find({ pickupStatus: 'pending' })
            .populate(ECOPOINT_WITH_LOCATION_POPULATE)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Pickup.countDocuments({ pickupStatus: 'pending' });
        
        res.status(200).json({
            success: true,
            data: pickups,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching pending pickups:', error);
        next(error);
    }
};

/**
 * @description Busca pickup por ID (com as doações do lote)
 * @route GET /api/pickups/:id
 * @access Private
 */
const getPickupById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const pickup = await Pickup.findById(id)
            .populate(ECOPOINT_WITH_LOCATION_POPULATE)
            .populate('pickupBy', 'username email phone')
            .lean();
        
        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: 'Pickup not found'
            });
        }
        
        pickup.donations = await getPickupDonationsForDetail(pickup);
        
        res.status(200).json({
            success: true,
            data: pickup
        });
    } catch (error) {
        console.error('Error fetching pickup:', error);
        next(error);
    }
};

/**
 * @description Aceita um pickup (Editor/Admin)
 * @route PUT /api/pickups/:id/accept
 * @access Private (Editor/Admin)
 */
const acceptPickup = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(req.user.id).populate('roleId');

        if (user?.roleId?.name !== 'Editor' && user?.roleId?.name !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Editors and Admins can accept pickups'
            });
        }
        
        const pickup = await Pickup.findById(id);
        
        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: 'Pickup not found'
            });
        }
        
        if (pickup.pickupStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot accept pickup with status: ${pickup.pickupStatus}`
            });
        }
        
        pickup.pickupStatus = 'accepted';
        pickup.pickupBy = req.user.id;
        pickup.confirmedAt = new Date();
        
        await pickup.save();
        
        await pickup.populate([ECOPOINT_WITH_LOCATION_POPULATE, 'pickupBy']);
        const data = pickup.toObject();
        data.donations = await getPickupDonations(pickup._id);
        
        res.status(200).json({
            success: true,
            message: 'Pickup accepted successfully',
            data
        });
    } catch (error) {
        console.error('Error accepting pickup:', error);
        next(error);
    }
};

/**
 * @description Completa um pickup e credita estatísticas de cada doador
 * @route PUT /api/pickups/:id/complete
 * @access Private (Quem aceitou)
 */
const completePickup = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const pickup = await Pickup.findById(id);
        
        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: 'Pickup not found'
            });
        }
        
        if (!pickup.pickupBy || pickup.pickupBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the person who accepted the pickup can complete it'
            });
        }
        
        if (pickup.pickupStatus !== 'accepted') {
            return res.status(400).json({
                success: false,
                message: `Cannot complete pickup with status: ${pickup.pickupStatus}`
            });
        }
        
        pickup.pickupStatus = 'completed';
        pickup.completedAt = new Date();
        
        await pickup.save();
        
        const donations = await Donation.find({ pickupId: pickup._id });
        
        const wasteSavedByDonor = new Map();
        for (const donation of donations) {
            if (!donation.userId) continue;
            const key = donation.userId.toString();
            wasteSavedByDonor.set(
                key,
                (wasteSavedByDonor.get(key) || 0) + donation.qtdMaterial,
            );
        }

        const userUpdates = [...wasteSavedByDonor.entries()].map(([userId, wasteSaved]) =>
            User.updateOne({ _id: userId }, { $inc: { wasteSaved } }),
        );

        if (pickup.pickupBy) {
            userUpdates.push(
                User.updateOne({ _id: pickup.pickupBy }, { $inc: { totalPickups: 1 } }),
            );
        }
        
        await Promise.all([
            Donation.updateMany({ pickupId: pickup._id }, { $set: { status: 'collected' } }),
            EcoPoint.findByIdAndUpdate(pickup.ecopointId, { status: 'open' }),
            ...userUpdates,
        ]);
        
        await pickup.populate([ECOPOINT_WITH_LOCATION_POPULATE, 'pickupBy']);
        const data = pickup.toObject();
        data.donations = await getPickupDonations(pickup._id);
        
        res.status(200).json({
            success: true,
            message: 'Pickup completed successfully',
            data
        });
    } catch (error) {
        console.error('Error completing pickup:', error);
        next(error);
    }
};

/**
 * @description Cancela um pickup, liberando as doações de volta para coleta
 * @route PUT /api/pickups/:id/cancel
 * @access Private (Quem aceitou ou Editor/Admin)
 */
const cancelPickup = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const pickup = await Pickup.findById(id);
        
        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: 'Pickup not found'
            });
        }
        
        const isAcceptor = pickup.pickupBy && pickup.pickupBy.toString() === req.user.id;
        let isPrivileged = false;
        if (!isAcceptor) {
            const user = await User.findById(req.user.id).populate('roleId');
            isPrivileged = !!user && (user.roleId.name === 'Editor' || user.roleId.name === 'Admin');
        }
        
        if (!isAcceptor && !isPrivileged) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel pickups you accepted (or as Editor/Admin)'
            });
        }
        
        if (pickup.pickupStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed pickup'
            });
        }
        
        if (pickup.pickupStatus === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Pickup is already cancelled'
            });
        }
        
        const replacementPickup = await cancelPickupWithReplacement(pickup);

        await pickup.populate([ECOPOINT_WITH_LOCATION_POPULATE, 'pickupBy']);
        await replacementPickup.populate(ECOPOINT_WITH_LOCATION_POPULATE);

        res.status(200).json({
            success: true,
            message: 'Pickup cancelled successfully',
            data: pickup,
            replacementPickup,
        });
    } catch (error) {
        console.error('Error cancelling pickup:', error);
        next(error);
    }
};

/**
 * @description Atualiza status do pickup (Admin)
 * @route PUT /api/pickups/:id/status
 * @access Private (Admin)
 */
const updatePickupStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { pickupStatus } = req.body;
        
        const user = await User.findById(req.user.id).populate('roleId');

        if (user?.roleId?.name !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admins can manually update pickup status'
            });
        }
        
        const pickup = await Pickup.findById(id);
        
        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: 'Pickup not found'
            });
        }
        
        const previousStatus = pickup.pickupStatus;
        let replacementPickup = null;

        if (
            pickupStatus === 'cancelled'
            && previousStatus !== 'cancelled'
            && previousStatus !== 'completed'
        ) {
            replacementPickup = await cancelPickupWithReplacement(pickup);
        } else {
            pickup.pickupStatus = pickupStatus;

            if (pickupStatus === 'completed' && !pickup.completedAt) {
                pickup.completedAt = new Date();
            }

            if (pickupStatus === 'cancelled' && !pickup.cancelledAt) {
                pickup.cancelledAt = new Date();
            }

            await pickup.save();
        }

        const responsePickup = replacementPickup || pickup;

        await responsePickup.populate([ECOPOINT_WITH_LOCATION_POPULATE, 'pickupBy']);

        if (replacementPickup) {
            await pickup.populate([ECOPOINT_WITH_LOCATION_POPULATE, 'pickupBy']);
        }

        res.status(200).json({
            success: true,
            message: 'Pickup status updated successfully',
            data: replacementPickup ? pickup : responsePickup,
            ...(replacementPickup ? { replacementPickup } : {}),
        });
    } catch (error) {
        console.error('Error updating pickup status:', error);
        next(error);
    }
};

/**
 * @description Deleta pickup (Admin), desvinculando suas doações
 * @route DELETE /api/pickups/:id
 * @access Private (Admin)
 */
const deletePickup = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(req.user.id).populate('roleId');

        if (user?.roleId?.name !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only Admins can delete pickups'
            });
        }
        
        const pickup = await Pickup.findById(id);
        
        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: 'Pickup not found'
            });
        }
        
        await Donation.updateMany(
            { pickupId: pickup._id },
            { $set: { pickupId: null, status: 'pending' } }
        );
        
        await Pickup.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Pickup deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting pickup:', error);
        next(error);
    }
};

module.exports = {
    getAllPickups,
    getMyPickups,
    getAcceptedPickups,
    getPendingPickups,
    getPickupById,
    acceptPickup,
    completePickup,
    cancelPickup,
    updatePickupStatus,
    deletePickup
};
