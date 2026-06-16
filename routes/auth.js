const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const {
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
} = require('../middlewares/rateLimiter');
const {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    verifyEmailSchema,
    resendVerificationCodeSchema,
    resetPasswordSchema
} = require('../schemas/authSchemas');
const {
    register,
    login,
    forgotPassword,
    verifyEmail,
    resendVerificationCode,
    resetPassword
} = require('../controllers/authController');

// Register
router.post(
    '/register',
    registerRateLimiter,
    validate(registerSchema),
    registerEmailRateLimiter,
    register
);

// Login
router.post(
    '/login',
    loginRateLimiter,
    validate(loginSchema),
    loginEmailRateLimiter,
    login
);

// Forgot Password
router.post(
    '/forgot-password',
    forgotPasswordRateLimiter,
    validate(forgotPasswordSchema),
    forgotPasswordEmailRateLimiter,
    forgotPassword
);

// Verify Email
router.post(
    '/verify-email',
    validate(verifyEmailSchema),
    verifyEmailRateLimiter,
    verifyEmail
);

// Resend Verification Code
router.post(
    '/resend-verification-code',
    resendVerificationCodeRateLimiter,
    validate(resendVerificationCodeSchema),
    resendVerificationCodeEmailRateLimiter,
    resendVerificationCode
);

// Reset Password
router.post(
    '/reset-password',
    resetPasswordRateLimiter,
    validate(resetPasswordSchema),
    resetPasswordTokenRateLimiter,
    resetPassword
);

module.exports = router;
