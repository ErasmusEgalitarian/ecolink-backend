const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();
const User = require('../models/User');

// Protected route: Get user details
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
        };
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all (only for admin)
router.get('/', verifyToken, async (req, res) => {
    try {
    
        const adminUser = await User.findById(req.user.id).populate('roleId');
        if (!adminUser || adminUser.roleId.name !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. Only administrators can perform this action.' });
        }

        const users = await User.find()
            .select('-password -__v')
            .populate('roleId');

        res.status(200).json(users);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
