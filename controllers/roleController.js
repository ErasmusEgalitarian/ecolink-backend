const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');

/**
 * @description Lista todas as roles
 * @route GET /api/roles
 * @access Private
 */
const getAllRoles = async (req, res, next) => {
    try {
        const roles = await Role.find();
        
        res.status(200).json({
            success: true,
            data: roles
        });
    } catch (err) {
        console.error('Get roles error:', err);
        next(err);
    }
};

/**
 * @description Altera role de um usuário
 * @route PUT /api/roles/edit/:userId
 * @access Private (Admin)
 */
const changeUserRole = async (req, res, next) => {
    try {
        const adminUser = await User.findById(req.user.id).populate('roleId');
        if (!adminUser || adminUser.roleId.name !== 'Admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Access denied. Only administrators can perform this action.' 
            });
        }

        const { userId } = req.params;
        const { roleId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roleId)) {
            return res.status(400).json({ 
                success: false,
                error: 'Provided IDs are invalid.' 
            });
        }

        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(404).json({ 
                success: false,
                error: 'Role not found.' 
            });
        }

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found.' 
            });
        }

        if (userToUpdate._id.equals(adminUser._id) && roleId !== adminUser.roleId._id.toString()) {
            return res.status(403).json({ 
                success: false,
                error: 'Administrators cannot change their own access level.' 
            });
        }

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
        console.error('Edit user role error:', err);
        next(err);
    }
};

module.exports = {
    getAllRoles,
    changeUserRole
};
