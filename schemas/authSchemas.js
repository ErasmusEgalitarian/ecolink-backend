const { z } = require('zod');
// at least 1 special case, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-]).+$/;

const loginSchema = z.object({
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
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#._-)')
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
    
    phoneNumber: z.string()
        .min(10, 'Phone number must be at least 10 characters')
        .trim()
        .optional(),
    
    address: z.string({
        required_error: 'Address is required'
    })
    .min(5, 'Address must be at least 5 characters long')
    .trim(),
    
    roleId: z.string()
        .optional()
});

module.exports = {
    loginSchema,
    registerSchema
};
