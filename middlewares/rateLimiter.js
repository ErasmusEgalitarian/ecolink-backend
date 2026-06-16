const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

const createRateLimitHandler = (code, message) => (req, res, next, options) => {
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

const createEmailKeyGenerator = (prefix) => (req) => {
    const email = typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    return email
        ? `${prefix}:email:${email}`
        : `${prefix}:ip:${ipKeyGenerator(req.ip)}`;
};

const createTokenKeyGenerator = (prefix) => (req) => {
    const token = typeof req.body?.token === 'string'
        ? req.body.token.trim()
        : '';

    return token
        ? `${prefix}:token:${token}`
        : `${prefix}:ip:${ipKeyGenerator(req.ip)}`;
};

const authenticatedUserKeyGenerator = (req) => {
    const userId = req.user?.id || req.user?._id || req.user?.sub;

    return userId
        ? `user:${userId}`
        : `authenticated-ip:${ipKeyGenerator(req.ip)}`;
};

const globalRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler(
        'GLOBAL_RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.'
    )
});

const authenticatedUserRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: authenticatedUserKeyGenerator,
    handler: createRateLimitHandler(
        'USER_RATE_LIMIT_EXCEEDED',
        'Too many requests for this user. Please try again later.'
    )
});

const registerRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler(
        'REGISTER_RATE_LIMIT_EXCEEDED',
        'Too many registration attempts. Please try again later.'
    )
});

const registerEmailRateLimiter = rateLimit({
    windowMs: ONE_HOUR_MS,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createEmailKeyGenerator('register'),
    handler: createRateLimitHandler(
        'REGISTER_RATE_LIMIT_EXCEEDED',
        'Too many registration attempts for this email. Please try again later.'
    )
});

const loginRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: createRateLimitHandler(
        'LOGIN_RATE_LIMIT_EXCEEDED',
        'Too many login attempts. Please try again later.'
    )
});

const loginEmailRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: createEmailKeyGenerator('login'),
    handler: createRateLimitHandler(
        'LOGIN_RATE_LIMIT_EXCEEDED',
        'Too many login attempts for this email. Please try again later.'
    )
});

const forgotPasswordRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler(
        'FORGOT_PASSWORD_RATE_LIMIT_EXCEEDED',
        'Too many password reset requests. Please try again later.'
    )
});

const forgotPasswordEmailRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createEmailKeyGenerator('forgot-password'),
    handler: createRateLimitHandler(
        'FORGOT_PASSWORD_RATE_LIMIT_EXCEEDED',
        'Too many password reset requests for this email. Please try again later.'
    )
});

const verifyEmailRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: createEmailKeyGenerator('verify-email'),
    handler: createRateLimitHandler(
        'VERIFY_EMAIL_RATE_LIMIT_EXCEEDED',
        'Too many verification attempts. Please try again later.'
    )
});

const resendVerificationCodeRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    handler: createRateLimitHandler(
        'RESEND_VERIFICATION_CODE_RATE_LIMIT_EXCEEDED',
        'Please wait before requesting another verification code.'
    )
});

const resendVerificationCodeEmailRateLimiter = rateLimit({
    windowMs: ONE_MINUTE_MS,
    limit: 1,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    keyGenerator: createEmailKeyGenerator('resend-verification-code'),
    handler: createRateLimitHandler(
        'RESEND_VERIFICATION_CODE_RATE_LIMIT_EXCEEDED',
        'Please wait before requesting another verification code.'
    )
});

const resetPasswordRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler(
        'RESET_PASSWORD_RATE_LIMIT_EXCEEDED',
        'Too many password reset attempts. Please try again later.'
    )
});

const resetPasswordTokenRateLimiter = rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createTokenKeyGenerator('reset-password'),
    handler: createRateLimitHandler(
        'RESET_PASSWORD_RATE_LIMIT_EXCEEDED',
        'Too many password reset attempts for this token. Please try again later.'
    )
});

module.exports = {
    globalRateLimiter,
    authenticatedUserRateLimiter,
    registerRateLimiter,
    registerEmailRateLimiter,
    loginRateLimiter,
    loginEmailRateLimiter,
    forgotPasswordRateLimiter,
    forgotPasswordEmailRateLimiter,
    verifyEmailRateLimiter,
    resendVerificationCodeRateLimiter,
    resendVerificationCodeEmailRateLimiter,
    resetPasswordRateLimiter,
    resetPasswordTokenRateLimiter
};
