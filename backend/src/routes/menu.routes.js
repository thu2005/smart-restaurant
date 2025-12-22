const express = require('express');
const { check } = require('express-validator');
const menuController = require('../controllers/menu.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management
 */

// --- Public Routes ---

/**
 * @swagger
 * /api/menu/{restaurantId}/categories:
 *   get:
 *     summary: Get all categories and items for a restaurant
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories with items
 */
router.get('/:restaurantId/categories', menuController.getCategories);

/**
 * @swagger
 * /api/menu/{restaurantId}/items:
 *   get:
 *     summary: Get all menu items for a restaurant
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get('/:restaurantId/items', menuController.getMenuItems);
router.get('/items/:id', menuController.getMenuItemById);

// --- Protected Routes (Admin) ---

/**
 * @swagger
 * /api/menu/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - restaurantId
 *             properties:
 *               name:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
    '/categories',
    protect,
    authorize('ADMIN', 'SUPER_ADMIN'),
    menuController.createCategory
);

/**
 * @swagger
 * /api/menu/items:
 *   post:
 *     summary: Create a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *               - restaurantId
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created
 */
router.post(
    '/items',
    protect,
    authorize('ADMIN', 'SUPER_ADMIN'),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('price', 'Price must be a number').isNumeric(),
        check('categoryId', 'Category ID is required').not().isEmpty(),
        check('restaurantId', 'Restaurant ID is required').not().isEmpty(),
    ],
    menuController.createMenuItem
);

router.put('/items/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), menuController.updateMenuItem);
router.delete('/items/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), menuController.deleteMenuItem);

module.exports = router;
