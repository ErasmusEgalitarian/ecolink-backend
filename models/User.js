const mongoose = require('mongoose');
const { isValidCPF } = require('../utils/cpfValidator');

const isValidPhone = (phone) => {
    if (!phone) return true;
    const regex = /^\d{10}$|^\d{11}$/; // Only validate if a value is provided
    return regex.test(phone);
};

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastlogin: { type: Date, default: null },
    phone: {
        type: String, 
        required: true, 
        validate: [isValidPhone, 'Invalid phone number format'] 
    },
    cpf: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return isValidCPF(v);
            },
            message: 'Invalid CPF format',
        },
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role', 
        required: true,
        default: '683607d382cf7e288f7ca460' // viewer
    },
    wasteSaved: { type: Number, default: 0 }, 
    carbonCredit: { type: Number, default: 0 }, 
    totalPickups: { type: Number, default: 0 },

    emailVerified: { type: Boolean, default: false }
});

UserSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 2 * 24 * 60 * 60,
        partialFilterExpression: { emailVerified: false }
    }
);

module.exports = mongoose.model('User', UserSchema, 'users');
