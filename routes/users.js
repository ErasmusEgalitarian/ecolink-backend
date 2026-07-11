const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { updateUserProfileSchema, changePasswordSchema } = require('../schemas/userSchemas');
const {
    getMyProfile,
    getUserById,
    getAllUsers,
    updateMyProfile,
    uploadProfileAvatar,
    changePassword,
    deleteMyAccount,
    deleteUserById
} = require('../controllers/userController');
const {
    loadProfileMatricula,
    profileImageUpload,
} = require('../middlewares/profileImageUpload');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

// ==================== READ ====================
router.get('/me', authenticated, getMyProfile);
router.get('/:id', authenticated, getUserById);
router.get('/', authenticated, getAllUsers);

// ==================== UPDATE ====================
router.put('/me', authenticated, validate(updateUserProfileSchema), updateMyProfile);
router.post(
    '/me/avatar',
    authenticated,
    loadProfileMatricula,
    profileImageUpload.single('file'),
    uploadProfileAvatar,
);
router.put('/me/password', authenticated, validate(changePasswordSchema), changePassword);

// ==================== DELETE ====================
router.delete('/me', authenticated, deleteMyAccount);
router.delete('/:id', authenticated, deleteUserById);

module.exports = router;
