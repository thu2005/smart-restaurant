const orderService = require('../services/order.service');
const { validationResult } = require('express-validator');

exports.createOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Pass socket io to service or emit here?
        // Let's emit here.
        const order = await orderService.createOrder(req.body);

        const io = req.app.get('io');
        if (io) {
            // Emit to restaurant room
            io.to(req.body.restaurantId).emit('new_order', order);
        }

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const { restaurantId } = req.query;
        // Ideally extract restaurantId from user token if staff, or allow if query param matches auth
        // For simplicity, using query param verified by auth middleware logic usually

        // If user is staff, ensure they access their own restaurant
        if (req.user.restaurantId && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this restaurant orders' });
        }

        const filters = {
            status: req.query.status,
            tableId: req.query.tableId
        };

        const orders = await orderService.getOrders(restaurantId, filters);
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const order = await orderService.updateStatus(id, status, req.user.id);

        const io = req.app.get('io');
        if (io) {
            io.to(order.restaurantId).emit('order_status_update', {
                orderId: order.id,
                status: order.status,
                orderNumber: order.orderNumber
            });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        if (error.message === 'Order not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};
