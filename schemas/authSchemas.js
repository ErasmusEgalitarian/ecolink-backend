const { z } = require('zod');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-]).+$/;
const phoneRegex = /^\d{10}$|^\d{11}$/;
const cpfRegex = /^\d{11}$/;

/**
 * Add business rule check for password if password change is required
 * when the password policy is updated
 */

const loginSchema = z.object({
    email: z.string({
        required_error: 'Email is required'
    })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
    
    password: z.string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string'
    })
    .min(1, 'Password cannot be empty')
});


const registerSchema = z.object({
    username: z.string({
        required_error: 'Username is required'
    })
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be at most 30 characters long')
    .trim(),
    
    email: z.string({
        required_error: 'Email is required'
    })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
    
    password: z.string({
        required_error: 'Password is required'
    })
    .min(8, 'Password must be at least 8 characters long')
    .max(24, 'Password must be at most 24 characters long')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#._-)'),
    
    address: z.string({
        required_error: 'Address is required'
    })
        .min(5, 'Address must be at least 5 characters long')
        .trim(),
    
    phone: z.string({
        required_error: 'Phone is required'
    })
        .regex(phoneRegex, 'Phone must have 10 or 11 digits'),
    
    cpf: z.string({
        required_error: 'CPF is required'
    })
        .regex(cpfRegex, 'CPF must have exactly 11 digits'),
    
    roleId: z.string({
        required_error: 'Role ID is required'
    })
});

module.exports = {
    loginSchema,
    registerSchema
};
