const { z } = require('zod');

const coordinatesSchema = z.object({
    type: z.literal('Point', {
        invalid_type_error: 'Coordinates type must be Point'
    }).optional().default('Point'),
    coordinates: z.array(z.number({
        invalid_type_error: 'Coordinates must be numeric values'
    }))
        .length(2, 'Coordinates must contain [longitude, latitude]')
        .refine(([longitude]) => longitude >= -180 && longitude <= 180, {
            message: 'Longitude must be between -180 and 180'
        })
        .refine(([, latitude]) => latitude >= -90 && latitude <= 90, {
            message: 'Latitude must be between -90 and 90'
        })
});

const createLocationSchema = z.object({
    name: z.string({
        required_error: 'Name is required'
    })
        .min(2, 'Name must be at least 2 characters long')
        .max(120, 'Name must be at most 120 characters long')
        .trim(),

    address: z.string({
        required_error: 'Address is required'
    })
        .min(5, 'Address must be at least 5 characters long')
        .max(255, 'Address must be at most 255 characters long')
        .trim(),

    coordinates: coordinatesSchema,

    imageUrl: z.string().trim().max(500).optional().default(''),

    operatingHours: z.string()
        .max(120, 'Operating hours must be at most 120 characters long')
        .trim()
        .optional()
        .default(''),

    isExtern: z.boolean().optional().default(false)
});

const updateLocationSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters long')
        .max(120, 'Name must be at most 120 characters long')
        .trim()
        .optional(),

    address: z.string()
        .min(5, 'Address must be at least 5 characters long')
        .max(255, 'Address must be at most 255 characters long')
        .trim()
        .optional(),

    coordinates: coordinatesSchema.optional(),

    imageUrl: z.string().trim().max(500).optional(),

    operatingHours: z.string()
        .max(120, 'Operating hours must be at most 120 characters long')
        .trim()
        .optional(),

    isExtern: z.boolean().optional()
})
    .refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update'
    });

const locationIdSchema = z.object({
    id: z.string({
        required_error: 'Location ID is required'
    }).trim().regex(/^[a-f\d]{24}$/i, 'Location ID must be a valid ObjectId')
});

module.exports = {
    createLocationSchema,
    updateLocationSchema,
    locationIdSchema
};
