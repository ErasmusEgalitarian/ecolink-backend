const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema} = require('../schemas/authSchemas');
const { register, login, forgotPassword,resetPassword} = require('../controllers/authController');

// Register
router.post('/register', validate(registerSchema), register);

// Login
router.post('/login', validate(loginSchema), login);

// Forgot Password
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// Reset Password
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;