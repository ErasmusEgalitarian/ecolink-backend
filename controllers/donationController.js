const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const Media = require('../models/Media');
const User = require('../models/User');

/**
 * @description Cria uma nova doação (e pickup automático)
 * @route POST /api/donation
 * @access Private
 */
const createDonation = async (req, res, next) => {
    try {
        const { ecopointId, materialType, description = '', qtdMaterial, mediaId } = req.body;

        const mediaExists = await Media.findById(mediaId);
        if (!mediaExists) {
            return res.status(404).json({ 
                success: false,
                message: 'Media not found',
                error: `Media with ID ${mediaId} does not exist` 
            });
        }

        const donation = new Donation({
            userId: req.user.id, 
            ecopointId,
            materialType,
            description,
            qtdMaterial,
            mediaId: mediaId, 
        });

        const savedDonation = await donation.save();
        
        const pickup = new Pickup({
            donationId: savedDonation._id,
            userId: req.user.id,
        });

        const savedPickup = await pickup.save();

        await savedDonation.populate('mediaId');

        res.status(201).json({
            success: true,
            message: 'Donation and pickup created successfully',
            donation: savedDonation,
            pickup: savedPickup
        });
    } catch (error) {
        console.error('Error saving donation:', error);
        next(error);
    }
};

/**
 * @description Lista todas as doações (com filtros)
 * @route GET /api/donation
 * @access Private
 */
const getAllDonations = async (req, res, next) => {
    try {
        const { materialType, userId, page = 1, limit = 10 } = req.query;
        
        const filters = {};
        if (materialType) filters.materialType = materialType;
        if (userId) filters.userId = userId;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const donations = await Donation.find(filters)
            .populate('userId', 'username email')
            .populate('mediaId')
            .sort({ donationDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Donation.countDocuments(filters);
        
        res.status(200).json({
            success: true,
            data: donations,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching donations:', error);
        next(error);
    }
};

/**
 * @description Lista doações do usuário autenticado
 * @route GET /api/donation/my
 * @access Private
 */
const getMyDonations = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const donations = await Donation.find({ userId: req.user.id })
            .populate('mediaId')
            .sort({ donationDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await Donation.countDocuments({ userId: req.user.id });
        
        res.status(200).json({
            success: true,
            data: donations,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching user donations:', error);
        next(error);
    }
};

/**
 * @description Busca doação por ID
 * @route GET /api/donation/:id
 * @access Private
 */
const getDonationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const donation = await Donation.findById(id)
            .populate('userId', 'username email phone')
            .populate('mediaId')
            .lean();
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: donation
        });
    } catch (error) {
        console.error('Error fetching donation:', error);
        next(error);
    }
};

/**
 * @description Atualiza doação
 * @route PUT /api/donation/:id
 * @access Private (Dono ou Admin)
 */
const updateDonation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { materialType, description, qtdMaterial } = req.body;
        
        const donation = await Donation.findById(id);
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        // Verificar se o usuário é o dono ou Admin
        if (donation.userId.toString() !== req.user.id) {
            const user = await User.findById(req.user.id).populate('roleId');
            
            if (!user || user.roleId.name !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own donations'
                });
            }
        }
        
        // Atualizar campos
        if (materialType) donation.materialType = materialType;
        if (description !== undefined) donation.description = description;
        if (qtdMaterial) donation.qtdMaterial = qtdMaterial;
        
        await donation.save();
        
        await donation.populate(['userId', 'mediaId']);
        
        res.status(200).json({
            success: true,
            message: 'Donation updated successfully',
            data: donation
        });
    } catch (error) {
        console.error('Error updating donation:', error);
        next(error);
    }
};

/**
 * @description Deleta doação (e pickup associado)
 * @route DELETE /api/donation/:id
 * @access Private (Dono ou Admin)
 */
const deleteDonation = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const donation = await Donation.findById(id);
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        // Verificar se o usuário é o dono ou Admin
        if (donation.userId.toString() !== req.user.id) {
            const user = await User.findById(req.user.id).populate('roleId');
            
            if (!user || user.roleId.name !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete your own donations'
                });
            }
        }
        
        // Deletar pickup associado
        await Pickup.deleteOne({ donationId: id });
        
        // Deletar doação
        await Donation.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Donation and associated pickup deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting donation:', error);
        next(error);
    }
};

module.exports = {
    createDonation,
    getAllDonations,
    getMyDonations,
    getDonationById,
    updateDonation,
    deleteDonation
};
