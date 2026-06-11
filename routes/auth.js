const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const {
    registerRateLimiter,
    loginRateLimiter,
    resendVerificationCodeRateLimiter
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
router.post('/register', registerRateLimiter, validate(registerSchema), register);

// Login
router.post('/login', loginRateLimiter, validate(loginSchema), login);

// Forgot Password
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// Verify Email
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

// Resend Verification Code
router.post(
    '/resend-verification-code',
    resendVerificationCodeRateLimiter,
    validate(resendVerificationCodeSchema),
    resendVerificationCode
);

// Reset Password
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;
