const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const { createDonationSchema, updateDonationSchema } = require('../schemas/donationSchemas');
const {
    createDonation,
    getAllDonations,
    getMyDonations,
    getDonationById,
    updateDonation
} = require('../controllers/donationController');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

// ==================== CREATE ====================
router.post('/', authenticated, validate(createDonationSchema), createDonation);

// ==================== READ ====================
router.get('/', authenticated, getAllDonations);
router.get('/my', authenticated, getMyDonations);
router.get('/:id', authenticated, getDonationById);

// ==================== UPDATE ====================
router.put('/:id', authenticated, validate(updateDonationSchema), updateDonation);

module.exports = router;
