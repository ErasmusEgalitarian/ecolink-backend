const { z } = require('zod');

/**
 * Schema para atualização de status do Pickup
 */
const updatePickupStatusSchema = z.object({
    pickupStatus: z.enum(['pending', 'accepted', 'completed', 'cancelled'], {
        required_error: 'Pickup status is required',
        invalid_type_error: 'Status must be one of: pending, accepted, completed, cancelled'
    })
});

/**
 * Schema para aceitar um pickup (Editor/Admin)
 */
const acceptPickupSchema = z.object({
    pickupBy: z.string({
        required_error: 'User ID is required'
    })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID format')
    .optional() // Se não informado, usa o req.user.id
});

module.exports = {
    updatePickupStatusSchema,
    acceptPickupSchema
};
