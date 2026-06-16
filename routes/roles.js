const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const {
    getAllRoles,
    changeUserRole
} = require('../controllers/roleController');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

// ==================== READ ====================
router.get('/', authenticated, getAllRoles);

// ==================== UPDATE ====================
router.put('/edit/:userId', authenticated, changeUserRole);

module.exports = router;
