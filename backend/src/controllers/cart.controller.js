const cartService = require('../services/cart.service');
const { validationResult } = require('express-validator');

/**
 * @desc    Get or create cart for a table session
 * @route   POST /api/carts/session
 * @access  Public
 */
exports.getOrCreateCart = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { tableId, restaurantId, sessionId, customerId } = req.body;

        const cart = await cartService.getOrCreateCart(tableId, restaurantId, sessionId, customerId);
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get cart by ID
 * @route   GET /api/carts/:id
 * @access  Public
 */
exports.getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.params.id);
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        if (error.message === 'Cart not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Get cart by table and session
 * @route   GET /api/carts/table/:tableId
 * @access  Public
 */
exports.getCartByTable = async (req, res, next) => {
    try {
        const { tableId } = req.params;
        const { sessionId, restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
        }

        const cart = await cartService.getCartByTableSession(tableId, sessionId, restaurantId);
        
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/carts/:id/items
 * @access  Public
 */
exports.addItemToCart = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const { menuItemId, quantity, modifiers, specialInstructions } = req.body;

        const cartItem = await cartService.addItemToCart(
            id,
            menuItemId,
            quantity,
            modifiers || [],
            specialInstructions
        );

        res.status(201).json({ success: true, data: cartItem });
    } catch (error) {
        if (error.message === 'Menu item not found' || error.message === 'Menu item is not available') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PATCH /api/carts/items/:itemId
 * @access  Public
 */
exports.updateCartItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { itemId } = req.params;
        const { quantity } = req.body;

        const cartItem = await cartService.updateCartItem(itemId, quantity);
        res.status(200).json({ success: true, data: cartItem });
    } catch (error) {
        if (error.message === 'Quantity must be greater than 0') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/carts/items/:itemId
 * @access  Public
 */
exports.removeCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const result = await cartService.removeCartItem(itemId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Cart item not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * @desc    Clear cart (remove all items)
 * @route   DELETE /api/carts/:id/clear
 * @access  Public
 */
exports.clearCart = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await cartService.clearCart(id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Convert cart to order
 * @route   POST /api/carts/:id/checkout
 * @access  Public
 */
exports.convertCartToOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const orderData = req.body;

        const order = await cartService.convertCartToOrder(id, orderData);
        
        // Emit socket event for new order
        if (req.app.get('io')) {
            const io = req.app.get('io');
            io.to(order.restaurantId).emit('new_order', order);
        }

        res.status(201).json({ 
            success: true, 
            data: order,
            message: 'Order created successfully from cart'
        });
    } catch (error) {
        if (error.message === 'Cart is empty' || error.message === 'Cart not found') {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};
