const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/authMiddleware');
const { createDonationSchema, updateDonationSchema } = require('../schemas/donationSchemas');
const {
    createDonation,
    getAllDonations,
    getMyDonations,
    getDonationById,
    updateDonation,
    deleteDonation
} = require('../controllers/donationController');

// ==================== CREATE ====================
router.post('/', verifyToken, validate(createDonationSchema), createDonation);

// ==================== READ ====================
router.get('/', verifyToken, getAllDonations);
router.get('/my', verifyToken, getMyDonations);
router.get('/:id', verifyToken, getDonationById);

// ==================== UPDATE ====================
router.put('/:id', verifyToken, validate(updateDonationSchema), updateDonation);

// ==================== DELETE ====================
router.delete('/:id', verifyToken, deleteDonation);

module.exports = router;
