const fs = require('fs');
const path = require('path');

jest.mock('../models/Donation', () => ({
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
}));

jest.mock('../models/Pickup', () => ({
    find: jest.fn().mockResolvedValue([]),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
}));

jest.mock('../utils/pickupHelpers', () => ({
    cancelPickupWithReplacement: jest.fn().mockResolvedValue({}),
}));

jest.mock('../models/User', () => ({
    findByIdAndDelete: jest.fn().mockResolvedValue({}),
}));

jest.mock('../models/UserVerifications', () => ({
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
}));

jest.mock('../models/MediaDeletionLog', () => ({
    create: jest.fn().mockResolvedValue({}),
}));

jest.mock('../utils/profileHelpers', () => ({
    deleteExistingAvatarFiles: jest.fn(),
    getMatriculaFromUser: jest.fn(() => '211039680'),
}));

const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const User = require('../models/User');
const UserActivation = require('../models/UserVerifications');
const MediaDeletionLog = require('../models/MediaDeletionLog');
const { cancelPickupWithReplacement } = require('../utils/pickupHelpers');
const {
    deleteExistingAvatarFiles,
} = require('../utils/profileHelpers');
const {
    deleteUserProfileAvatar,
    deleteUserAccount,
    handleUserPickups,
} = require('../utils/accountDeletionHelpers');

describe('accountDeletionHelpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('skips profile avatar deletion when user has no avatar', async () => {
        const result = await deleteUserProfileAvatar({ _id: 'user-id' });

        expect(result).toEqual({ deleted: false });
        expect(MediaDeletionLog.create).not.toHaveBeenCalled();
        expect(deleteExistingAvatarFiles).not.toHaveBeenCalled();
    });

    it('deletes profile avatar file and creates deletion log', async () => {
        const user = {
            _id: 'user-id',
            avatarPath: 'perfil/211039680.png',
            avatarUpdatedAt: new Date('2026-01-01T00:00:00.000Z'),
        };

        const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const result = await deleteUserProfileAvatar(user, {
            deletedByUserId: 'user-id',
            reason: 'account_deletion',
        });

        expect(result.deleted).toBe(true);
        expect(deleteExistingAvatarFiles).toHaveBeenCalledWith('211039680');
        expect(MediaDeletionLog.create).toHaveBeenCalledWith({
            filename: '211039680.png',
            path: 'perfil/211039680.png',
            category: 'profile',
            reason: 'account_deletion',
            deletedByUserId: 'user-id',
            sourceUserId: 'user-id',
            originalUploadedAt: user.avatarUpdatedAt,
        });

        existsSpy.mockRestore();
    });

    it('anonymizes donations, handles pickups and deletes user account', async () => {
        const user = {
            _id: 'user-id',
            avatarPath: 'perfil/211039680.png',
            avatarUpdatedAt: null,
        };

        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        Pickup.find.mockResolvedValueOnce([]);

        await deleteUserAccount(user, { deletedByUserId: 'admin-id' });

        expect(Donation.updateMany).toHaveBeenCalledWith(
            { userId: 'user-id' },
            { $set: { userId: null, anonymized: true } },
        );
        expect(Pickup.updateMany).toHaveBeenCalledWith(
            { pickupBy: 'user-id' },
            { $set: { pickupBy: null, pickupByAnonymized: true } },
        );
        expect(UserActivation.deleteMany).toHaveBeenCalledWith({ userId: 'user-id' });
        expect(User.findByIdAndDelete).toHaveBeenCalledWith('user-id');
    });

    it('cancels in-progress pickups with replacement and anonymizes the rest', async () => {
        const inProgress = [{ _id: 'pickup-1' }, { _id: 'pickup-2' }];
        Pickup.find.mockResolvedValueOnce(inProgress);

        await handleUserPickups('collector-id');

        expect(Pickup.find).toHaveBeenCalledWith({
            pickupBy: 'collector-id',
            pickupStatus: { $in: ['pending', 'accepted'] },
        });
        expect(cancelPickupWithReplacement).toHaveBeenCalledTimes(2);
        expect(cancelPickupWithReplacement).toHaveBeenCalledWith(inProgress[0]);
        expect(cancelPickupWithReplacement).toHaveBeenCalledWith(inProgress[1]);
        expect(Pickup.updateMany).toHaveBeenCalledWith(
            { pickupBy: 'collector-id' },
            { $set: { pickupBy: null, pickupByAnonymized: true } },
        );
    });
});
