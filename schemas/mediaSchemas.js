const { z } = require('zod');


const uploadMediaSchema = z.object({
    category: z.string({
        required_error: 'Category is required'
    })
    .min(1, 'Category cannot be empty')
    .trim()
});


const updateMediaSchema = z.object({
    category: z.string()
        .min(1, 'Category cannot be empty')
        .trim()
        .optional(),
    
    filename: z.string()
        .min(1, 'Filename cannot be empty')
        .trim()
        .optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});

module.exports = {
    uploadMediaSchema,
    updateMediaSchema
};
