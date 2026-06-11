const rateLimit = require('express-rate-limit');

const createAuthRateLimitHandler = (code, message) => (req, res, next, options) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfterHeader = Number(res.getHeader('Retry-After'));
    const retryAfter = resetTime instanceof Date
        ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
        : retryAfterHeader || Math.ceil(options.windowMs / 1000);

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

const resendVerificationCodeRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 1,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    handler: createAuthRateLimitHandler(
        'RESEND_VERIFICATION_CODE_RATE_LIMIT_EXCEEDED',
        'Please wait before requesting another verification code.'
    )
});

module.exports = {
    registerRateLimiter,
    loginRateLimiter,
    resendVerificationCodeRateLimiter
};
