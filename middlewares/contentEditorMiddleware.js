const User = require('../models/User');
const { ADMIN_ROLE_ID, EDITOR_ROLE_ID } = require('../constants/roles');

const canManageContent = (user) => {
    if (!user) {
        return false;
    }

    const roleId = user.roleId?._id?.toString() || user.roleId?.toString();
    const roleName = user.roleId?.name;

    return roleId === EDITOR_ROLE_ID
        || roleId === ADMIN_ROLE_ID
        || roleName === 'Editor'
        || roleName === 'Admin';
};

const requireContentEditor = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('roleId');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        if (!canManageContent(user)) {
            return res.status(403).json({
                success: false,
                code: 'CONTENT_EDITOR_REQUIRED',
                message: 'Only editors can manage educational content',
            });
        }

        req.currentUser = user;
        next();
    } catch (error) {
        console.error('Content editor middleware error:', error);
        next(error);
    }
};

module.exports = {
    requireContentEditor,
    canManageContent,
};
