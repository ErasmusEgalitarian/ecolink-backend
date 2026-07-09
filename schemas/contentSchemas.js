const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

const localizedRequiredSchema = z.object({
    pt: z.string().min(1, 'Portuguese text is required').trim(),
    en: z.string().trim().optional(),
});

const localizedOptionalSchema = z.object({
    pt: z.string().trim().optional(),
    en: z.string().trim().optional(),
});

const localizedListItemSchema = z.object({
    pt: z.string().min(1).trim(),
    en: z.string().trim().optional(),
});

const videoSchema = z.object({
    provider: z.enum(['youtube', 'vimeo', 'upload']),
    url: z.string().url().optional(),
    mediaId: objectIdSchema.optional(),
}).superRefine((value, ctx) => {
    if (!value.url && !value.mediaId) {
        ctx.addIssue({
            code: 'custom',
            message: 'Video block requires url or mediaId',
            path: ['url'],
        });
    }
});

const contentBlockSchema = z.object({
    type: z.enum(['heading', 'paragraph', 'image', 'video', 'quote', 'list']),
    order: z.number().int().min(0).optional(),
    content: localizedOptionalSchema.optional(),
    items: z.array(localizedListItemSchema).optional(),
    mediaId: objectIdSchema.optional(),
    video: videoSchema.optional(),
}).superRefine((block, ctx) => {
    const textTypes = new Set(['heading', 'paragraph', 'quote']);
    const needsText = textTypes.has(block.type) || block.type === 'image';

    if (needsText && !block.content?.pt?.trim()) {
        ctx.addIssue({
            code: 'custom',
            message: 'Block content.pt is required for this block type',
            path: ['content', 'pt'],
        });
    }

    if (block.type === 'list' && (!block.items || block.items.length === 0)) {
        ctx.addIssue({
            code: 'custom',
            message: 'List block requires at least one item',
            path: ['items'],
        });
    }

    if (block.type === 'image' && !block.mediaId) {
        ctx.addIssue({
            code: 'custom',
            message: 'Image block requires mediaId',
            path: ['mediaId'],
        });
    }

    if (block.type === 'video' && !block.video) {
        ctx.addIssue({
            code: 'custom',
            message: 'Video block requires video metadata',
            path: ['video'],
        });
    }
});

const translationsSchema = z.object({
    pt: z.object({
        title: z.string().min(1).trim(),
        excerpt: z.string().trim().optional(),
    }),
    en: z.object({
        title: z.string().trim().optional(),
        excerpt: z.string().trim().optional(),
    }).optional(),
});

const createContentSchema = z.object({
    slug: z.string().min(1).trim().toLowerCase(),
    category: z.enum([
        'getting_started',
        'material_types',
        'preparation_tips',
        'impact_stories',
        'cooperative_insights',
    ]),
    format: z.enum(['article', 'video', 'image', 'mixed']).optional(),
    status: z.enum(['draft', 'review', 'published']).optional(),
    translations: translationsSchema,
    coverMediaId: objectIdSchema.optional(),
    blocks: z.array(contentBlockSchema).optional(),
    featured: z.boolean().optional(),
});

const updateContentSchema = createContentSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' },
);

const publishContentSchema = z.object({
    status: z.enum(['draft', 'review', 'published']).optional(),
});

module.exports = {
    createContentSchema,
    updateContentSchema,
    publishContentSchema,
};
