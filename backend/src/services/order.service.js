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

        // Handle multiple statuses (comma-separated string)
        if (status) {
            if (status.includes(',')) {
                // Split comma-separated statuses into array
                where.status = { in: status.split(',').map(s => s.trim()) };
            } else {
                where.status = status;
            }
        }
        if (tableId) where.tableId = tableId;

        const orders = await prisma.order.findMany({
            where,
            include: {
                orderItems: {
                    include: { menuItem: true },
                },
                table: true,
                customer: true,
                bill: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate total for each order
        return orders.map(order => {
            let total = 0;
            
            if (order.bill) {
                // If bill exists, use bill total
                total = Number(order.bill.total);
            } else {
                // Calculate total from order items
                let subtotal = 0;
                for (const item of order.orderItems) {
                    subtotal += (Number(item.unitPrice) * item.quantity);
                }
                const discount = Number(order.discount) || 0;
                const taxRate = 0.1;
                const subtotalAfterDiscount = Math.max(0, subtotal - discount);
                const tax = subtotalAfterDiscount * taxRate;
                total = subtotalAfterDiscount + tax;
            }

            return {
                ...order,
                total: total
            };
        });
    }

    async updateStatus(orderId, status, userId, rejectionReason = null) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new Error('Order not found');

        const updateData = { status };
        const now = new Date();

        if (status === 'RECEIVED') {
            updateData.acceptedAt = now;
            updateData.acceptedById = userId; // Waiter
        } else if (status === 'REJECTED') {
            updateData.rejectionReason = rejectionReason;
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
    async createBill(orderId, userId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        });

        if (!order) throw new Error('Order not found');

        // Check if bill already exists
        const existingBill = await prisma.bill.findUnique({ where: { orderId } });
        if (existingBill) return this.getBillDetails(orderId);

        // Calculate totals
        let subtotal = 0;
        for (const item of order.orderItems) {
            subtotal += (Number(item.unitPrice) * item.quantity);
        }
        const discount = Number(order.discount) || 0;
        const taxRate = 0.1;
        const subtotalAfterDiscount = Math.max(0, subtotal - discount);
        const tax = subtotalAfterDiscount * taxRate;
        const total = subtotalAfterDiscount + tax;

        // Transaction: Update status + Create Bill
        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAYMENT_PENDING' }
            }),
            prisma.bill.create({
                data: {
                    orderId,
                    restaurantId: order.restaurantId,
                    billNumber: order.orderNumber.replace('ORD', 'BILL'),
                    subtotal,
                    discount,
                    tax,
                    total,
                    createdBy: userId
                }
            })
        ]);

        return await this.getBillDetails(orderId);
    }

    async getBillDetails(orderId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: { include: { menuItem: true } },
                bill: true,
                payment: true,
                table: true
            }
        });

        if (!order) throw new Error('Order not found');

        // If bill exists in DB, use it. Otherwise calculate on fly (view only).
        let billData = {};
        if (order.bill) {
            billData = {
                subtotal: Number(order.bill.subtotal),
                discount: Number(order.bill.discount),
                tax: Number(order.bill.tax),
                total: Number(order.bill.total)
            };
        } else {
            let subtotal = 0;
            for (const item of order.orderItems) {
                subtotal += (Number(item.unitPrice) * item.quantity);
            }
            const discount = Number(order.discount) || 0;
            const taxRate = 0.1;
            const subtotalAfterDiscount = Math.max(0, subtotal - discount);
            const tax = subtotalAfterDiscount * taxRate;
            const total = subtotalAfterDiscount + tax;

            billData = { subtotal, discount, tax, total };
        }

        return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            billId: order.bill ? order.bill.id : null,
            billNumber: order.bill ? order.bill.billNumber : null,
            createdAt: order.bill ? order.bill.createdAt : null, // When bill was created
            customerName: order.customerName,
            items: order.orderItems.map(item => ({
                name: item.menuItem.name,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                modifiers: item.modifiers,
                total: Number(item.unitPrice) * item.quantity
            })),
            bill: billData
        };
    }

    async applyDiscount(orderId, amount) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { bill: true }
        });
        if (!order) throw new Error('Order not found');

        // Update order discount
        await prisma.order.update({
            where: { id: orderId },
            data: { discount: Number(amount) }
        });

        // If bill exists, update bill as well
        if (order.bill) {
            // Recalculate bill totals
            const orderWithItems = await prisma.order.findUnique({
                where: { id: orderId },
                include: { orderItems: true }
            });

            let subtotal = 0;
            for (const item of orderWithItems.orderItems) {
                subtotal += (Number(item.unitPrice) * item.quantity);
            }

            const discount = Number(amount);
            const taxRate = 0.1;
            const subtotalAfterDiscount = Math.max(0, subtotal - discount);
            const tax = subtotalAfterDiscount * taxRate;
            const total = subtotalAfterDiscount + tax;

            await prisma.bill.update({
                where: { id: order.bill.id },
                data: {
                    discount,
                    tax,
                    total
                }
            });
        }

        return await prisma.order.findUnique({
            where: { id: orderId },
            include: { bill: true, orderItems: { include: { menuItem: true } } }
        });
    }

    async updateOrderItemStatus(orderId, itemId, itemStatus) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new Error('Order not found');

        const orderItem = await prisma.orderItem.findUnique({ where: { id: itemId } });
        if (!orderItem || orderItem.orderId !== orderId) throw new Error('Order item not found');

        return await prisma.orderItem.update({
            where: { id: itemId },
            data: { itemStatus },
            include: { menuItem: true }
        });
    }

    async getWaiterTables(waiterId) {
        // Get waiter's restaurant ID
        const waiter = await prisma.user.findUnique({
            where: { id: waiterId },
            select: { restaurantId: true }
        });

        if (!waiter || !waiter.restaurantId) {
            return [];
        }

        // Get all tables with active orders in the restaurant
        // This includes orders accepted by this waiter OR orders that are READY/SERVED 
        // (so waiters can serve any ready order, even if another waiter/kitchen created it)
        const orders = await prisma.order.findMany({
            where: {
                restaurantId: waiter.restaurantId,
                status: { notIn: ['COMPLETED', 'CANCELLED'] },
                OR: [
                    { acceptedById: waiterId },  
                    { status: { in: ['READY', 'SERVED'] } }  
                ]
            },
            include: {
                table: true,
                orderItems: { include: { menuItem: true } }
            },
            distinct: ['tableId']
        });

        // Group by table
        const tablesMap = new Map();
        for (const order of orders) {
            if (!tablesMap.has(order.tableId)) {
                tablesMap.set(order.tableId, {
                    table: order.table,
                    orders: []
                });
            }
            tablesMap.get(order.tableId).orders.push(order);
        }

        return Array.from(tablesMap.values());
    }

    async getWaiterOrders(waiterId, status) {
        // For READY orders, show all ready orders for the restaurant (not just waiter's own)
        // so waiters can serve any ready order from kitchen
        const where = {};
        
        if (status === 'READY') {
            // Get waiter's restaurant ID
            const waiter = await prisma.user.findUnique({
                where: { id: waiterId },
                select: { restaurantId: true }
            });
            
            if (waiter && waiter.restaurantId) {
                where.restaurantId = waiter.restaurantId;
                where.status = 'READY';
            }
        } else {
            // For other statuses, only show orders accepted by this waiter
            where.acceptedById = waiterId;
            if (status) where.status = status;
        }

        return await prisma.order.findMany({
            where,
            include: {
                orderItems: { include: { menuItem: true } },
                table: true,
                customer: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Helper to streamline PDF generation logic
    async generateBillPDF(orderId, res) {
        const PDFDocument = require('pdfkit');
        const billData = await this.getBillDetails(orderId);

        const doc = new PDFDocument({ margin: 50 });

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('RESTAURANT BILL', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Order #: ${billData.orderNumber}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        if (billData.customerName) doc.text(`Customer: ${billData.customerName}`);
        doc.moveDown();

        // Table Header
        const yStart = doc.y;
        doc.text('Item', 50, yStart);
        doc.text('Qty', 250, yStart);
        doc.text('Price', 350, yStart);
        doc.text('Total', 450, yStart);
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Items
        billData.items.forEach(item => {
            const y = doc.y;
            doc.text(item.name, 50, y, { width: 190 });
            doc.text(item.quantity.toString(), 250, y);
            doc.text('$' + item.unitPrice.toFixed(2), 350, y);
            doc.text('$' + item.total.toFixed(2), 450, y);

            if (item.modifiers && item.modifiers.length > 0) {
                doc.fontSize(10).fillColor('grey').text(`  ${item.modifiers.join(', ')}`, 50, doc.y + 10);
                doc.fontSize(12).fillColor('black');
            }
            doc.moveDown();
        });

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Totals
        const rightColX = 350;
        doc.text('Subtotal:', rightColX);
        doc.text('$' + billData.bill.subtotal.toFixed(2), 450, doc.y - doc.currentLineHeight());

        if (billData.bill.discount > 0) {
            doc.text('Discount:', rightColX);
            doc.text('-$' + billData.bill.discount.toFixed(2), 450, doc.y - doc.currentLineHeight());
        }

        doc.text('Tax (10%):', rightColX);
        doc.text('$' + billData.bill.tax.toFixed(2), 450, doc.y - doc.currentLineHeight());

        doc.font('Helvetica-Bold').text('TOTAL:', rightColX, doc.y + 10);
        doc.text('$' + billData.bill.total.toFixed(2), 450, doc.y - doc.currentLineHeight());

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).text('Thank you for dining with us!', { align: 'center' });

        doc.end();
    }

}

module.exports = new OrderService();
