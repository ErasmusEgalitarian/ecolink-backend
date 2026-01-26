const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/authMiddleware');
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

// ==================== READ ====================
router.get('/', verifyToken, getAllPickups);
router.get('/my', verifyToken, getMyPickups);
router.get('/accepted', verifyToken, getAcceptedPickups);
router.get('/pending', verifyToken, getPendingPickups);
router.get('/:id', verifyToken, getPickupById);

// ==================== UPDATE ====================
router.put('/:id/accept', verifyToken, validate(acceptPickupSchema), acceptPickup);
router.put('/:id/complete', verifyToken, completePickup);
router.put('/:id/cancel', verifyToken, cancelPickup);
router.put('/:id/status', verifyToken, validate(updatePickupStatusSchema), updatePickupStatus);

// ==================== DELETE ====================
router.delete('/:id', verifyToken, deletePickup);

module.exports = router;
