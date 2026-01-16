const userService = require('../services/user.service');
const { validationResult } = require('express-validator');

/**
 * @desc    Create a new user (Admin, Waiter, Kitchen Staff)
 * @route   POST /api/users
 * @access  Private (SUPER_ADMIN creates ADMIN, ADMIN creates WAITER/KITCHEN)
 */
exports.createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const user = await userService.createUser(req.body, req.user.role);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        if (error.message === 'Email already registered' || 
            error.message.includes('can only create') ||
            error.message === 'Unauthorized to create user accounts' ||
            error.message === 'Restaurant ID is required for creating staff accounts') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Get all users (filtered by role and restaurant)
 * @route   GET /api/users
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role, isActive } = req.query;
        const filters = {};

        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const users = await userService.getAllUsers(
            req.user.role, 
            req.user.restaurantId, 
            filters
        );

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        if (error.message === 'Unauthorized to view users') {
            return res.status(403).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
exports.getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(
            req.params.id, 
            req.user.role, 
            req.user.restaurantId
        );

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('can only view') || error.message === 'Unauthorized to view this user') {
            return res.status(403).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
exports.updateUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const user = await userService.updateUser(
            req.params.id, 
            req.body, 
            req.user.role, 
            req.user.restaurantId
        );

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === 'Email already registered' ||
            error.message.includes('can only update') ||
            error.message === 'Unauthorized to update this user') {
            return res.status(403).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Toggle user active status (activate/deactivate)
 * @route   PATCH /api/users/:id/status
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                message: 'isActive must be a boolean value' 
            });
        }

        const user = await userService.toggleUserStatus(
            req.params.id, 
            isActive, 
            req.user.role, 
            req.user.restaurantId
        );

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('can only manage') || error.message === 'Unauthorized to manage this user') {
            return res.status(403).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Delete user (permanent removal)
 * @route   DELETE /api/users/:id
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const result = await userService.deleteUser(
            req.params.id, 
            req.user.role, 
            req.user.restaurantId
        );

        res.status(200).json({
            success: true,
            message: result.message,
            data: { id: result.id, email: result.email }
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('can only delete') || error.message === 'Unauthorized to delete this user') {
            return res.status(403).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Update own profile
 * @route   PUT /api/users/profile
 * @access  Private (Any authenticated user)
 */
exports.updateOwnProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const user = await userService.updateOwnProfile(req.user.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};
