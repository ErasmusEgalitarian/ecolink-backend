const ContentArticle = require('../models/ContentArticle');
const Media = require('../models/Media');
const User = require('../models/User');
const { canManageContent } = require('../middlewares/contentEditorMiddleware');
const { sanitizeContentSlug, getRequestSlug } = require('../middlewares/contentImageUpload');
const { getUploadUrl } = require('../utils/publicUrl');
const {
    normalizeLang,
    buildMediaMap,
    localizeArticle,
    getLocalizedCategories,
} = require('../utils/contentHelpers');

const ensureMediaExists = async (mediaId) => {
    if (!mediaId) {
        return true;
    }

    const media = await Media.findById(mediaId).lean();
    return Boolean(media);
};

const validateArticleMedia = async ({ coverMediaId, blocks = [] }) => {
    if (coverMediaId) {
        const exists = await ensureMediaExists(coverMediaId);
        if (!exists) {
            return 'Cover media not found';
        }
    }

    for (const block of blocks) {
        if (block.mediaId) {
            const exists = await ensureMediaExists(block.mediaId);
            if (!exists) {
                return `Media not found for block type ${block.type}`;
            }
        }

        if (block.video?.mediaId) {
            const exists = await ensureMediaExists(block.video.mediaId);
            if (!exists) {
                return 'Video media not found';
            }
        }
    }

    return null;
};

const getCategories = (req, res) => {
    const lang = normalizeLang(req.query.lang);
    res.status(200).json({
        success: true,
        data: getLocalizedCategories(lang),
    });
};

const listArticles = async (req, res, next) => {
    try {
        const lang = normalizeLang(req.query.lang);
        const { category, page = 1, limit = 20, status } = req.query;
        const user = await User.findById(req.user.id).populate('roleId');
        const isEditor = canManageContent(user);

        const filters = {};
        if (category) {
            filters.category = category;
        }

        if (isEditor && status) {
            filters.status = status;
        } else if (isEditor && status === undefined && req.query.includeDrafts === 'true') {
            // no status filter
        } else {
            filters.status = 'published';
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const articles = await ContentArticle.find(filters)
            .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit, 10))
            .lean();

        const mediaMap = await buildMediaMap(articles, req);
        const data = articles.map((article) => localizeArticle(article, lang, mediaMap));
        const total = await ContentArticle.countDocuments(filters);

        res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                pages: Math.ceil(total / parseInt(limit, 10)),
            },
        });
    } catch (error) {
        console.error('List content error:', error);
        next(error);
    }
};

const getArticleBySlug = async (req, res, next) => {
    try {
        const lang = normalizeLang(req.query.lang);
        const user = await User.findById(req.user.id).populate('roleId');
        const isEditor = canManageContent(user);

        const article = await ContentArticle.findOne({ slug: req.params.slug }).lean();
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Content not found',
            });
        }

        if (!isEditor && article.status !== 'published') {
            return res.status(404).json({
                success: false,
                message: 'Content not found',
            });
        }

        const mediaMap = await buildMediaMap([article], req);
        const data = localizeArticle(article, lang, mediaMap);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Get content by slug error:', error);
        next(error);
    }
};

const getArticleForEditor = async (req, res, next) => {
    try {
        const article = await ContentArticle.findById(req.params.id).lean();
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Content not found',
            });
        }

        const mediaMap = await buildMediaMap([article], req);

        res.status(200).json({
            success: true,
            data: {
                ...article,
                coverUrl: article.coverMediaId
                    ? mediaMap.get(String(article.coverMediaId))?.url || ''
                    : '',
                blocks: (article.blocks || []).map((block) => {
                    if (!block.mediaId) {
                        return block;
                    }

                    return {
                        ...block,
                        previewUrl: mediaMap.get(String(block.mediaId))?.url || '',
                    };
                }),
            },
        });
    } catch (error) {
        console.error('Get content for editor error:', error);
        next(error);
    }
};

const uploadContentImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File not sent',
            });
        }

        const slug = getRequestSlug(req);
        if (!slug) {
            return res.status(400).json({
                success: false,
                message: 'Slug is required for content image upload',
            });
        }

        const purpose = (req.body.purpose || req.query.purpose) === 'cover'
            ? 'content_cover'
            : 'content_inline';
        const relativePath = `content/${slug}/${req.file.filename}`;

        const media = await Media.create({
            _id: req.generatedMediaId,
            filename: req.file.filename,
            path: relativePath,
            type: req.file.mimetype,
            category: 'content',
            purpose,
            articleSlug: slug,
        });

        res.status(201).json({
            success: true,
            message: 'Content image uploaded successfully',
            data: {
                id: media._id,
                mediaId: media._id,
                url: getUploadUrl(relativePath, req),
                path: relativePath,
            },
        });
    } catch (error) {
        console.error('Upload content image error:', error);
        next(error);
    }
};

const createArticle = async (req, res, next) => {
    try {
        const mediaError = await validateArticleMedia(req.body);
        if (mediaError) {
            return res.status(404).json({
                success: false,
                message: mediaError,
            });
        }

        const exists = await ContentArticle.findOne({ slug: req.body.slug }).lean();
        if (exists) {
            return res.status(409).json({
                success: false,
                message: 'Slug already exists',
            });
        }

        const status = req.body.status || 'draft';
        const article = await ContentArticle.create({
            ...req.body,
            authorId: req.user.id,
            status,
            publishedAt: status === 'published' ? new Date() : undefined,
        });

        res.status(201).json({
            success: true,
            message: 'Content created successfully',
            data: article,
        });
    } catch (error) {
        console.error('Create content error:', error);
        next(error);
    }
};

const updateArticle = async (req, res, next) => {
    try {
        const article = await ContentArticle.findById(req.params.id);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Content not found',
            });
        }

        if (req.body.slug && req.body.slug !== article.slug) {
            const slugExists = await ContentArticle.findOne({ slug: req.body.slug }).lean();
            if (slugExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Slug already exists',
                });
            }
        }

        const merged = {
            coverMediaId: req.body.coverMediaId ?? article.coverMediaId,
            blocks: req.body.blocks ?? article.blocks,
        };
        const mediaError = await validateArticleMedia(merged);
        if (mediaError) {
            return res.status(404).json({
                success: false,
                message: mediaError,
            });
        }

        Object.assign(article, req.body);

        if (req.body.status === 'published' && !article.publishedAt) {
            article.publishedAt = new Date();
        }

        await article.save();

        res.status(200).json({
            success: true,
            message: 'Content updated successfully',
            data: article,
        });
    } catch (error) {
        console.error('Update content error:', error);
        next(error);
    }
};

const publishArticle = async (req, res, next) => {
    try {
        const article = await ContentArticle.findById(req.params.id);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Content not found',
            });
        }

        const nextStatus = req.body.status || 'published';
        article.status = nextStatus;

        if (nextStatus === 'published') {
            article.publishedAt = article.publishedAt || new Date();
        }

        await article.save();

        res.status(200).json({
            success: true,
            message: 'Content status updated successfully',
            data: article,
        });
    } catch (error) {
        console.error('Publish content error:', error);
        next(error);
    }
};

const deleteArticle = async (req, res, next) => {
    try {
        const article = await ContentArticle.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Content not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Content deleted successfully',
        });
    } catch (error) {
        console.error('Delete content error:', error);
        next(error);
    }
};

module.exports = {
    getCategories,
    listArticles,
    getArticleBySlug,
    getArticleForEditor,
    uploadContentImage,
    createArticle,
    updateArticle,
    publishArticle,
    deleteArticle,
};
