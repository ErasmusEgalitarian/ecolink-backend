jest.mock('../models/User', () => ({
    findOne: jest.fn()
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

jest.mock('../middlewares/emailService', () => ({
    sendResetEmail: jest.fn()
}));

const { forgotPassword, resetPassword } = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendResetEmail } = require('../middlewares/emailService');

describe('Auth Controller - Password Reset', () => {

    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // ======================
    // FORGOT PASSWORD
    // ======================

    it('should return 200 even if user does not exist', async () => {
        req.body.email = 'notfound@email.com';

        User.findOne.mockResolvedValue(null);

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(sendResetEmail).not.toHaveBeenCalled();
    });

    it('should generate token and send email if user exists', async () => {
        req.body.email = 'test@email.com';

        const mockUser = {
            _id: '123',
            save: jest.fn()
        };

        User.findOne.mockResolvedValue(mockUser);
        jwt.sign.mockReturnValue('mockToken');

        await forgotPassword(req, res);

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: '123' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        expect(mockUser.resetPasswordToken).toBe('mockToken');
        expect(mockUser.resetPasswordExpires).toBeDefined();
        expect(mockUser.save).toHaveBeenCalled();

        expect(sendResetEmail).toHaveBeenCalledWith('test@email.com', 'mockToken');

        expect(res.status).toHaveBeenCalledWith(200);
    });

    // ======================
    // RESET PASSWORD
    // ======================

    it('should return 400 if token is invalid', async () => {
        req.body = {
            token: 'invalidToken',
            password: 'Senha@123'
        };

        User.findOne.mockResolvedValue(null);

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Token inválido ou expirado'
        });
    });

    it('should return 400 if token is expired', async () => {
        req.body = {
            token: 'expiredToken',
            password: 'Senha@123'
        };

        const mockUser = {
            resetPasswordExpires: Date.now() - 1000
        };

        User.findOne.mockResolvedValue(mockUser);

        await resetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should update password and invalidate token', async () => {
        req.body = {
            token: 'validToken',
            password: 'NovaSenha@123'
        };

        const mockUser = {
            resetPasswordExpires: Date.now() + 10000,
            save: jest.fn()
        };

        User.findOne.mockResolvedValue(mockUser);
        bcrypt.hash.mockResolvedValue('hashedPassword');

        await resetPassword(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith('NovaSenha@123', 10);

        expect(mockUser.password).toBe('hashedPassword');
        expect(mockUser.resetPasswordToken).toBeUndefined();
        expect(mockUser.resetPasswordExpires).toBeUndefined();

        expect(mockUser.save).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Password updated successfully'
        });
    });

});