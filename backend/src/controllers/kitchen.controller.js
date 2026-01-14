const kitchenService = require('../services/kitchen.service');

exports.getKitchenOrders = async (req, res, next) => {
    try {
        const { restaurantId } = req.query;

        // If user is kitchen staff, ensure they access their own restaurant
        if (req.user.restaurantId && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized access to this restaurant orders' 
            });
        }

        const filters = {
            status: req.query.status
        };

        const orders = await kitchenService.getKitchenOrders(restaurantId, filters);
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const order = await kitchenService.updateOrderStatus(id, status);

        // Emit socket event for real-time updates
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

exports.getKitchenStats = async (req, res, next) => {
    try {
        const { restaurantId } = req.query;

        // If user is kitchen staff, ensure they access their own restaurant
        if (req.user.restaurantId && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized access to this restaurant stats' 
            });
        }

        const stats = await kitchenService.getKitchenStats(restaurantId);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};
