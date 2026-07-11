const validate = require('../middlewares/validate');
const { createContentSchema } = require('../schemas/contentSchemas');

const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
const mockNext = jest.fn();

describe('Content Schema Validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('validates a minimal article payload', () => {
        const req = mockRequest({
            slug: 'como-doar',
            category: 'getting_started',
            translations: {
                pt: {
                    title: 'Como doar',
                    excerpt: 'Passo a passo',
                },
                en: {
                    title: 'How to donate',
                },
            },
            blocks: [
                {
                    type: 'paragraph',
                    content: {
                        pt: 'Texto em português',
                        en: 'English text',
                    },
                },
            ],
        });
        const res = mockResponse();
        const middleware = validate(createContentSchema);

        middleware(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(req.body.slug).toBe('como-doar');
    });

    it('rejects image block without mediaId', () => {
        const req = mockRequest({
            slug: 'imagem-sem-media',
            category: 'material_types',
            translations: {
                pt: { title: 'Imagem' },
            },
            blocks: [
                {
                    type: 'image',
                    content: { pt: 'Legenda' },
                },
            ],
        });
        const res = mockResponse();
        const middleware = validate(createContentSchema);

        middleware(req, res, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
