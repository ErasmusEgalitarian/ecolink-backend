const {
    normalizeLang,
    resolveLocalizedValue,
    localizeBlock,
    getLocalizedCategories,
    buildContentMediaRelativePath,
    resolveMediaUrl,
} = require('../utils/contentHelpers');
const { canManageContent } = require('../middlewares/contentEditorMiddleware');
const { EDITOR_ROLE_ID, VIEWER_ROLE_ID } = require('../constants/roles');

describe('contentHelpers', () => {
    it('normalizes supported languages', () => {
        expect(normalizeLang('en')).toBe('en');
        expect(normalizeLang('pt-BR')).toBe('pt');
        expect(normalizeLang('fr')).toBe('pt');
    });

    it('falls back to portuguese when english is missing', () => {
        expect(resolveLocalizedValue({ pt: 'Olá', en: '' }, 'en')).toBe('Olá');
    });

    it('returns localized categories', () => {
        const categories = getLocalizedCategories('en');
        expect(categories[0]).toEqual({
            slug: 'getting_started',
            label: 'Getting started',
        });
    });

    it('localizes text blocks', () => {
        const block = localizeBlock({
            type: 'paragraph',
            order: 0,
            content: { pt: 'Texto PT', en: 'Text EN' },
        }, 'en', new Map());

        expect(block.content).toBe('Text EN');
    });

    it('builds content media path from article slug and filename', () => {
        expect(buildContentMediaRelativePath('reciclagem-basica', 'abc123.jpg'))
            .toBe('content/reciclagem-basica/abc123.jpg');
        expect(buildContentMediaRelativePath('', 'abc123.jpg')).toBe('');
        expect(buildContentMediaRelativePath('reciclagem-basica', '')).toBe('');
    });

    it('resolves content media url without stored path', () => {
        const req = { protocol: 'http', get: () => 'localhost:5000' };
        const url = resolveMediaUrl({
            filename: 'abc123.jpg',
            articleSlug: 'reciclagem-basica',
            category: 'content',
            purpose: 'content_inline',
        }, req);

        expect(url).toBe('http://localhost:5000/uploads/content/reciclagem-basica/abc123.jpg');
    });

    it('falls back to legacy path for old content media records', () => {
        const req = { protocol: 'http', get: () => 'localhost:5000' };
        const url = resolveMediaUrl({
            filename: 'abc123.jpg',
            path: 'content/old-slug/abc123.jpg',
            category: 'content',
            purpose: 'content_cover',
        }, req);

        expect(url).toBe('http://localhost:5000/uploads/content/old-slug/abc123.jpg');
    });
});

describe('content permissions', () => {
    it('allows editor role to manage content', () => {
        expect(canManageContent({
            roleId: { _id: EDITOR_ROLE_ID, name: 'Editor' },
        })).toBe(true);
    });

    it('denies viewer role from managing content', () => {
        expect(canManageContent({
            roleId: { _id: VIEWER_ROLE_ID, name: 'Viewer' },
        })).toBe(false);
    });
});
