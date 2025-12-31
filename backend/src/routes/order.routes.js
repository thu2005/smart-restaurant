const express = require('express');
const { check } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order processing
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - tableId
 *               - items
 *             properties:
 *               restaurantId:
 *                 type: string
 *               tableId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     specialInstructions:
 *                       type: string
 *                       description: Item-specific special instructions (optional)
 *               customerName:
 *                 type: string
 *                 description: Name of the customer (optional)
 *               customerPhone:
 *                 type: string
 *                 description: Phone number of the customer (optional)
 *               specialInstructions:
 *                 type: string
 *                 description: Special instructions for the order (optional)
 *     responses:
 *       201:
 *         description: Order created
 */
router.post(
    '/',
    [
        check('restaurantId', 'Restaurant ID is required').not().isEmpty(),
        check('tableId', 'Table ID is required').not().isEmpty(),
        check('items', 'Items must be an array').isArray(),
        check('items.*.menuItemId', 'Menu Item ID is required').not().isEmpty(),
        check('items.*.quantity', 'Quantity must be greater than 0').isInt({ min: 1 }),
        check('customerName').optional().isString().isLength({ max: 100 }),
        check('customerPhone').optional().isString().isLength({ max: 20 }),
        check('specialInstructions').optional().isString().isLength({ max: 500 })
    ],
    orderController.createOrder
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (Staff)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *       - in: query
 *         name: status
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get(
    '/',
    protect,
    authorize('ADMIN', 'WAITER', 'KITCHEN', 'SUPER_ADMIN'),
    orderController.getOrders
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [RECEIVED, PREPARING, READY, SERVED, CANCELLED, COMPLETED]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.patch(
    '/:id/status',
    protect,
    authorize('ADMIN', 'WAITER', 'KITCHEN'),
    orderController.updateOrderStatus
);

module.exports = router;
