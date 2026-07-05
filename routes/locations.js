const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const {
    getAvailableLocations,
    getLocationById
} = require('../controllers/locationController');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

router.get('/available', authenticated, getAvailableLocations);
router.get('/:id', authenticated, getLocationById);

module.exports = router;
