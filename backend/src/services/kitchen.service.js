const { prisma } = require('../config/database');

class KitchenService {
    /**
     * Get all orders for kitchen display (RECEIVED, PREPARING, READY)
     */
    async getKitchenOrders(restaurantId, filters = {}) {
        const { status } = filters;

        const where = {
            restaurantId,
            // Kitchen sees orders that are accepted by waiter and beyond
            status: {
                in: ['RECEIVED', 'PREPARING', 'READY']
            }
        };

        // Filter by specific status if provided
        if (status && status !== 'all') {
            if (status.includes(',')) {
                where.status = { in: status.split(',').map(s => s.trim()) };
            } else {
                where.status = status;
            }
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                orderItems: {
                    include: {
                        menuItem: true
                    }
                },
                table: true,
                customer: true
            },
            orderBy: {
                submittedAt: 'asc' // Oldest first
            }
        });

        return orders;
    }

    /**
     * Update order status (Kitchen staff marking as PREPARING or READY)
     */
    async updateOrderStatus(orderId, status) {
        const validStatuses = ['PREPARING', 'READY', 'COMPLETED', 'SERVED'];

        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            throw new Error('Order not found');
        }

        const updateData = { status };

        // Set timestamps based on status
        if (status === 'PREPARING' && !order.preparingAt) {
            updateData.preparingAt = new Date();
        } else if (status === 'READY' && !order.readyAt) {
            updateData.readyAt = new Date();
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                orderItems: {
                    include: {
                        menuItem: true
                    }
                },
                table: true,
                customer: true
            }
        });

        return updatedOrder;
    }

    /**
     * Get kitchen statistics
     */
    async getKitchenStats(restaurantId) {
        const [newOrders, preparing, ready] = await Promise.all([
            prisma.order.count({
                where: { restaurantId, status: 'RECEIVED' }
            }),
            prisma.order.count({
                where: { restaurantId, status: 'PREPARING' }
            }),
            prisma.order.count({
                where: { restaurantId, status: 'READY' }
            })
        ]);

        // Calculate average prep time for orders in PREPARING or READY status
        const ordersWithPrepTime = await prisma.order.findMany({
            where: {
                restaurantId,
                status: { in: ['PREPARING', 'READY', 'SERVED'] },
                preparingAt: { not: null },
                submittedAt: { not: null }
            },
            select: {
                submittedAt: true,
                preparingAt: true
            },
            take: 50 // Last 50 orders for average
        });

        let avgPrepTime = 0;
        if (ordersWithPrepTime.length > 0) {
            const totalTime = ordersWithPrepTime.reduce((sum, order) => {
                const diff = new Date(order.preparingAt) - new Date(order.submittedAt);
                return sum + (diff / 60000); // Convert to minutes
            }, 0);
            avgPrepTime = Math.round(totalTime / ordersWithPrepTime.length);
        }

        return {
            newOrders,
            preparing,
            ready,
            avgPrepTime
        };
    }
    /**
     * Update individual item status and propagate to order status
     */
    async updateOrderItemStatus(orderId, itemId, itemStatus) {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update the item
            await tx.orderItem.update({
                where: { id: itemId },
                data: { itemStatus }
            });

            // 2. Fetch order and all items to decide order status
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { orderItems: true }
            });

            if (!order) throw new Error('Order not found');

            const items = order.orderItems;
            
            // Logic to determine new order status
            let newOrderStatus = order.status;

            // count statuses
            const readyItems = items.filter(i => i.itemStatus === 'ready').length;
            const cookingItems = items.filter(i => i.itemStatus === 'cooking').length;
            const queuedItems = items.filter(i => i.itemStatus === 'queued' || !i.itemStatus).length;
            const historyItems = items.filter(i => ['served', 'completed', 'rejected'].includes(i.itemStatus)).length;

            // An order is READY if there are NO items left in 'queued' or 'cooking' 
            // AND there is at least one item in 'ready' (the current batch)
            if (queuedItems === 0 && cookingItems === 0 && readyItems > 0) {
                newOrderStatus = 'READY';
            } else if (cookingItems > 0 || readyItems > 0) {
                // At least one item is cooking or ready -> Order is PREPARING
                if (['RECEIVED', 'SUBMITTED', 'PENDING'].includes(order.status)) {
                    newOrderStatus = 'PREPARING';
                }
            }
            
            // Only update order if status has changed
            if (newOrderStatus !== order.status) {
                await tx.order.update({
                    where: { id: orderId },
                    data: { 
                        status: newOrderStatus,
                        // Set timestamps
                        preparingAt: newOrderStatus === 'PREPARING' && !order.preparingAt ? new Date() : order.preparingAt,
                        readyAt: newOrderStatus === 'READY' && !order.readyAt ? new Date() : order.readyAt
                    }
                });
            }

            // Return fully populated order
            return await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    orderItems: { include: { menuItem: true } },
                    table: true,
                    customer: true
                }
            });
        });

        return result;
    }
}

module.exports = new KitchenService();
