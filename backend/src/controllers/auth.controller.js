const authService = require('../services/auth.service');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { user, token } = await authService.register(req.body);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user,
            token,
        });
    } catch (error) {
        if (error.message === 'Email already registered') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: user,
            token,
        });
    } catch (error) {
        if (error.message === 'Invalid credentials' || error.message === 'Account is deactivated') {
            return res.status(401).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await authService.getMe(req.user.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};
