const { prisma } = require('../config/database');

class OrderService {
    async createOrder(data) {
        const { restaurantId, tableId, items, customerId, customerName, customerPhone, specialInstructions } = data;

        // 1. Get Table to ensure it exists and belongs to restaurant
        const table = await prisma.table.findUnique({ where: { id: tableId } });
        if (!table || table.restaurantId !== restaurantId) {
            throw new Error('Invalid table');
        }

        // 2. Fetch prices and prepare OrderItems
        // items = [{ menuItemId, quantity, modifiers, specialInstructions }]
        const orderItemsData = [];

        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
            });

            if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

            let modifiersPrice = 0;
            let modifierDetails = [];

            if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
                // Assume item.modifiers are IDs of ModifierOption
                const options = await prisma.modifierOption.findMany({
                    where: {
                        id: { in: item.modifiers }
                    }
                });

                modifiersPrice = options.reduce((sum, opt) => sum + Number(opt.priceAdjustment), 0);
                modifierDetails = options.map(opt => `${opt.name} (+${Number(opt.priceAdjustment)})`);
            }

            const unitPrice = Number(menuItem.price) + modifiersPrice;

            orderItemsData.push({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: unitPrice,
                modifiers: modifierDetails,
                specialInstructions: item.specialInstructions,
            });
        }

        // 3. Create Order
        const count = await prisma.order.count({ where: { restaurantId } });
        const orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;

        const order = await prisma.order.create({
            data: {
                restaurantId,
                tableId,
                customerId,
                customerName,
                customerPhone,
                specialInstructions,
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

        // Increment orderCount for each menu item (for popularity tracking)
        for (const item of items) {
            await prisma.menuItem.update({
                where: { id: item.menuItemId },
                data: {
                    orderCount: {
                        increment: item.quantity
                    }
                }
            });
        }

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
