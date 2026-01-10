const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Email, password, firstName, and lastName are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Password must be at least 8 characters long'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            role: role || 'CITIZEN'
        });

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: user.toJSON(),
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to create user'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid email or password'
            });
        }

        // Check if active
        if (!user.isActive) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Account is inactive'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            user: user.toJSON(),
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to login'
        });
    }
});

// Get Current User
router.get('/me', authenticate, async (req, res) => {
    res.json({ user: req.user.toJSON() });
});

// Refresh Token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        res.json({ accessToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

module.exports = router;
