const bcrypt = require('bcrypt');
const User = require('../models/User');
const { resolveImageUrl } = require('../utils/publicUrl');
const { getProfileAvatarRelativePath } = require('../utils/profileHelpers');

const serializeUserProfile = (user, req) => {
    const data = user?.toObject ? user.toObject() : { ...user };
    data.avatarUrl = resolveImageUrl(data.avatarPath, req);
    return data;
};

const anonymizeUserDonations = async (userId) => {
    const Donation = require('../models/Donation');
    await Donation.updateMany(
        { userId },
        { $set: { userId: null, anonymized: true } }
    );
};

/**
 * @description Busca perfil do usuário autenticado
 * @route GET /api/users/me
 * @access Private
 */
const getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -__v')
            .populate('roleId')
            .lean();
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: serializeUserProfile(user, req)
        });
    } catch (err) {
        console.error('Get user details error:', err);
        next(err);
    }
};

/**
 * @description Busca usuário por ID
 * @route GET /api/users/:id
 * @access Private (Admin ou próprio usuário)
 */
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Verificar se é o próprio usuário ou Admin
        if (id !== req.user.id) {
            const adminUser = await User.findById(req.user.id).populate('roleId');
            if (!adminUser || adminUser.roleId.name !== 'Admin') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Access denied' 
                });
            }
        }
        
        const user = await User.findById(id)
            .select('-password -__v')
            .populate('roleId')
            .lean();
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: serializeUserProfile(user, req)
        });
    } catch (err) {
        console.error('Get user by ID error:', err);
        next(err);
    }
};

/**
 * @description Lista todos os usuários
 * @route GET /api/users
 * @access Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
    try {
        const adminUser = await User.findById(req.user.id).populate('roleId');
        if (!adminUser || adminUser.roleId.name !== 'Admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Access denied. Only administrators can perform this action.' 
            });
        }

        const { page = 1, limit = 10, roleId } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const filters = {};
        if (roleId) filters.roleId = roleId;

        const users = await User.find(filters)
            .select('-password -__v')
            .populate('roleId')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await User.countDocuments(filters);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Get all users error:', err);
        next(err);
    }
};

/**
 * @description Atualiza perfil do usuário autenticado
 * @route PUT /api/users/me
 * @access Private
 */
const updateMyProfile = async (req, res, next) => {
    try {
        const { username, address, phone } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        if (username !== undefined && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Username already in use' 
                });
            }
            user.username = username;
        }
        
        if (address !== undefined) {
            user.address = address;
        }

        if (phone !== undefined) {
            user.phone = String(phone).replace(/\D/g, '');
        }
        
        await user.save();
        
        const updatedUser = await User.findById(req.user.id)
            .select('-password -__v')
            .populate('roleId');
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: serializeUserProfile(updatedUser, req)
        });
    } catch (err) {
        console.error('Update profile error:', err);
        next(err);
    }
};

/**
 * @description Upload da foto de perfil do usuário autenticado
 * @route POST /api/users/me/avatar
 * @access Private
 */
const uploadProfileAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Profile image not sent',
            });
        }

        const user = req.profileUser || await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.avatarPath = getProfileAvatarRelativePath(req.file.filename);
        await user.save();

        const updatedUser = await User.findById(req.user.id)
            .select('-password -__v')
            .populate('roleId');

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: serializeUserProfile(updatedUser, req),
        });
    } catch (err) {
        console.error('Upload profile avatar error:', err);
        next(err);
    }
};

/**
 * @description Altera senha do usuário autenticado
 * @route PUT /api/users/me/password
 * @access Private
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        // Verificar senha atual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Current password is incorrect' 
            });
        }
        
        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (err) {
        console.error('Change password error:', err);
        next(err);
    }
};

/**
 * @description Deleta conta do usuário autenticado
 * @route DELETE /api/users/me
 * @access Private
 */
const deleteMyAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        await anonymizeUserDonations(req.user.id);
        
        await User.findByIdAndDelete(req.user.id);
        
        res.status(200).json({
            success: true,
            message: 'Account and all associated data deleted successfully'
        });
    } catch (err) {
        console.error('Delete account error:', err);
        next(err);
    }
};

/**
 * @description Deleta usuário por ID
 * @route DELETE /api/users/:id
 * @access Private (Admin)
 */
const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const adminUser = await User.findById(req.user.id).populate('roleId');
        if (!adminUser || adminUser.roleId.name !== 'Admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Only administrators can delete users' 
            });
        }
        
        // Impedir que Admin delete a si mesmo
        if (id === req.user.id) {
            return res.status(400).json({ 
                success: false,
                message: 'You cannot delete your own account' 
            });
        }
        
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        await anonymizeUserDonations(id);
        
        await User.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (err) {
        console.error('Delete user by ID error:', err);
        next(err);
    }
};

module.exports = {
    getMyProfile,
    getUserById,
    getAllUsers,
    updateMyProfile,
    uploadProfileAvatar,
    changePassword,
    deleteMyAccount,
    deleteUserById
};
