const mongoose = require('mongoose');

// Utility functions for validation
const isValidCPF = (cpf) => {
    // Basic validation: CPF must be 11 digits
    const regex = /^\d{11}$/;
    return regex.test(cpf);
};

const isValidPhone = (phone) => {
    if (!phone) return true;
    const regex = /^\d{10}$|^\d{11}$/; // Only validate if a value is provided
    return regex.test(phone);
};

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    phone: {
        type: String, 
        default: null, 
        validate: [isValidPhone, 'Invalid phone number format'] 
    },
    cpf: {
        type: String,
        default: null,
        validate: {
            validator: function (v) {
                return v === null || isValidCPF(v);
            },
            message: 'Invalid CPF format',
        },
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles',     
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema, 'users');
