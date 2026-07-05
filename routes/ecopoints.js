const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const {
    getAvailableEcopoints,
    getEcopointByQrCode
} = require('../controllers/ecopointController');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

// ==================== READ ====================
router.get('/by-qrcode/:qrCode', authenticated, getEcopointByQrCode);
router.get('/available', authenticated, getAvailableEcopoints);

module.exports = router;
