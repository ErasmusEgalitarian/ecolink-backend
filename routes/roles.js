const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();
const Role = require('../models/Role');
const User = require('../models/User');
const mongoose = require('mongoose');

// Protected route: Get all roles
router.get('/', verifyToken, async (req, res) => {
    try {
        const roles = await Role.find();
        if(roles) res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

/**
 * @api {put} /users/:userId/role Change user role
 * @apiPermission admin
 * 
 * @apiHeader {String} Authorization Token (Bearer token)
 * 
 * @apiParam {String} userId ID of the user whose role will be changed
 * @apiParam {String} roleId ID of the new role that will be assigned
 */
router.put('/edit/:userId', verifyToken, async (req, res) => {
    try {
        
        const adminUser = await User.findById(req.user.id).populate('roleId');
        if (!adminUser || adminUser.roleId.name !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. Only administrators can perform this action.' });
        }

        const { userId } = req.params;
        const { roleId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({ error: 'Provided IDs are invalid.' });
        }

        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(404).json({ error: 'Role not found.' });
        }

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
         return res.status(404).json({ error: 'User not found.' });
        }

        if (userToUpdate._id.equals(adminUser._id) && roleId !== adminUser.roleId._id) 
            return res.status(403).json({ error: 'Administrators cannot change their own access level.' });

        userToUpdate.roleId = roleId;
        await userToUpdate.save();

        const updatedUser = await User.findById(userId)
            .select('-password -__v')
            .populate('roleId');

        res.status(200).json({
            success: true,
            message: 'Access level updated successfully.',
            user: updatedUser
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


module.exports = router;
