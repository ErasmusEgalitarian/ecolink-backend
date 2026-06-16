const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const { updatePickupStatusSchema, acceptPickupSchema } = require('../schemas/pickupSchemas');
const {
    getAllPickups,
    getMyPickups,
    getAcceptedPickups,
    getPendingPickups,
    getPickupById,
    acceptPickup,
    completePickup,
    cancelPickup,
    updatePickupStatus,
    deletePickup
} = require('../controllers/pickupController');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

// ==================== READ ====================
router.get('/', authenticated, getAllPickups);
router.get('/my', authenticated, getMyPickups);
router.get('/accepted', authenticated, getAcceptedPickups);
router.get('/pending', authenticated, getPendingPickups);
router.get('/:id', authenticated, getPickupById);

// ==================== UPDATE ====================
router.put('/:id/accept', authenticated, validate(acceptPickupSchema), acceptPickup);
router.put('/:id/complete', authenticated, completePickup);
router.put('/:id/cancel', authenticated, cancelPickup);
router.put('/:id/status', authenticated, validate(updatePickupStatusSchema), updatePickupStatus);

// ==================== DELETE ====================
router.delete('/:id', authenticated, deletePickup);

module.exports = router;
