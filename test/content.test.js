const {
    normalizeLang,
    resolveLocalizedValue,
    localizeBlock,
    getLocalizedCategories,
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
