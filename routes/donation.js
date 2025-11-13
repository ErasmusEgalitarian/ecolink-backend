const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const validate = require('../middlewares/validate');
const { createDonationSchema } = require('../schemas/donationSchemas');

// Route to create a donation
router.post('/', validate(createDonationSchema), async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Log the incoming request

        const { userId, materialType, description = '', qtdMaterial } = req.body;

        // Create a new donation
        const donation = new Donation({
            userId,
            materialType,
            description,
            qtdMaterial,
        });

        // Save to database
        const savedDonation = await donation.save();
        res.status(201).json(savedDonation);
    } catch (error) {
        res.status(500).json({ message: 'Error saving donation', error });
    }
});

module.exports = router;
