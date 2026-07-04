const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const { getAvailableEcopoints } = require('../controllers/ecopointController');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

// ==================== READ ====================
router.get('/available', authenticated, getAvailableEcopoints);

module.exports = router;
