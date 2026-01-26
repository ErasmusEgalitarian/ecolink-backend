const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { updateUserProfileSchema, changePasswordSchema } = require('../schemas/userSchemas');
const {
    getMyProfile,
    getUserById,
    getAllUsers,
    updateMyProfile,
    changePassword,
    deleteMyAccount,
    deleteUserById
} = require('../controllers/userController');

// ==================== READ ====================
router.get('/me', verifyToken, getMyProfile);
router.get('/:id', verifyToken, getUserById);
router.get('/', verifyToken, getAllUsers);

// ==================== UPDATE ====================
router.put('/me', verifyToken, validate(updateUserProfileSchema), updateMyProfile);
router.put('/me/password', verifyToken, validate(changePasswordSchema), changePassword);

// ==================== DELETE ====================
router.delete('/me', verifyToken, deleteMyAccount);
router.delete('/:id', verifyToken, deleteUserById);

module.exports = router;
