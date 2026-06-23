const mongoose = require('mongoose');

const UserActivationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activationCodeHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

UserActivationSchema.index(
    { createdAt: 1 }, 
    { expireAfterSeconds: 60 * 10}
);
UserActivationSchema.index({ userId: 1 });

const PasswordResetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resetCodeHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

PasswordResetSchema.index(
    { createdAt: 1 }, 
    { expireAfterSeconds: 900 }
);

module.exports = mongoose.model('UserActivation', UserActivationSchema, 'userActivations');
