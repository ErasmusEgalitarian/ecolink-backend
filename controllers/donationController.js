const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const Media = require('../models/Media');
const User = require('../models/User');
const EcoPoint = require('../models/EcoPoint');
const { ECOPOINT_WITH_LOCATION_POPULATE } = require('../utils/locationHelpers');

const getOrCreateOpenPickup = async (ecopointId) => {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await Pickup.findOneAndUpdate(
                { ecopointId, pickupStatus: 'pending' },
                { $setOnInsert: { ecopointId, pickupStatus: 'pending', createdAt: new Date() } },
                { new: true, upsert: true }
            );
        } catch (error) {
            if (error.code === 11000 && attempt === 0) continue;
            throw error;
        }
    }
};

/**
 * @description Cria uma nova doação e a anexa ao lote de coleta aberto do ecoponto
 * @route POST /api/donation
 * @access Private
 */
const createDonation = async (req, res, next) => {
    try {
        const { ecopointId, materialType, description = '', qtdMaterial, mediaId } = req.body;

        if (mediaId) {
            const mediaExists = await Media.findById(mediaId);
            if (!mediaExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Media not found',
                    error: `Media with ID ${mediaId} does not exist`
                });
            }
        }

        const ecopoint = await EcoPoint.findById(ecopointId);
        if (!ecopoint) {
            return res.status(404).json({
                success: false,
                message: 'EcoPoint not found'
            });
        }

        if (!ecopoint.acceptedMaterials.includes(materialType)) {
            return res.status(400).json({
                success: false,
                message: `EcoPoint does not accept material type: ${materialType}`
            });
        }

        if (ecopoint.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: `EcoPoint is not available for donations (status: ${ecopoint.status})`
            });
        }

        const pickup = await getOrCreateOpenPickup(ecopointId);

        const donation = new Donation({
            userId: req.user.id,
            ecopointId,
            materialType,
            description,
            qtdMaterial,
            pickupId: pickup._id,
            ...(mediaId ? { mediaId } : {}),
        });

        const savedDonation = await donation.save();

        if (savedDonation.mediaId) {
            await savedDonation.populate('mediaId');
        }

        res.status(201).json({
            success: true,
            message: 'Donation registered and attached to ecopoint pickup successfully',
            donation: savedDonation,
            pickup
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
            .populate(ECOPOINT_WITH_LOCATION_POPULATE)
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
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { userId: req.user.id };

        if (startDate || endDate) {
            filter.donationDate = {};
            if (startDate) {
                filter.donationDate.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.donationDate.$lt = new Date(endDate);
            }
        }

        const donations = await Donation.find(filter)
            .populate('mediaId')
            .populate(ECOPOINT_WITH_LOCATION_POPULATE)
            .sort({ donationDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Donation.countDocuments(filter);
        
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
        
        if (!donation.userId || donation.userId.toString() !== req.user.id) {
            const user = await User.findById(req.user.id).populate('roleId');

            if (user?.roleId?.name !== 'Admin') {
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

module.exports = {
    createDonation,
    getAllDonations,
    getMyDonations,
    getDonationById,
    updateDonation
};
