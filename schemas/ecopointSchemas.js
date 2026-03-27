const { z } = require('zod');


const createEcopointSchema = z.object({
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

    coordinates: z.object({
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
    }, {
        required_error: 'Coordinates are required'
    }),

    operatingHours: z.string()
        .max(120, 'Operating hours must be at most 120 characters long')
        .trim()
        .optional()
        .default(''),

    phone: z.string()
        .trim()
        .regex(/^[\d\s()+-]{8,20}$/, 'Phone must contain 8 to 20 valid phone characters')
        .optional()
        .default(''),

})


const updateEcopointSchema = z.object({
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

    coordinates: z.object({
        type: z.literal('Point', {
            invalid_type_error: 'Coordinates type must be Point'
        }),
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
    }).optional(),

    acceptedMaterials: z.array(
        z.enum(['plastic', 'metal', 'glass', 'paper'], {
            invalid_type_error: 'Accepted materials must be one of: plastic, metal, glass, paper'
        })
    )
        .min(1, 'At least one accepted material must be provided')
        .optional(),

    status: z.enum(['Open', 'Closed', 'Full'], {
        invalid_type_error: 'Status must be one of: Open, Closed, Full'
    }).optional(),

    operationalStatus: z.enum(['Open', 'Closed', 'Full'], {
        invalid_type_error: 'Operational status must be one of: Open, Closed, Full'
    }).optional(),

    operatingHours: z.string()
        .max(120, 'Operating hours must be at most 120 characters long')
        .trim()
        .optional(),

    phone: z.string()
        .trim()
        .regex(/^[\d\s()+-]{8,20}$/, 'Phone must contain 8 to 20 valid phone characters')
        .optional(),

    isActive: z.boolean().optional()
})
    .refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update'
    })

    
    

module.exports = {
    createEcopointSchema,
    updateEcopointSchema
};
