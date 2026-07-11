const fs = require('fs');
const path = require('path');

const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const User = require('../models/User');
const MediaDeletionLog = require('../models/MediaDeletionLog');
const UserActivation = require('../models/UserVerifications');
const { cancelPickupWithReplacement } = require('./pickupHelpers');
const {
    deleteExistingAvatarFiles,
    getMatriculaFromUser,
} = require('./profileHelpers');

const IN_PROGRESS_PICKUP_STATUSES = ['pending', 'accepted'];

const anonymizeUserDonations = async (userId) => {
    await Donation.updateMany(
        { userId },
        { $set: { userId: null, anonymized: true } },
    );
};

/**
 * Trata as coletas de um catador/editor que está excluindo a conta:
 * - Coletas em andamento (accepted) são canceladas com reposição, liberando
 *   as doações de volta para uma nova coleta pendente de outro catador.
 * - Coletas restantes vinculadas ao usuário (concluídas e canceladas) são
 *   anonimizadas: mantém o histórico sem o vínculo pessoal.
 */
const handleUserPickups = async (userId) => {
    const inProgressPickups = await Pickup.find({
        pickupBy: userId,
        pickupStatus: { $in: IN_PROGRESS_PICKUP_STATUSES },
    });

    for (const pickup of inProgressPickups) {
        await cancelPickupWithReplacement(pickup);
    }

    await Pickup.updateMany(
        { pickupBy: userId },
        { $set: { pickupBy: null, pickupByAnonymized: true } },
    );
};

const clearUserVerifications = async (userId) => {
    await UserActivation.deleteMany({ userId });
};

const deleteUserProfileAvatar = async (user, options = {}) => {
    const {
        reason = 'account_deletion',
        deletedByUserId = null,
    } = options;

    if (!user?.avatarPath) {
        return { deleted: false };
    }

    const relativePath = user.avatarPath;
    const absolutePath = path.join(__dirname, '..', 'uploads', relativePath);
    const fileExisted = fs.existsSync(absolutePath);
    const matricula = getMatriculaFromUser(user);

    deleteExistingAvatarFiles(matricula);

    await MediaDeletionLog.create({
        filename: path.basename(relativePath),
        path: relativePath,
        category: 'profile',
        reason,
        deletedByUserId,
        sourceUserId: user._id,
        originalUploadedAt: user.avatarUpdatedAt || null,
    });

    return { deleted: true, fileExisted };
};

const deleteUserAccount = async (user, options = {}) => {
    const { deletedByUserId = null } = options;

    await anonymizeUserDonations(user._id);
    await handleUserPickups(user._id);
    await clearUserVerifications(user._id);
    await deleteUserProfileAvatar(user, {
        reason: 'account_deletion',
        deletedByUserId,
    });

    await User.findByIdAndDelete(user._id);
};

module.exports = {
    anonymizeUserDonations,
    handleUserPickups,
    clearUserVerifications,
    deleteUserProfileAvatar,
    deleteUserAccount,
};
