const { z } = require('zod');

// donationDate isn't on donation routes yet, but prepared for future use
const createDonationSchema = z.object({
    userId: z.string({
        required_error: 'User ID is required'
    })
    .min(1, 'User ID cannot be empty')
    .trim(),
    
    materialType: z.string({
        required_error: 'Material type is required'
    })
    .min(2, 'Material type must be at least 2 characters long')
    .trim(),
    
    description: z.string()
        .trim()
        .optional()
        .default(''),
    
    qtdMaterial: z.number({
        required_error: 'Quantity is required',
        invalid_type_error: 'Quantity must be a number'
    })
    .positive('Quantity must be a positive number')
    .int('Quantity must be an integer'),
    
    donationDate: z.string()
        .datetime()
        .optional()
        .or(z.date().optional())
});

// updateDonationSchema isn't on donation routes yet, but prepared for future use
const updateDonationSchema = z.object({
    materialType: z.string()
        .min(2, 'Material type must be at least 2 characters long')
        .trim()
        .optional(),
    
    description: z.string()
        .trim()
        .optional(),
    
    qtdMaterial: z.number({
        invalid_type_error: 'Quantity must be a number'
    })
    .positive('Quantity must be a positive number')
    .int('Quantity must be an integer')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});

module.exports = {
    createDonationSchema,
    updateDonationSchema
};
