const mongoose = require('mongoose');
const { LanguageServiceMode } = require('typescript');

// Utility functions for validation
const isValidCPF = (cpf) => {
    // Basic validation: CPF must be 11 digits
    const regex = /^\d{11}$/;
    if (!regex.test(cpf)) return false;

    // Check if all digits are the same (invalid CPF)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(9))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(10))) return false;

    return true;
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
        validate: {
            validator: function (v) {
                return v === null || isValidCPF(v);
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
    totalPickups: { type: Number, default: 0 }
});

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema, 'users');
