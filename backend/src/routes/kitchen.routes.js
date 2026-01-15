const express = require('express');
const kitchenController = require('../controllers/kitchen.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Kitchen
 *   description: Kitchen display and order management
 */

/**
 * @swagger
 * /api/kitchen/orders:
 *   get:
 *     summary: Get all kitchen orders (RECEIVED, PREPARING, READY)
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, RECEIVED, PREPARING, READY]
 *     responses:
 *       200:
 *         description: List of kitchen orders
 */
router.get(
    '/orders',
    protect,
    authorize('KITCHEN', 'ADMIN', 'SUPER_ADMIN'),
    kitchenController.getKitchenOrders
);

/**
 * @swagger
 * /api/kitchen/orders/{id}/status:
 *   put:
 *     summary: Update order status (Kitchen)
 *     tags: [Kitchen]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PREPARING, READY]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put(
    '/orders/:id/status',
    protect,
    authorize('KITCHEN', 'ADMIN', 'SUPER_ADMIN'),
    kitchenController.updateOrderStatus
);

/**
 * @swagger
 * /api/kitchen/stats:
 *   get:
 *     summary: Get kitchen statistics
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kitchen statistics
 */
router.get(
    '/stats',
    protect,
    authorize('KITCHEN', 'ADMIN', 'SUPER_ADMIN'),
    kitchenController.getKitchenStats
);

module.exports = router;
