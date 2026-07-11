const mockSave = jest.fn();
const mockUserConstructor = jest.fn(function (data) {
    return {
        ...data,
        save: mockSave
    };
});

mockUserConstructor.findOne = jest.fn();
mockUserConstructor.updateOne = jest.fn();

const mockUserActivation = {
    findOne: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn()
};

jest.mock('../models/User', () => mockUserConstructor);
jest.mock('../models/UserVerifications', () => mockUserActivation);

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

jest.mock('../middlewares/emailService', () => ({
    sendResetEmail: jest.fn(),
    sendVerificationEmail: jest.fn()
}));

const {
    register,
    login,
    forgotPassword,
    verifyEmail,
    resendVerificationCode,
    resetPassword
} = require('../controllers/authController');
const User = require('../models/User');
const UserActivation = require('../models/UserVerifications');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendResetEmail, sendVerificationEmail } = require('../middlewares/emailService');

describe('Auth Controller', () => {

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
    // REGISTER
    // ======================

    it('should return 409 if email is already registered', async () => {
        req.body = {
            username: 'john_doe',
            email: 'john@aluno.unb.br',
            password: 'SecurePass@123',
            address: 'Rua Test, 123',
            phone: '11987654321',
            cpf: '52998224725'
        };

        User.findOne.mockResolvedValue({
            email: 'john@aluno.unb.br',
            cpf: '11144477735',
            emailVerified: true
        });

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            code: 'EMAIL_ALREADY_REGISTERED',
            field: 'email',
            message: 'Email already registered'
        });
    });

    it('should resend verification code when email exists but is not verified', async () => {
        req.body = {
            username: 'john_doe',
            email: 'john@aluno.unb.br',
            password: 'SecurePass@123',
            address: 'Rua Test, 123',
            phone: '11987654321',
            cpf: '52998224725'
        };

        const mockUser = {
            _id: 'user-id',
            email: 'john@aluno.unb.br',
            cpf: '52998224725',
            emailVerified: false,
            save: jest.fn()
        };

        User.findOne.mockResolvedValue(mockUser);
        bcrypt.hash.mockResolvedValue('hashedCode');

        await register(req, res);

        expect(mockUser.save).toHaveBeenCalled();
        expect(UserActivation.deleteMany).toHaveBeenCalledWith({ userId: 'user-id' });
        expect(UserActivation.create).toHaveBeenCalledWith({
            userId: 'user-id',
            activationCodeHash: 'hashedCode'
        });
        expect(sendVerificationEmail).toHaveBeenCalledWith(
            'john@aluno.unb.br',
            expect.stringMatching(/^\d{6}$/)
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            code: 'VERIFICATION_CODE_SENT',
            message: 'Verification code sent to email'
        });
    });

    // ======================
    // LOGIN
    // ======================

    it('should return 401 if password is incorrect before checking email verification', async () => {
        req.body = {
            email: 'john@aluno.unb.br',
            password: 'WrongPass@123'
        };

        User.findOne.mockResolvedValue({
            email: 'john@aluno.unb.br',
            password: 'hashedPassword',
            emailVerified: false
        });
        bcrypt.compare.mockResolvedValue(false);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid credentials'
        });
    });

    it('should return 403 EMAIL_UNVERIFIED after password is correct', async () => {
        req.body = {
            email: 'john@aluno.unb.br',
            password: 'SecurePass@123'
        };

        User.findOne.mockResolvedValue({
            email: 'john@aluno.unb.br',
            password: 'hashedPassword',
            emailVerified: false
        });
        bcrypt.compare.mockResolvedValue(true);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            code: 'EMAIL_UNVERIFIED',
            message: 'Email not verified'
        });
    });

    // ======================
    // EMAIL VERIFICATION
    // ======================

    it('should verify email with a valid code', async () => {
        req.body = {
            email: 'john@aluno.unb.br',
            code: '123456'
        };

        const mockUser = {
            _id: 'user-id',
            username: 'john_doe',
            email: 'john@aluno.unb.br',
            phone: '11987654321',
            address: 'Rua Test, 123',
            emailVerified: false,
            save: jest.fn()
        };
        const mockActivation = {
            activationCodeHash: 'hashedCode',
            createdAt: new Date(Date.now() - 1000)
        };

        User.findOne.mockResolvedValue(mockUser);
        UserActivation.findOne.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockActivation)
        });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mockAuthToken');

        await verifyEmail(req, res);

        expect(mockUser.emailVerified).toBe(true);
        expect(mockUser.save).toHaveBeenCalled();
        expect(UserActivation.deleteMany).toHaveBeenCalledWith({ userId: 'user-id' });
        expect(User.updateOne).toHaveBeenCalledWith(
            { _id: 'user-id' },
            { $currentDate: { lastlogin: true } }
        );
        expect(jwt.sign).toHaveBeenCalledWith(
            {
                id: 'user-id',
                username: 'john_doe',
                email: 'john@aluno.unb.br'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Email verified successfully',
            token: 'mockAuthToken',
            user: {
                id: 'user-id',
                username: 'john_doe',
                email: 'john@aluno.unb.br',
                phone: '11987654321',
                address: 'Rua Test, 123'
            }
        });
    });

    it('should resend verification code to an unverified user', async () => {
        req.body = {
            email: 'john@aluno.unb.br'
        };

        const mockUser = {
            _id: 'user-id',
            email: 'john@aluno.unb.br',
            emailVerified: false,
            save: jest.fn()
        };

        User.findOne.mockResolvedValue(mockUser);
        bcrypt.hash.mockResolvedValue('hashedCode');

        await resendVerificationCode(req, res);

        expect(UserActivation.deleteMany).toHaveBeenCalledWith({ userId: 'user-id' });
        expect(UserActivation.create).toHaveBeenCalledWith({
            userId: 'user-id',
            activationCodeHash: 'hashedCode'
        });
        expect(sendVerificationEmail).toHaveBeenCalledWith(
            'john@aluno.unb.br',
            expect.stringMatching(/^\d{6}$/)
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    // ======================
    // FORGOT PASSWORD
    // ======================

    it('should return 200 even if user does not exist', async () => {
        req.body.email = 'notfound@aluno.unb.br';

        User.findOne.mockResolvedValue(null);

        await forgotPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(sendResetEmail).not.toHaveBeenCalled();
    });

    it('should generate token and send email if user exists', async () => {
        req.body.email = 'test@aluno.unb.br';

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

        expect(sendResetEmail).toHaveBeenCalledWith('test@aluno.unb.br', 'mockToken');

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
