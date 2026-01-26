const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../config/multer');
const {
    uploadMedia,
    getAllMedia,
    getCategories,
    getMediaById,
    updateMedia,
    deleteMedia
} = require('../controllers/mediaController');

// ==================== CREATE ====================
router.post('/upload', verifyToken, upload.single('file'), uploadMedia);

// ==================== READ ====================
router.get('/', verifyToken, getAllMedia);
router.get('/categories', verifyToken, getCategories);
router.get('/:id', verifyToken, getMediaById);

// ==================== UPDATE ====================
router.put('/:id', verifyToken, updateMedia);

// ==================== DELETE ====================
router.delete('/:id', verifyToken, deleteMedia);

module.exports = router;
