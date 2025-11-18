const { z } = require('zod');

const createDonationSchema = z.object({
    ecopointId: z.string({
        required_error: 'Ecopoint ID is required'
    })
    .min(1, 'Ecopoint ID cannot be empty')
    .trim(),
    
    materialType: z.enum(['plastic', 'metal', 'glass', 'paper'], {
        required_error: 'Material type is required',
        invalid_type_error: 'Material type must be one of: plastic, metal, glass, paper'
    }),
    
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
    
    mediaId: z.string({
        required_error: 'Media ID is required'
    })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Media ID format')
});

// updateDonationSchema isn't on donation routes yet, but prepared for future use
const updateDonationSchema = z.object({
    materialType: z.enum(['plastic', 'metal', 'glass', 'paper'], {
        invalid_type_error: 'Material type must be one of: plastic, metal, glass, paper'
    }).optional(),
    
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
