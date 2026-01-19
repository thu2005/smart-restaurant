const { prisma } = require('../config/database');
exports.getBillByBillId = async (req, res, next) => {
    try {
        const bill = await prisma.bill.findUnique({
            where: { id: req.params.billId },
            include: {
                order: {
                    include: {
                        orderItems: { include: { menuItem: true } },
                        table: true,
                        customer: true
                    }
                },
                restaurant: true
            }
        });
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, data: bill });
    } catch (error) {
        next(error);
    }
};
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

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check authorization - user must be staff of the restaurant or customer who owns the order
        if (req.user.restaurantId && req.user.restaurantId !== order.restaurantId) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, rejectionReason } = req.body;
        const { id } = req.params;

        const order = await orderService.updateStatus(id, status, req.user.id, rejectionReason);

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

exports.createBill = async (req, res, next) => {
    try {
        const bill = await orderService.createBill(req.params.id, req.user?.id);

        // Emit socket event to notify customer that bill is ready
        const io = req.app.get('io');
        if (io && bill.order) {
            const eventData = {
                orderId: bill.order.id,
                orderNumber: bill.order.orderNumber,
                tableNumber: bill.order.table?.tableNumber,
                billData: {
                    subtotal: bill.bill.subtotal,
                    tax: bill.bill.tax,
                    total: bill.bill.total
                }
            };
            
            // Determine if this is from customer request or waiter creating bill
            // If user is a waiter/staff, emit bill_created, otherwise bill_requested
            const isWaiterCreated = req.user && (req.user.role === 'WAITER' || req.user.role === 'ADMIN');
            const eventName = isWaiterCreated ? 'bill_created' : 'bill_requested';
            
            console.log(`[SOCKET] Emitting ${eventName}`, {
                restaurantId: bill.order.restaurantId,
                ...eventData
            });
            
            io.to(bill.order.restaurantId).emit(eventName, eventData);
        }

        res.status(200).json({ success: true, data: bill });
    } catch (error) {
        if (error.message === 'Order not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.getBill = async (req, res, next) => {
    try {
        const bill = await orderService.getBillDetails(req.params.id);
        res.status(200).json({ success: true, data: bill });
    } catch (error) {
        if (error.message === 'Order not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.applyDiscount = async (req, res, next) => {
    try {
        const { amount } = req.body;
        // Basic validation
        if (amount == null || amount < 0) {
            return res.status(400).json({ success: false, message: 'Invalid discount amount' });
        }
        const order = await orderService.applyDiscount(req.params.id, amount);
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        if (error.message === 'Order not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.printBill = async (req, res, next) => {
    try {
        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bill-${req.params.id}.pdf`);

        await orderService.generateBillPDF(req.params.id, res);
    } catch (error) {
        if (error.message === 'Order not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.updateOrderItemStatus = async (req, res, next) => {
    try {
        const { orderId, itemId } = req.params;
        const { itemStatus } = req.body;

        const updatedItem = await orderService.updateOrderItemStatus(orderId, itemId, itemStatus);
        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        if (error.message === 'Order not found' || error.message === 'Order item not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.getWaiterTables = async (req, res, next) => {
    try {
        const waiterId = req.user.id;
        const tables = await orderService.getWaiterTables(waiterId);
        res.status(200).json({ success: true, data: tables });
    } catch (error) {
        next(error);
    }
};

exports.getWaiterOrders = async (req, res, next) => {
    try {
        const waiterId = req.user.id;
        const { status } = req.query;
        const orders = await orderService.getWaiterOrders(waiterId, status);
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active order for a table
 * Used by frontend to check if table has ongoing order
 */
exports.getActiveOrderByTable = async (req, res, next) => {
    try {
        const { tableId, restaurantId } = req.query;

        if (!tableId || !restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'tableId and restaurantId are required'
            });
        }

        const order = await orderService.getActiveOrderByTable(tableId, restaurantId);

        res.status(200).json({
            success: true,
            data: order // null if no active order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add items to existing order
 * Maintains single order per table session
 */
exports.addItemsToOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { orderId } = req.params;
        const { items } = req.body; // Array of { menuItemId, quantity, modifiers, specialInstructions }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'items array is required and must not be empty'
            });
        }

        const updatedOrder = await orderService.addItemsToOrder(orderId, items);

        // Emit socket event for new items
        const io = req.app.get('io');
        if (io) {
            io.to(updatedOrder.restaurantId).emit('order_items_added', {
                orderId: updatedOrder.id,
                orderNumber: updatedOrder.orderNumber,
                newItemsCount: items.length
            });
        }

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Cannot add items')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * Get bills for a restaurant, filter by paid/unpaid
 * Query: ?restaurantId=...&status=PAID|UNPAID
 */
exports.getBillsByStatus = async (req, res, next) => {
    try {
        const { restaurantId, status } = req.query;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: 'restaurantId is required' });
        }
        // Only allow staff of restaurant
        if (req.user.restaurantId && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const bills = await orderService.getBillsByStatus(restaurantId, status);
        res.status(200).json({ success: true, data: bills });
    } catch (error) {
        next(error);
    }
};

/**
 * Get customer order history (completed orders only)
 * Requires authentication
 */
exports.getCustomerOrderHistory = async (req, res, next) => {
    try {
        const customerId = req.user.id; // From auth middleware
        const { limit = 20, offset = 0 } = req.query;

        const { orders, total } = await orderService.getCustomerOrderHistory(customerId, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};
