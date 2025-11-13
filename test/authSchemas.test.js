const validate = require('../middlewares/validate');
const { loginSchema, registerSchema } = require('../schemas/authSchemas');

// Mock Express request, response, and next
const mockRequest = (body = {}) => ({
    body
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('Auth Schema Validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Register Schema - Success Cases', () => {
        it('should successfully validate valid registration data with all fields', () => {
            const validUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe('Login Schema - Success Cases', () => {
        it('should successfully validate valid login credentials', () => {
            const validLogin = {
                email: 'john@example.com',
                password: 'SecurePass@123'
            };

            const req = mockRequest(validLogin);
            const res = mockResponse();
            const middleware = validate(loginSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should transform email to lowercase', () => {
            const validLogin = {
                email: 'JOHN@EXAMPLE.COM',
                password: 'SecurePass@123'
            };

            const req = mockRequest(validLogin);
            const res = mockResponse();
            const middleware = validate(loginSchema);

            middleware(req, res, mockNext);

            expect(req.body.email).toBe('john@example.com');
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });


    describe('BVA - Username Validation', () => {
        it('should reject username with 2 characters (below minimum)', () => {
            const invalidUser = {
                username: 'ab',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'username',
                        message: 'Username must be at least 3 characters long'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept username with exactly 3 characters (minimum boundary)', () => {
            const validUser = {
                username: 'abc',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should accept username with exactly 30 characters (maximum boundary)', () => {
            const validUser = {
                username: 'a'.repeat(30),
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should reject username with 31 characters (above maximum)', () => {
            const invalidUser = {
                username: 'a'.repeat(31),
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
            cpf: '12345678901',
            phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'username',
                        message: 'Username must be at most 30 characters long'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('BVA - Password Validation', () => {
        it('should reject password with 7 characters (below minimum)', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'Pass@12',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
            cpf: '12345678901',
            phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'password',
                        message: 'Password must be at least 8 characters long'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept password with exactly 8 characters (minimum boundary)', () => {
            const validUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'Pass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
            cpf: '12345678901',
            phone: '11987654321'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should accept password with exactly 24 characters (maximum boundary)', () => {
            const validUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePassword@123456789',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should reject password with 25 characters (above maximum)', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePassword@1234567890',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'password',
                        message: 'Password must be at most 24 characters long'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject password without uppercase letter', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'securepass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'password',
                        message: expect.stringContaining('uppercase')
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject password without lowercase letter', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SECUREPASS@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'password',
                        message: expect.stringContaining('lowercase')
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject password without number', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'password',
                        message: expect.stringContaining('number')
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject password without special character', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'password',
                        message: expect.stringContaining('special character')
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('BVA - Email Validation', () => {
        it('should reject invalid email format', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'invalid-email',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'email',
                        message: 'Invalid email format'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject email without @ symbol', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'johnexample.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should transform email to lowercase for login', () => {
            const validLogin = {
                email: 'JOHN@EXAMPLE.COM',
                password: 'anypassword'
            };

            const req = mockRequest(validLogin);
            const res = mockResponse();
            const middleware = validate(loginSchema);

            middleware(req, res, mockNext);

            expect(req.body.email).toBe('john@example.com');
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('BVA - Address Validation', () => {
        it('should reject address with 4 characters (below minimum)', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua',
                roleId: '507f1f77bcf86cd799439011',
            cpf: '12345678901',
            phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'address',
                        message: 'Address must be at least 5 characters long'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept address with exactly 5 characters (minimum boundary)', () => {
            const validUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua 1',
                roleId: '507f1f77bcf86cd799439011',
            cpf: '12345678901',
            phone: '11987654321'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe('BVA - CPF Validation', () => {
        it('should reject CPF with 10 digits (below minimum)', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '1234567890'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'cpf',
                        message: 'CPF must have exactly 11 digits'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept CPF with exactly 11 digits', () => {
            const validUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should reject CPF with 12 digits (above maximum)', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '123456789012'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject CPF with non-numeric characters', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '123.456.789-01'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('BVA - Phone Validation', () => {
        it('should reject phone with 9 digits (below minimum)', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                phone: '119876543'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'phone',
                        message: 'Phone must have 10 or 11 digits'
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should accept phone with exactly 10 digits', () => {
            const validUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '1198765432'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should accept phone with exactly 11 digits', () => {
            const validUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(validUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should reject phone with 12 digits (above maximum)', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                phone: '119876543210'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('BVA - Required Fields', () => {
        it('should reject when username is missing', () => {
            const invalidUser = {
                email: 'john@example.com',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
            cpf: '12345678901',
            phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'username',
                        message: expect.stringMatching(/Username is required|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject when email is missing', () => {
            const invalidUser = {
                username: 'john_doe',
                password: 'SecurePass@123',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
            cpf: '12345678901',
            phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'email',
                        message: expect.stringMatching(/Email is required|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject when password is missing', () => {
            const invalidUser = {
                username: 'john_doe',
                email: 'john@example.com',
                address: 'Rua Test, 123',
                roleId: '507f1f77bcf86cd799439011',
                cpf: '12345678901',
                phone: '11987654321'
            };

            const req = mockRequest(invalidUser);
            const res = mockResponse();
            const middleware = validate(registerSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'password',
                        message: expect.stringMatching(/Password is required|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject login when email is missing', () => {
            const invalidLogin = {
                password: 'SecurePass@123'
            };

            const req = mockRequest(invalidLogin);
            const res = mockResponse();
            const middleware = validate(loginSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'email',
                        message: expect.stringMatching(/Email is required|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject login when password is missing', () => {
            const invalidLogin = {
                email: 'john@example.com'
            };

            const req = mockRequest(invalidLogin);
            const res = mockResponse();
            const middleware = validate(loginSchema);

            middleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation error',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'password',
                        message: expect.stringMatching(/Password is required|expected string, received undefined/)
                    })
                ])
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
