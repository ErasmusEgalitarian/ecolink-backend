const express = require('express');

const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles'); //role authorization middleware

const router = express.Router();

// Protected route: Get user details
router.get('/me', verifyToken, authorizeRoles('external', 'admin'), async (req, res) => {
    try {
        const user = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
        };
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
