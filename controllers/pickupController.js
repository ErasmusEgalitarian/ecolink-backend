const Pickup = require('../models/Pickup');
const Donation = require('../models/Donation');
const User = require('../models/User');

/**
 * @description Lista todos os pickups (com filtros)
 * @route GET /api/pickups
 * @access Private
 */
const getAllPickups = async (req, res, next) => {
    try {
        const { pickupStatus, userId, page = 1, limit = 10 } = req.query;
        
        const filters = {};
        if (pickupStatus) filters.pickupStatus = pickupStatus;
        if (userId) filters.userId = userId;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pickups = await Pickup.find(filters)
            .populate('userId', 'username email phone')
            .populate('pickupBy', 'username email phone')
            .populate({
                path: 'donationId',
                populate: { path: 'mediaId' }
            })
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
 * @description Lista pickups do usuário autenticado (criados por ele)
 * @route GET /api/pickups/my
 * @access Private
 */
const getMyPickups = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pickups = await Pickup.find({ userId: req.user.id })
            .populate('pickupBy', 'username email phone')
            .populate({
                path: 'donationId',
                populate: { path: 'mediaId' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Pickup.countDocuments({ userId: req.user.id });
        
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
            .populate('userId', 'username email phone address')
            .populate({
                path: 'donationId',
                populate: { path: 'mediaId' }
            })
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
        
        if (!user || (user.roleId.name !== 'Editor' && user.roleId.name !== 'Admin')) {
            return res.status(403).json({
                success: false,
                message: 'Only Editors and Admins can view pending pickups'
            });
        }
        
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const pickups = await Pickup.find({ pickupStatus: 'pending' })
            .populate('userId', 'username email phone address')
            .populate({
                path: 'donationId',
                populate: { path: 'mediaId' }
            })
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
 * @description Busca pickup por ID
 * @route GET /api/pickups/:id
 * @access Private
 */
const getPickupById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const pickup = await Pickup.findById(id)
            .populate('userId', 'username email phone address')
            .populate('pickupBy', 'username email phone')
            .populate({
                path: 'donationId',
                populate: { path: 'mediaId' }
            })
            .lean();
        
        if (!pickup) {
            return res.status(404).json({
                success: false,
                message: 'Pickup not found'
            });
        }
        
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
        
        if (!user || (user.roleId.name !== 'Editor' && user.roleId.name !== 'Admin')) {
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
        
        await pickup.populate(['userId', 'pickupBy', 'donationId']);
        
        res.status(200).json({
            success: true,
            message: 'Pickup accepted successfully',
            data: pickup
        });
    } catch (error) {
        console.error('Error accepting pickup:', error);
        next(error);
    }
};

/**
 * @description Completa um pickup
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
        
        // Atualizar estatísticas do usuário
        const donation = await Donation.findById(pickup.donationId);
        if (donation) {
            await User.updateOne(
                { _id: pickup.userId },
                {
                    $inc: {
                        totalPickups: 1,
                        wasteSaved: donation.qtdMaterial
                    }
                }
            );
        }
        
        await pickup.populate(['userId', 'pickupBy', 'donationId']);
        
        res.status(200).json({
            success: true,
            message: 'Pickup completed successfully',
            data: pickup
        });
    } catch (error) {
        console.error('Error completing pickup:', error);
        next(error);
    }
};

/**
 * @description Cancela um pickup
 * @route PUT /api/pickups/:id/cancel
 * @access Private (Criador ou quem aceitou)
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
        
        // Verificar permissão
        const isCreator = pickup.userId.toString() === req.user.id;
        const isAcceptor = pickup.pickupBy && pickup.pickupBy.toString() === req.user.id;
        
        if (!isCreator && !isAcceptor) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel pickups you created or accepted'
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
        
        pickup.pickupStatus = 'cancelled';
        pickup.cancelledAt = new Date();
        
        await pickup.save();
        
        await pickup.populate(['userId', 'pickupBy', 'donationId']);
        
        res.status(200).json({
            success: true,
            message: 'Pickup cancelled successfully',
            data: pickup
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
        
        if (!user || user.roleId.name !== 'Admin') {
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
        
        pickup.pickupStatus = pickupStatus;
        
        if (pickupStatus === 'completed' && !pickup.completedAt) {
            pickup.completedAt = new Date();
        }
        
        if (pickupStatus === 'cancelled' && !pickup.cancelledAt) {
            pickup.cancelledAt = new Date();
        }
        
        await pickup.save();
        
        await pickup.populate(['userId', 'pickupBy', 'donationId']);
        
        res.status(200).json({
            success: true,
            message: 'Pickup status updated successfully',
            data: pickup
        });
    } catch (error) {
        console.error('Error updating pickup status:', error);
        next(error);
    }
};

/**
 * @description Deleta pickup (Admin)
 * @route DELETE /api/pickups/:id
 * @access Private (Admin)
 */
const deletePickup = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(req.user.id).populate('roleId');
        
        if (!user || user.roleId.name !== 'Admin') {
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
