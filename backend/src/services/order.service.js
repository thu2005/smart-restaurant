const { prisma } = require('../config/database');

class OrderService {
    async createOrder(data) {
        const { restaurantId, tableId, items, customerId } = data;

        // 1. Get Table to ensure it exists and belongs to restaurant
        const table = await prisma.table.findUnique({ where: { id: tableId } });
        if (!table || table.restaurantId !== restaurantId) {
            throw new Error('Invalid table');
        }

        // 2. Fetch prices and prepare OrderItems
        // items = [{ menuItemId, quantity, modifiers, specialInstructions }]
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
            });

            if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

            const unitPrice = menuItem.price;
            orderItemsData.push({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: unitPrice,
                modifiers: item.modifiers || [],
                specialInstructions: item.specialInstructions,
            });
            // Note: Total isn't stored on Order directly in schema (calculated from items or Payment will have it),
            // but schema has Payment model with 'total'. Order model tracks status.
        }

        // 3. Create Order
        // Generate simple order number (e.g., last + 1, or random. UUID is primary key)
        const count = await prisma.order.count({ where: { restaurantId } });
        const orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;

        const order = await prisma.order.create({
            data: {
                restaurantId,
                tableId,
                customerId,
                orderNumber,
                status: 'SUBMITTED',
                submittedAt: new Date(),
                orderItems: {
                    create: orderItemsData,
                },
            },
            include: {
                orderItems: {
                    include: { menuItem: true }
                },
                table: true
            },
        });

        return order;
    }

    async getOrders(restaurantId, filters = {}) {
        const { status, tableId } = filters;
        const where = { restaurantId };

        if (status) where.status = status;
        if (tableId) where.tableId = tableId;

        return await prisma.order.findMany({
            where,
            include: {
                orderItems: {
                    include: { menuItem: true },
                },
                table: true,
                customer: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(orderId, status, userId) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new Error('Order not found');

        const updateData = { status };
        const now = new Date();

        if (status === 'RECEIVED') {
            updateData.acceptedAt = now;
            updateData.acceptedById = userId; // Waiter
        } else if (status === 'PREPARING') {
            updateData.preparingAt = now;
        } else if (status === 'READY') {
            updateData.readyAt = now;
        } else if (status === 'SERVED') {
            updateData.servedAt = now;
        } else if (status === 'COMPLETED') {
            updateData.completedAt = now;
        }

        return await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                orderItems: true,
                table: true
            }
        });
    }
}

module.exports = new OrderService();
