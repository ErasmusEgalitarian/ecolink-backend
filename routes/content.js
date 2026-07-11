const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { requireContentEditor } = require('../middlewares/contentEditorMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const {
    createContentSchema,
    updateContentSchema,
    publishContentSchema,
} = require('../schemas/contentSchemas');
const {
    getCategories,
    listArticles,
    getArticleBySlug,
    getArticleForEditor,
    uploadContentImage,
    createArticle,
    updateArticle,
    publishArticle,
    deleteArticle,
} = require('../controllers/contentController');
const { contentImageUpload } = require('../middlewares/contentImageUpload');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

router.get('/categories', authenticated, getCategories);
router.get('/', authenticated, listArticles);
router.get('/slug/:slug', authenticated, getArticleBySlug);
router.get('/manage/:id', authenticated, requireContentEditor, getArticleForEditor);

router.post(
    '/upload-image',
    authenticated,
    requireContentEditor,
    contentImageUpload.single('file'),
    uploadContentImage,
);

router.post('/', authenticated, requireContentEditor, validate(createContentSchema), createArticle);
router.put('/:id', authenticated, requireContentEditor, validate(updateContentSchema), updateArticle);
router.patch('/:id/publish', authenticated, requireContentEditor, validate(publishContentSchema), publishArticle);
router.delete('/:id', authenticated, requireContentEditor, deleteArticle);

module.exports = router;
