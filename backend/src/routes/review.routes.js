const express = require('express');
const { check } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Menu item reviews
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Add a new review for a menu item
 *     tags: [Review]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemId
 *               - restaurantId
 *               - rating
 *             properties:
 *               menuItemId:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.post(
    '/',
    protect,
    authorize('CUSTOMER', 'ADMIN', 'SUPER_ADMIN'), // Allow customers and admins to review? usually customers
    [
        check('menuItemId', 'Menu Item ID is required').not().isEmpty(),
        check('restaurantId', 'Restaurant ID is required').not().isEmpty(),
        check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
        check('comment', 'Comment is optional').optional().isString()
    ],
    reviewController.createReview
);

/**
 * @swagger
 * /api/reviews/{menuItemId}:
 *   get:
 *     summary: Get reviews for a specific menu item
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/:menuItemId', reviewController.getReviews);

module.exports = router;
