const { z } = require('zod');

const phoneRegex = /^\d{10}$|^\d{11}$/;

/**
 * Schema para atualização de perfil do usuário
 */
const updateUserProfileSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters long')
        .max(30, 'Username must be at most 30 characters long')
        .trim()
        .optional(),
    
    address: z.string()
        .min(5, 'Address must be at least 5 characters long')
        .trim()
        .optional(),
    
    phone: z.string()
        .regex(phoneRegex, 'Phone must have 10 or 11 digits')
        .optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});

/**
 * Schema para atualização de senha
 */
const changePasswordSchema = z.object({
    currentPassword: z.string({
        required_error: 'Current password is required'
    })
    .min(1, 'Current password cannot be empty'),
    
    newPassword: z.string({
        required_error: 'New password is required'
    })
    .min(8, 'Password must be at least 8 characters long')
    .max(24, 'Password must be at most 24 characters long')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-]).+$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
});

module.exports = {
    updateUserProfileSchema,
    changePasswordSchema
};
