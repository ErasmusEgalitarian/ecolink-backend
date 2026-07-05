const { z } = require('zod');

const materialEnum = z.enum(['plastic', 'metal', 'glass', 'paper'], {
    invalid_type_error: 'Accepted materials must be one of: plastic, metal, glass, paper'
});

const statusEnum = z.enum(['open', 'full', 'closed', 'offline'], {
    invalid_type_error: 'Status must be one of: open, full, closed, offline'
});

const createEcopointSchema = z.object({
    locationId: z.string({
        required_error: 'Location ID is required'
    }).trim().regex(/^[a-f\d]{24}$/i, 'Location ID must be a valid ObjectId'),

    label: z.string({
        required_error: 'Label is required'
    })
        .min(2, 'Label must be at least 2 characters long')
        .max(120, 'Label must be at most 120 characters long')
        .trim(),

    acceptedMaterials: z.array(materialEnum)
        .min(1, 'At least one accepted material must be provided'),

    status: statusEnum.optional().default('open'),

    qrCode: z.string().trim().max(120).optional().default('')
});

const updateEcopointSchema = z.object({
    locationId: z.string()
        .trim()
        .regex(/^[a-f\d]{24}$/i, 'Location ID must be a valid ObjectId')
        .optional(),

    label: z.string()
        .min(2, 'Label must be at least 2 characters long')
        .max(120, 'Label must be at most 120 characters long')
        .trim()
        .optional(),

    acceptedMaterials: z.array(materialEnum)
        .min(1, 'At least one accepted material must be provided')
        .optional(),

    status: statusEnum.optional(),

    qrCode: z.string().trim().max(120).optional()
})
    .refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update'
    });

const nearbyEcopointSchema = z.object({
    lat: z.coerce.number({
        required_error: 'Latitude is required',
        invalid_type_error: 'Latitude must be a number'
    })
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),

    lng: z.coerce.number({
        required_error: 'Longitude is required',
        invalid_type_error: 'Longitude must be a number'
    })
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),

    maxDistance: z.coerce.number({
        invalid_type_error: 'maxDistance must be a number'
    })
        .positive('maxDistance must be a positive number (meters)')
        .optional(),

    materialType: materialEnum.optional(),

    limit: z.coerce.number({
        invalid_type_error: 'limit must be a number'
    })
        .int('limit must be an integer')
        .positive('limit must be a positive number')
        .max(100, 'limit must be at most 100')
        .optional()
        .default(20)
});

const ecopointIdSchema = z.object({
    id: z.string({
        required_error: 'EcoPoint ID is required'
    }).trim().regex(/^[a-f\d]{24}$/i, 'EcoPoint ID must be a valid ObjectId')
});

const qrCodeParamSchema = z.object({
    qrCode: z.string({
        required_error: 'QR code is required'
    })
        .trim()
        .min(1, 'QR code cannot be empty')
        .max(120, 'QR code must be at most 120 characters long')
});

module.exports = {
    createEcopointSchema,
    updateEcopointSchema,
    nearbyEcopointSchema,
    ecopointIdSchema,
    qrCodeParamSchema
};
