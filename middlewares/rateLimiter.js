const rateLimit = require('express-rate-limit');

const createAuthRateLimitHandler = (code, message) => (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);

    return res.status(options.statusCode).json({
        success: false,
        code,
        message,
        retryAfter
    });
};

const registerRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: createAuthRateLimitHandler(
        'REGISTER_RATE_LIMIT_EXCEEDED',
        'Too many registration attempts. Please try again later.'
    )
});

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: createAuthRateLimitHandler(
        'LOGIN_RATE_LIMIT_EXCEEDED',
        'Too many login attempts. Please try again later.'
    )
});

module.exports = {
    registerRateLimiter,
    loginRateLimiter
};
