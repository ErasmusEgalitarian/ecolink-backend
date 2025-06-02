const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendWelcomeEmail = require('../utils/sendEmail');

jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('../utils/sendEmail');

describe('Auth Controller - register (unit tests)', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345678',
        phoneNumber: '123456789',
        address: 'Test address',
        cpf: '12345678900',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    User.findOne = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    bcrypt.hash.mockResolvedValue('hashedPassword');

    User.prototype.save = jest.fn().mockResolvedValue();

    sendWelcomeEmail.mockResolvedValue();

    await authController.register(req, res);

    expect(User.findOne).toHaveBeenCalledTimes(2);
    expect(bcrypt.hash).toHaveBeenCalledWith('12345678', 10);
    expect(User.prototype.save).toHaveBeenCalled();
    expect(sendWelcomeEmail).toHaveBeenCalledWith('test@example.com', 'testuser');

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
  });

  it('should return 400 if user email already exists', async () => {
    User.findOne = jest.fn()
      .mockResolvedValueOnce({ _id: 'someid' });

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('should return 400 if username already exists', async () => {
    User.findOne = jest.fn()
      .mockResolvedValueOnce(null) 
      .mockResolvedValueOnce({ _id: 'someid' });

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username already exists' });
  });

  it('should return 400 on error (e.g. validation error)', async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error('DB error'));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input or missing fields' });
  });
});
