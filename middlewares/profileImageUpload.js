const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require('../models/User');
const {
    deleteExistingAvatarFiles,
    getMatriculaFromUser,
    getProfileUploadAbsoluteDir,
} = require('../utils/profileHelpers');

const getExtension = (file) => {
    const fromName = path.extname(file.originalname || '').toLowerCase();
    if (fromName) {
        return fromName;
    }

    if (file.mimetype === 'image/png') {
        return '.png';
    }

    if (file.mimetype === 'image/webp') {
        return '.webp';
    }

    return '.jpg';
};

const loadProfileMatricula = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        req.profileUser = user;
        req.profileMatricula = getMatriculaFromUser(user);
        next();
    } catch (error) {
        next(error);
    }
};

const profileImageStorage = multer.diskStorage({
    destination(req, file, cb) {
        try {
            const dir = getProfileUploadAbsoluteDir();
            fs.mkdirSync(dir, { recursive: true });
            deleteExistingAvatarFiles(req.profileMatricula);
            cb(null, dir);
        } catch (error) {
            cb(error);
        }
    },
    filename(req, file, cb) {
        cb(null, `${req.profileMatricula}${getExtension(file)}`);
    },
});

const profileImageUpload = multer({
    storage: profileImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error('Invalid image type. Use JPG, PNG or WEBP.'));
    },
});

module.exports = {
    loadProfileMatricula,
    profileImageUpload,
};
