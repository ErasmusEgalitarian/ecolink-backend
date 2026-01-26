const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { loginSchema, registerSchema } = require('../schemas/authSchemas');
const { register, login } = require('../controllers/authController');

// Register
router.post('/register', validate(registerSchema), register);

// Login
router.post('/login', validate(loginSchema), login);

module.exports = router;
