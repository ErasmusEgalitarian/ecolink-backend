const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/authMiddleware');
const { authenticatedUserRateLimiter } = require('../middlewares/rateLimiter');
const { createSemesterSchema } = require('../schemas/semesterSchemas');
const {
    createSemester,
    getSemesters,
    getCurrentSemester,
    getCurrentProgress,
    getCurrentDonationStats,
    getAllProgress,
    getSemesterProgress,
} = require('../controllers/semesterController');

const authenticated = [verifyToken, authenticatedUserRateLimiter];

router.post('/', authenticated, validate(createSemesterSchema), createSemester);

router.get('/', authenticated, getSemesters);
router.get('/current/progress', authenticated, getCurrentProgress);
router.get('/current/donation-stats', authenticated, getCurrentDonationStats);
router.get('/current', authenticated, getCurrentSemester);
router.get('/progress', authenticated, getAllProgress);
router.get('/:id/progress', authenticated, getSemesterProgress);

module.exports = router;
