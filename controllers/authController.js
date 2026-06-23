const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserActivation = require('../models/UserVerifications');
const { sendResetEmail, sendVerificationEmail } = require('../middlewares/emailService');

const EMAIL_VERIFICATION_EXPIRATION_MS = 10 * 60 * 1000;
const RESEND_VERIFICATION_CODE_COOLDOWN_SECONDS = 60;

const generateVerificationCode = () => crypto.randomInt(100000, 1000000).toString();

const generateAuthToken = (user) => jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
);

const serializeAuthUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    address: user.address
});

const getRetryAfterFromRateLimit = (req, fallbackSeconds) => {
    const resetTime = req.rateLimit?.resetTime;

    if (resetTime instanceof Date) {
        return Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
    }

    return fallbackSeconds;
};

const sendNewVerificationCode = async (user) => {
    const code = generateVerificationCode();
    const activationCodeHash = await bcrypt.hash(code, 10);

    user.emailVerified = false;
    await user.save();

    await UserActivation.deleteMany({ userId: user._id });
    await UserActivation.create({
        userId: user._id,
        activationCodeHash
    });

    await sendVerificationEmail(user.email, code);
};

/**
 * @description Registra um novo usuário
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
    try {
        const { username, email, password, address, phone, cpf } = req.body;

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            if (existingUserByEmail.emailVerified !== true) {
                // Only the original registrant (matching CPF) may trigger a resend.
                // A different CPF means a different person — block to prevent account takeover.
                if (existingUserByEmail.cpf !== cpf) {
                    return res.status(409).json({
                        success: false,
                        code: 'EMAIL_ALREADY_REGISTERED',
                        field: 'email',
                        message: 'Email already registered'
                    });
                }

                await sendNewVerificationCode(existingUserByEmail);

                return res.status(200).json({
                    success: true,
                    code: 'VERIFICATION_CODE_SENT',
                    message: 'Verification code sent to email'
                });
            }

            return res.status(409).json({ 
                success: false,
                code: 'EMAIL_ALREADY_REGISTERED',
                field: 'email',
                message: 'Email already registered'
            });
        }

        const existingUserByCpf = await User.findOne({ cpf });
        if (existingUserByCpf) {
            return res.status(409).json({
                success: false,
                code: 'CPF_ALREADY_REGISTERED',
                field: 'cpf',
                message: 'CPF already registered'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            address,
            phone,
            cpf,
            emailVerified: false
        });
        
        await sendNewVerificationCode(newUser);

        res.status(201).json({ 
            success: true,
            code: 'VERIFICATION_CODE_SENT',
            message: 'User registered successfully. Verification code sent to email' 
        });
    } catch (err) {
        if (err.code === 11000) {
            const duplicatedField = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
            const duplicatedFieldLabel = duplicatedField === 'cpf'
                ? 'CPF'
                : duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1);

            return res.status(409).json({
                success: false,
                code: `${duplicatedField.toUpperCase()}_ALREADY_REGISTERED`,
                field: duplicatedField,
                message: `${duplicatedFieldLabel} already registered`
            });
        }

        console.error('Register error:', err);
        next(err);
    }
};

/**
 * @description Faz login do usuário
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        if (user.emailVerified !== true) {
            return res.status(403).json({
                success: false,
                code: 'EMAIL_UNVERIFIED',
                message: 'Email not verified'
            });
        }

        // Update last login
        await User.updateOne(
            { _id: user._id },
            { $currentDate: { lastlogin: true } }
        );

        const token = generateAuthToken(user);

        res.status(200).json({ 
            success: true,
            token, 
            user: serializeAuthUser(user)
        });
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};

/**
 * @description Verifica o email do usuário com código OTP
 * @route POST /api/auth/verify-email
 * @access Public
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_VERIFICATION_CODE',
                message: 'Invalid or expired verification code'
            });
        }

        if (user.emailVerified === true) {
            return res.status(409).json({
                success: false,
                code: 'EMAIL_ALREADY_VERIFIED',
                message: 'Email already verified'
            });
        }

        const activation = await UserActivation.findOne({ userId: user._id }).sort({ createdAt: -1 });

        if (!activation
            || activation.createdAt.getTime() + EMAIL_VERIFICATION_EXPIRATION_MS < Date.now()) {
            return res.status(400).json({
                success: false,
                code: 'EMAIL_VERIFICATION_EXPIRED',
                message: 'Verification code expired'
            });
        }

        const isMatch = await bcrypt.compare(code, activation.activationCodeHash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_VERIFICATION_CODE',
                message: 'Invalid verification code'
            });
        }

        user.emailVerified = true;

        await user.save();
        await UserActivation.deleteMany({ userId: user._id });

        await User.updateOne(
            { _id: user._id },
            { $currentDate: { lastlogin: true } }
        );

        const token = generateAuthToken(user);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: serializeAuthUser(user)
        });
    } catch (err) {
        console.error('Verify email error:', err);
        next(err);
    }
};

/**
 * @description Reenvia o código de verificação de email
 * @route POST /api/auth/resend-verification-code
 * @access Public
 */
const resendVerificationCode = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        const retryAfter = getRetryAfterFromRateLimit(
            req,
            RESEND_VERIFICATION_CODE_COOLDOWN_SECONDS
        );

        // Return the same 200 response regardless of whether the email exists or is
        // already verified — prevents enumeration of registered/verified accounts.
        if (!user || user.emailVerified === true) {
            return res.status(200).json({
                success: true,
                code: 'VERIFICATION_CODE_SENT',
                message: 'If the email exists and is not verified, a verification code has been sent',
                retryAfter
            });
        }

        await sendNewVerificationCode(user);

        res.status(200).json({
            success: true,
            code: 'VERIFICATION_CODE_SENT',
            message: 'Verification code sent to email',
            retryAfter
        });
    } catch (err) {
        console.error('Resend verification code error:', err);
        next(err);
    }
};

/**
 * @description Solicita redefinição de senha
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (user) {
            // Generate token (15 min)
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            // Save token and expiration
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

            await user.save();

            await sendResetEmail(email, token);
        }

        // Sempre retorna 200 (anti-enumeration)
        res.status(200).json({
            success: true,
            message: 'If the email exists, a reset link has been sent'
        });

    } catch (err) {
        console.error('Forgot password error:', err);
        next(err);
    }
};

/**
 * @description Redefine a senha do usuário
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({ resetPasswordToken: token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }

        // Check expiration
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        // Invalidate token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (err) {
        console.error('Reset password error:', err);
        next(err);
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    verifyEmail,
    resendVerificationCode,
    resetPassword
};
