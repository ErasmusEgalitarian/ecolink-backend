const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');
const MediaDeletionLog = require('../models/MediaDeletionLog');

const uploadDir = path.join(__dirname, '..', 'uploads');

const activeMediaFilter = {
    $or: [{ deleted: false }, { deleted: { $exists: false } }],
};

/**
 * @description Upload de arquivo
 * @route POST /media/upload
 * @access Private
 */
const uploadMedia = async (req, res, next) => {
    try {
        const { category } = req.body;

        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'File not sent' 
            });
        }

        const media = new Media({
            filename: req.file.filename,
            path: req.file.path,
            type: req.file.mimetype,
            category
        });

        await media.save();
        
        const mediaWithUrl = {
            ...media.toObject(),
            url: `${req.protocol}://${req.get('host')}/uploads/${media.filename}`
        };
        
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: mediaWithUrl
        });
    } catch (err) {
        console.error('Upload media error:', err);
        next(err);
    }
};

/**
 * @description Lista todas as mídias (com filtros e paginação)
 * @route GET /media
 * @access Private
 */
const getAllMedia = async (req, res, next) => {
    try {
        const { category, date, page = 1, limit = 20 } = req.query;

        const filters = { ...activeMediaFilter };
        if (category) filters.category = category;
        if (date) filters.uploadedAt = { $gte: new Date(date) };
        
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const mediasFromDB = await Media.find(filters)
            .sort({ uploadedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const filesOnDisk = fs.readdirSync(uploadDir);

        const filteredMedias = mediasFromDB
            .filter(media => filesOnDisk.includes(media.filename))
            .map(media => ({
                ...media,
                url: `${req.protocol}://${req.get('host')}/uploads/${media.filename}`
            }));
        
        const total = await Media.countDocuments(filters);

        res.status(200).json({
            success: true,
            data: filteredMedias,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Get media error:', err);
        next(err);
    }
};

/**
 * @description Lista categorias disponíveis
 * @route GET /media/categories
 * @access Public
 */
const getCategories = (req, res) => {
    const categories = ['Collect', 'Storage', 'Visit']; 
    
    res.status(200).json({
        success: true,
        data: categories
    });
};

/**
 * @description Busca mídia por ID
 * @route GET /media/:id
 * @access Private
 */
const getMediaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const media = await Media.findOne({ _id: id, ...activeMediaFilter }).lean();
        
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }
        
        // Verificar se o arquivo existe no disco
        const filePath = path.join(uploadDir, media.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on disk'
            });
        }
        
        const mediaWithUrl = {
            ...media,
            url: `${req.protocol}://${req.get('host')}/uploads/${media.filename}`
        };
        
        res.status(200).json({
            success: true,
            data: mediaWithUrl
        });
    } catch (err) {
        console.error('Get media by ID error:', err);
        next(err);
    }
};

/**
 * @description Atualiza categoria da mídia
 * @route PUT /media/:id
 * @access Private
 */
const updateMedia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { category } = req.body;
        
        const media = await Media.findOne({ _id: id, ...activeMediaFilter });
        
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }
        
        media.category = category;
        await media.save();
        
        const mediaWithUrl = {
            ...media.toObject(),
            url: `${req.protocol}://${req.get('host')}/uploads/${media.filename}`
        };
        
        res.status(200).json({
            success: true,
            message: 'Media category updated successfully',
            data: mediaWithUrl
        });
    } catch (err) {
        console.error('Update media error:', err);
        next(err);
    }
};

/**
 * @description Deleta mídia (arquivo e registro)
 * @route DELETE /media/:id
 * @access Private
 */
const deleteMedia = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const media = await Media.findOne({ _id: id, ...activeMediaFilter });
        
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }
        
        const Donation = require('../models/Donation');
        const donationUsingMedia = await Donation.findOne({ mediaId: id });
        
        if (donationUsingMedia) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete media that is being used in a donation'
            });
        }

        const relativePath = media.path
            ? media.path.replace(/^.*uploads[\\/]/, '')
            : media.filename;
        const filePath = path.join(uploadDir, relativePath.split('/').pop());

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        media.deleted = true;
        media.deletedAt = new Date();
        await media.save();

        await MediaDeletionLog.create({
            filename: media.filename,
            path: relativePath,
            type: media.type,
            category: media.category,
            reason: 'manual',
            deletedByUserId: req.user?.id || null,
            mediaId: media._id,
            originalUploadedAt: media.uploadedAt || null,
        });
        
        res.status(200).json({
            success: true,
            message: 'Media marked as deleted and file removed successfully'
        });
    } catch (err) {
        console.error('Delete media error:', err);
        next(err);
    }
};

module.exports = {
    uploadMedia,
    getAllMedia,
    getCategories,
    getMediaById,
    updateMedia,
    deleteMedia
};
