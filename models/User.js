const mongoose = require('mongoose');

const isValidCPF = (cpf) => {
    const regex = /^\d{11}$/;
    return regex.test(cpf);
};

const isValidPhone = (phone) => {
    if (!phone) return true;
    const regex = /^\d{10}$|^\d{11}$/;
    return regex.test(phone);
};

const UserSchema = new mongoose.Schema({
    username: { type: String, required: [true, 'Username is required'], unique: true },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'] },
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
    role: {
        type: String,
        enum: ['external', 'admin'],
        default: 'external',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
});

module.exports = mongoose.model('User', UserSchema, 'users');
