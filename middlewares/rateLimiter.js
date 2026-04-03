const rateLimit = require('express-rate-limit');

const commonConfig = {
    windowMs: 15 * 60 * 1000,
    message: { message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
};

// Limiter Global
const globalLimiter = rateLimit({
    ...commonConfig,
    max: 100,
});

// Limiter de Auth
const authLimiter = rateLimit({
    ...commonConfig,
    max: 10,
});

module.exports = { globalLimiter, authLimiter };