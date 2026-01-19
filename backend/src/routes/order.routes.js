const express = require("express");
const { check } = require("express-validator");
const orderController = require("../controllers/order.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

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
  "/",
  [
    check("restaurantId", "Restaurant ID is required").not().isEmpty(),
    check("tableId", "Table ID is required").not().isEmpty(),
    check("items", "Items must be an array").isArray(),
    check("items.*.menuItemId", "Menu Item ID is required").not().isEmpty(),
    check("items.*.quantity", "Quantity must be greater than 0").isInt({
      min: 1,
    }),
    check("customerName").optional().isString().isLength({ max: 100 }),
    check("customerPhone").optional().isString().isLength({ max: 20 }),
    check("specialInstructions").optional().isString().isLength({ max: 500 }),
  ],
  orderController.createOrder,
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
  "/",
  protect,
  authorize("ADMIN", "WAITER", "KITCHEN", "SUPER_ADMIN"),
  orderController.getOrders,
);

/**
 * @swagger
 * /api/orders/active:
 *   get:
 *     summary: Get active order for a table (not completed/cancelled)
 *     tags: [Order]
 *     parameters:
 *       - in: query
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active order found (or null if none)
 */
router.get("/active", orderController.getActiveOrderByTable);

/**
 * @swagger
 * /api/orders/bills:
 *   get:
 *     summary: Get bills for restaurant, filter by paid/unpaid
 *     tags: [Order]
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
 *           enum: [PAID, UNPAID]
 *     responses:
 *       200:
 *         description: List of bills
 */
router.get(
  "/bills",
  protect,
  authorize("WAITER", "ADMIN", "SUPER_ADMIN"),
  orderController.getBillsByStatus,
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get("/:id", protect, orderController.getOrderById);

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
  "/:id/status",
  protect,
  authorize("ADMIN", "WAITER", "KITCHEN"),
  orderController.updateOrderStatus,
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
  "/:id/bill",
  protect,
  authorize("ADMIN", "WAITER"),
  orderController.createBill,
);

/**
 * @swagger
 * /api/orders/{id}/request-bill:
 *   post:
 *     tags: [Orders]
 *     summary: Customer requests bill (Updates status to PAYMENT_PENDING)
 *     description: Allows customers to request their bill when ready to pay
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Bill request successful
 *       404:
 *         description: Order not found
 */
router.post("/:id/request-bill", protect, orderController.createBill);

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
router.get("/:id/bill", orderController.getBill);

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
  "/:id/discount",
  [check("amount", "Amount must be positive").isFloat({ min: 0 })],
  protect,
  authorize("SUPER_ADMIN", "ADMIN", "WAITER"),
  orderController.applyDiscount,
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
router.get("/:id/bill/pdf", orderController.printBill);

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
router.get("/bill/:billId", orderController.getBillByBillId);

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemId}/status:
 *   patch:
 *     summary: Update individual order item status (accept/reject)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
 *               itemStatus:
 *                 type: string
 *                 enum: [queued, cooking, ready, rejected]
 *     responses:
 *       200:
 *         description: Order item status updated
 */
router.patch(
  "/:orderId/items/:itemId/status",
  protect,
  authorize("ADMIN", "WAITER", "KITCHEN"),
  orderController.updateOrderItemStatus,
);

/**
 * @swagger
 * /api/orders/waiter/my-tables:
 *   get:
 *     summary: Get tables with orders accepted by the logged-in waiter
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tables assigned to waiter
 */
router.get(
  "/waiter/my-tables",
  protect,
  authorize("WAITER"),
  orderController.getWaiterTables,
);

/**
 * @swagger
 * /api/orders/waiter/my-orders:
 *   get:
 *     summary: Get all orders accepted by the logged-in waiter
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders accepted by waiter
 */
router.get(
  "/waiter/my-orders",
  protect,
  authorize("WAITER"),
  orderController.getWaiterOrders,
);

/**
 * @swagger
 * /api/orders/{orderId}/items:
 *   post:
 *     summary: Add items to existing order (for "add more items" flow)
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     modifiers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     specialInstructions:
 *                       type: string
 *     responses:
 *       200:
 *         description: Items added to order successfully
 */
router.post(
  "/:orderId/items",
  [
    check("items", "Items must be an array").isArray(),
    check("items.*.menuItemId", "Menu Item ID is required").not().isEmpty(),
    check("items.*.quantity", "Quantity must be greater than 0").isInt({
      min: 1,
    }),
  ],
  orderController.addItemsToOrder,
);

/**
 * @swagger
 * /api/orders/bills:
 *   get:
 *     summary: Get bills for restaurant, filter by paid/unpaid
 *     tags: [Order]
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
 *           enum: [PAID, UNPAID]
 *     responses:
 *       200:
 *         description: List of bills
 */
router.get(
  "/bills",
  protect,
  authorize("WAITER", "ADMIN", "SUPER_ADMIN"),
  orderController.getBillsByStatus,
);

/**
 * @swagger
 * /api/orders/customer/history:
 *   get:
 *     summary: Get customer order history (completed orders only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of completed orders
 */
router.get(
  "/customer/history",
  protect,
  authorize("CUSTOMER"),
  orderController.getCustomerOrderHistory,
);

module.exports = router;
