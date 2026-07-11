const mongoose = require('mongoose');

const localizedStringSchema = {
    pt: { type: String, trim: true },
    en: { type: String, trim: true },
};

const contentBlockSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['heading', 'paragraph', 'image', 'video', 'quote', 'list'],
        required: true,
    },
    order: { type: Number, default: 0 },
    content: localizedStringSchema,
    items: [{
        pt: { type: String, trim: true },
        en: { type: String, trim: true },
    }],
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    video: {
        provider: { type: String, enum: ['youtube', 'vimeo', 'upload'] },
        url: { type: String, trim: true },
        mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    },
}, { _id: false });

const contentArticleSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    category: {
        type: String,
        enum: [
            'getting_started',
            'material_types',
            'preparation_tips',
            'impact_stories',
            'cooperative_insights',
        ],
        required: true,
    },
    format: {
        type: String,
        enum: ['article', 'video', 'image', 'mixed'],
        default: 'mixed',
    },
    status: {
        type: String,
        enum: ['draft', 'review', 'published'],
        default: 'draft',
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    translations: {
        pt: {
            title: { type: String, required: true, trim: true },
            excerpt: { type: String, trim: true },
        },
        en: {
            title: { type: String, trim: true },
            excerpt: { type: String, trim: true },
        },
    },
    coverMediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    blocks: [contentBlockSchema],
    publishedAt: { type: Date },
    featured: { type: Boolean, default: false },
}, { timestamps: true });

contentArticleSchema.index({ status: 1, publishedAt: -1 });
contentArticleSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('ContentArticle', contentArticleSchema, 'content_articles');
