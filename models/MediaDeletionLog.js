const mongoose = require('mongoose');

const mediaDeletionLogSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        trim: true,
    },
    path: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        trim: true,
    },
    reason: {
        type: String,
        enum: ['account_deletion', 'manual', 'avatar_replacement'],
        required: true,
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    },
    deletedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    sourceUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        default: null,
    },
    originalUploadedAt: {
        type: Date,
        default: null,
    },
});

mediaDeletionLogSchema.index({ deletedAt: -1 });
mediaDeletionLogSchema.index({ sourceUserId: 1, deletedAt: -1 });

module.exports = mongoose.model(
    'MediaDeletionLog',
    mediaDeletionLogSchema,
    'media_deletion_logs',
);
