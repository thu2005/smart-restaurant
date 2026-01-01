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

/**
 * @swagger
 * /api/orders/{id}/bill:
 *   post:
 *     summary: Create/Generate bill for table (Updates status to PAYMENT_PENDING)
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Bill generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     bill:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 */
router.post(
    '/:id/bill',
    protect,
    authorize('ADMIN', 'WAITER'),
    orderController.createBill
);

/**
 * @swagger
 * /api/orders/{id}/bill:
 *   get:
 *     summary: Get order bill details with subtotal, tax, discount, and total
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Bill details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     bill:
 *                       type: object
 *                       properties:
 *                         subtotal:
 *                           type: number
 *                         discount:
 *                           type: number
 *                         tax:
 *                           type: number
 *                         total:
 *                           type: number
 */
router.get('/:id/bill', orderController.getBill);

/**
 * @swagger
 * /api/orders/{id}/discount:
 *   post:
 *     summary: Apply a discount to an order
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Discount amount to subtract
 *     responses:
 *       200:
 *         description: Discount applied
 *       400:
 *         description: Invalid discount amount
 */
router.post(
    '/:id/discount',
    [check('amount', 'Amount must be positive').isFloat({ min: 0 })],
    protect,
    authorize('SUPER_ADMIN', 'ADMIN', 'WAITER'),
    orderController.applyDiscount
);

/**
 * @swagger
 * /api/orders/{id}/bill/pdf:
 *   get:
 *     summary: Download bill as PDF
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/bill/pdf', orderController.printBill);

/**
 * @swagger
 * /api/orders/bill/{billId}:
 *   get:
 *     summary: Get bill details by billId
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: billId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     billId:
 *                       type: string
 *                     billNumber:
 *                       type: string
 *                     subtotal:
 *                       type: number
 *                     discount:
 *                       type: number
 *                     tax:
 *                       type: number
 *                     total:
 *                       type: number
 */
router.get('/bill/:billId', orderController.getBillByBillId);

module.exports = router;
