const express = require('express');
const { check } = require('express-validator');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management for table sessions
 */

/**
 * @swagger
 * /api/carts/session:
 *   post:
 *     summary: Get or create a cart for a table session
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableId
 *               - restaurantId
 *             properties:
 *               tableId:
 *                 type: string
 *                 description: Table ID
 *               restaurantId:
 *                 type: string
 *                 description: Restaurant ID
 *               sessionId:
 *                 type: string
 *                 description: Optional session identifier
 *               customerId:
 *                 type: string
 *                 description: Optional customer ID for logged-in users
 *     responses:
 *       200:
 *         description: Cart retrieved or created
 *       400:
 *         description: Validation error
 */
router.post(
    '/session',
    [
        check('tableId', 'Table ID is required').not().isEmpty(),
        check('restaurantId', 'Restaurant ID is required').not().isEmpty(),
    ],
    cartController.getOrCreateCart
);

/**
 * @swagger
 * /api/carts/{id}:
 *   get:
 *     summary: Get cart by ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart ID
 *     responses:
 *       200:
 *         description: Cart details
 *       404:
 *         description: Cart not found
 */
router.get('/:id', cartController.getCart);

/**
 * @swagger
 * /api/carts/table/{tableId}:
 *   get:
 *     summary: Get cart by table and session
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Cart details
 *       404:
 *         description: Cart not found
 */
router.get('/table/:tableId', cartController.getCartByTable);

/**
 * @swagger
 * /api/carts/{id}/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemId
 *               - quantity
 *             properties:
 *               menuItemId:
 *                 type: string
 *                 description: Menu item ID
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantity
 *               modifiers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Selected modifiers
 *               specialInstructions:
 *                 type: string
 *                 description: Special instructions for this item
 *     responses:
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Validation error or item not available
 */
router.post(
    '/:id/items',
    [
        check('menuItemId', 'Menu item ID is required').not().isEmpty(),
        check('quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
    ],
    cartController.addItemToCart
);

/**
 * @swagger
 * /api/carts/items/{itemId}:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: New quantity
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Validation error
 */
router.patch(
    '/items/:itemId',
    [
        check('quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
    ],
    cartController.updateCartItem
);

/**
 * @swagger
 * /api/carts/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Cart item not found
 */
router.delete('/items/:itemId', cartController.removeCartItem);

/**
 * @swagger
 * /api/carts/{id}/clear:
 *   delete:
 *     summary: Clear cart (remove all items)
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart ID
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/:id/clear', cartController.clearCart);

/**
 * @swagger
 * /api/carts/{id}/checkout:
 *   post:
 *     summary: Convert cart to order (checkout)
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Customer name (for guest orders)
 *               customerPhone:
 *                 type: string
 *                 description: Customer phone (for guest orders)
 *               specialInstructions:
 *                 type: string
 *                 description: Special instructions for the entire order
 *     responses:
 *       201:
 *         description: Order created from cart
 *       400:
 *         description: Cart is empty or not found
 */
router.post('/:id/checkout', cartController.convertCartToOrder);

module.exports = router;
