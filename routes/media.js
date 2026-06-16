const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const upload = require('../config/multer');
const {
    uploadMedia,
    getAllMedia,
    getCategories,
    getMediaById,
    updateMedia,
    deleteMedia
} = require('../controllers/mediaController');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

// ==================== CREATE ====================
router.post('/upload', authenticated, upload.single('file'), uploadMedia);

// ==================== READ ====================
router.get('/', authenticated, getAllMedia);
router.get('/categories', authenticated, getCategories);
router.get('/:id', authenticated, getMediaById);

// ==================== UPDATE ====================
router.put('/:id', authenticated, updateMedia);

// ==================== DELETE ====================
router.delete('/:id', authenticated, deleteMedia);

module.exports = router;
