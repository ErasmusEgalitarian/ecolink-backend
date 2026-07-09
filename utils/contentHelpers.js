const Media = require('../models/Media');
const { getUploadUrl } = require('./publicUrl');

const SUPPORTED_LANGS = ['pt', 'en'];
const DEFAULT_LANG = 'pt';

const CONTENT_CATEGORIES = [
    {
        slug: 'getting_started',
        labels: { pt: 'Primeiros passos', en: 'Getting started' },
    },
    {
        slug: 'material_types',
        labels: { pt: 'Tipos de material', en: 'Material types' },
    },
    {
        slug: 'preparation_tips',
        labels: { pt: 'Dicas de preparo', en: 'Preparation tips' },
    },
    {
        slug: 'impact_stories',
        labels: { pt: 'Histórias de impacto', en: 'Impact stories' },
    },
    {
        slug: 'cooperative_insights',
        labels: { pt: 'Voz das cooperativas', en: 'Cooperative insights' },
    },
];

const normalizeLang = (lang) => {
    const normalized = String(lang || DEFAULT_LANG).toLowerCase().slice(0, 2);
    return SUPPORTED_LANGS.includes(normalized) ? normalized : DEFAULT_LANG;
};

const resolveLocalizedValue = (value, lang) => {
    if (!value || typeof value !== 'object') {
        return '';
    }

    const preferred = value[lang]?.trim();
    if (preferred) {
        return preferred;
    }

    return value.pt?.trim() || value.en?.trim() || '';
};

const resolveMediaUrl = (media, req) => {
    if (!media) {
        return '';
    }

    if (media.path && !media.path.startsWith('/')) {
        return getUploadUrl(media.path, req);
    }

    if (media.filename) {
        return getUploadUrl(media.filename, req);
    }

    if (media.path) {
        const normalized = media.path.replace(/^.*uploads[\\/]/, '');
        return getUploadUrl(normalized, req);
    }

    return '';
};

const collectMediaIds = (article) => {
    const ids = new Set();

    if (article.coverMediaId) {
        ids.add(String(article.coverMediaId));
    }

    for (const block of article.blocks || []) {
        if (block.mediaId) {
            ids.add(String(block.mediaId));
        }
        if (block.video?.mediaId) {
            ids.add(String(block.video.mediaId));
        }
    }

    return [...ids];
};

const buildMediaMap = async (articles, req) => {
    const ids = new Set();
    for (const article of articles) {
        collectMediaIds(article).forEach((id) => ids.add(id));
    }

    if (ids.size === 0) {
        return new Map();
    }

    const medias = await Media.find({ _id: { $in: [...ids] } }).lean();
    const map = new Map();

    for (const media of medias) {
        map.set(String(media._id), {
            id: media._id,
            url: resolveMediaUrl(media, req),
            type: media.type,
        });
    }

    return map;
};

const localizeBlock = (block, lang, mediaMap) => {
    const localized = {
        type: block.type,
        order: block.order ?? 0,
    };

    if (block.content) {
        localized.content = resolveLocalizedValue(block.content, lang);
    }

    if (Array.isArray(block.items) && block.items.length > 0) {
        localized.items = block.items
            .map((item) => resolveLocalizedValue(item, lang))
            .filter(Boolean);
    }

    if (block.mediaId) {
        const media = mediaMap.get(String(block.mediaId));
        localized.media = media || null;
    }

    if (block.video) {
        localized.video = {
            provider: block.video.provider,
            url: block.video.url || '',
            media: block.video.mediaId
                ? mediaMap.get(String(block.video.mediaId)) || null
                : null,
        };
    }

    return localized;
};

const localizeArticle = (article, lang, mediaMap, { includeMeta = false } = {}) => {
    const payload = {
        id: article._id,
        slug: article.slug,
        category: article.category,
        format: article.format,
        title: resolveLocalizedValue({
            pt: article.translations?.pt?.title,
            en: article.translations?.en?.title,
        }, lang),
        excerpt: resolveLocalizedValue({
            pt: article.translations?.pt?.excerpt,
            en: article.translations?.en?.excerpt,
        }, lang),
        coverUrl: article.coverMediaId
            ? mediaMap.get(String(article.coverMediaId))?.url || ''
            : '',
        blocks: (article.blocks || [])
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((block) => localizeBlock(block, lang, mediaMap)),
        publishedAt: article.publishedAt,
        featured: article.featured,
        status: article.status,
    };

    if (includeMeta) {
        payload.status = article.status;
        payload.authorId = article.authorId;
        payload.translations = article.translations;
        payload.coverMediaId = article.coverMediaId;
        payload.createdAt = article.createdAt;
        payload.updatedAt = article.updatedAt;
    }

    return payload;
};

const getLocalizedCategories = (lang) => CONTENT_CATEGORIES.map((category) => ({
    slug: category.slug,
    label: category.labels[lang] || category.labels.pt,
}));

module.exports = {
    SUPPORTED_LANGS,
    DEFAULT_LANG,
    CONTENT_CATEGORIES,
    normalizeLang,
    resolveLocalizedValue,
    collectMediaIds,
    buildMediaMap,
    localizeArticle,
    localizeBlock,
    getLocalizedCategories,
};
