const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const Media = require('../models/Media');
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/authMiddleware');
const { createDonationSchema } = require('../schemas/donationSchemas');

router.post('/', verifyToken, validate(createDonationSchema), async (req, res) => {
    try {

        const { ecopointId, materialType, description = '', qtdMaterial, mediaId } = req.body;

        const mediaExists = await Media.findById(mediaId);
        if (!mediaExists) {
            return res.status(404).json({ 
                message: 'Media not found',
                error: `Media with ID ${mediaId} does not exist` 
            });
        }

        const donation = new Donation({
            userId: req.user.id, 
            ecopointId,
            materialType,
            description,
            qtdMaterial,
            mediaId: mediaId, 
        });

        const savedDonation = await donation.save();
        
        const pickup = new Pickup({
            donationId: savedDonation._id,
            userId: req.user.id,
        });

        const savedPickup = await pickup.save();

        await savedDonation.populate('mediaId');

        res.status(201).json({
            message: 'Donation and pickup created successfully',
            donation: savedDonation,
            pickup: savedPickup
        });
    } catch (error) {
        console.error('Error saving donation:', error);
        res.status(500).json({ message: 'Error saving donation', error: error.message });
    }
});

module.exports = router;
