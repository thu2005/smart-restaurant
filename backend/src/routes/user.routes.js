const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (SUPER_ADMIN and ADMIN)
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin, Waiter, or Kitchen Staff)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, WAITER, KITCHEN]
 *               restaurantId:
 *                 type: string
 *                 description: Required for ADMIN creating WAITER/KITCHEN accounts
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or email already exists
 *       403:
 *         description: Unauthorized
 */
router.post(
    '/',
    protect,
    authorize('SUPER_ADMIN', 'ADMIN'),
    [
        check('email', 'Valid email is required').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        check('fullName', 'Full name is required').not().isEmpty(),
        check('role', 'Role is required').isIn(['ADMIN', 'WAITER', 'KITCHEN']),
    ],
    userController.createUser
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (filtered by role and restaurant)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, WAITER, KITCHEN]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Unauthorized
 */
router.get(
    '/',
    protect,
    authorize('SUPER_ADMIN', 'ADMIN'),
    userController.getAllUsers
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 */
router.put(
    '/profile',
    protect,
    [
        check('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    userController.updateOwnProfile
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       403:
 *         description: Unauthorized
 */
router.get(
    '/:id',
    protect,
    authorize('SUPER_ADMIN', 'ADMIN'),
    userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               avatar:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Unauthorized
 */
router.put(
    '/:id',
    protect,
    authorize('SUPER_ADMIN', 'ADMIN'),
    [
        check('email').optional().isEmail().withMessage('Valid email is required'),
        check('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Toggle user active status (activate/deactivate)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 *       404:
 *         description: User not found
 *       403:
 *         description: Unauthorized
 */
router.patch(
    '/:id/status',
    protect,
    authorize('SUPER_ADMIN', 'ADMIN'),
    userController.toggleUserStatus
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (permanent removal)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Unauthorized
 */
router.delete(
    '/:id',
    protect,
    authorize('SUPER_ADMIN', 'ADMIN'),
    userController.deleteUser
);

module.exports = router;
