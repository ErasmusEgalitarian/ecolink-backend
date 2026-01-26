const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @description Registra um novo usuário
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
    try {
        const { username, email, password, address, phone, cpf, roleId } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
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
            roleId
        });
        
        await newUser.save();

        res.status(201).json({ 
            success: true,
            message: 'User registered successfully' 
        });
    } catch (err) {
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
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
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

        // Update last login
        await User.updateOne(
            { _id: user._id },
            { $currentDate: { lastlogin: true } }
        );

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            success: true,
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email, 
                phone: user.phone, 
                address: user.address 
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};

module.exports = {
    register,
    login
};
