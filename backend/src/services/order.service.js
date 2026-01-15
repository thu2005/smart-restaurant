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
                // item.modifiers can be:
                // 1. Array of IDs: ["mod-id-1", "mod-id-2"]
                // 2. Array of objects: [{id: "mod-id-1", quantity: 2}, ...]
                
                const modifierIds = item.modifiers.map(m => 
                    typeof m === 'object' ? m.id : m
                );

                const options = await prisma.modifierOption.findMany({
                    where: {
                        id: { in: modifierIds }
                    }
                });

                // Build modifier details with quantity
                modifierDetails = item.modifiers.map(modifier => {
                    const modId = typeof modifier === 'object' ? modifier.id : modifier;
                    const quantity = typeof modifier === 'object' ? (modifier.quantity || 1) : 1;
                    const option = options.find(opt => opt.id === modId);
                    
                    if (!option) return null;
                    
                    const priceAdjustment = Number(option.priceAdjustment) * quantity;
                    modifiersPrice += priceAdjustment;
                    
                    return {
                        id: option.id,
                        name: option.name,
                        quantity: quantity,
                        priceAdjustment: Number(option.priceAdjustment),
                        totalPrice: priceAdjustment
                    };
                }).filter(Boolean);
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

    /**
     * Get active order for a table (not completed/cancelled)
     * Used to check if table has ongoing order before creating new one
     */
    async getActiveOrderByTable(tableId, restaurantId) {
        const order = await prisma.order.findFirst({
            where: {
                tableId,
                restaurantId,
                status: {
                    notIn: ['COMPLETED', 'CANCELLED', 'REJECTED']
                }
            },
            include: {
                orderItems: {
                    include: { menuItem: true }
                },
                table: true,
                customer: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return order;
    }

    /**
     * Add new items to existing order (for "add more items" flow)
     * This maintains single order per table session
     */
    async addItemsToOrder(orderId, newItems) {
        // 1. Verify order exists and can accept new items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status)) {
            throw new Error('Cannot add items to completed/cancelled order');
        }

        // 2. Prepare new order items (same logic as createOrder)
        const orderItemsData = [];

        for (const item of newItems) {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
            });

            if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

            let modifiersPrice = 0;
            let modifierDetails = [];

            if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
                const modifierIds = item.modifiers.map(m => 
                    typeof m === 'object' ? m.id : m
                );

                const options = await prisma.modifierOption.findMany({
                    where: {
                        id: { in: modifierIds }
                    }
                });

                modifierDetails = item.modifiers.map(modifier => {
                    const modId = typeof modifier === 'object' ? modifier.id : modifier;
                    const quantity = typeof modifier === 'object' ? (modifier.quantity || 1) : 1;
                    const option = options.find(opt => opt.id === modId);
                    
                    if (!option) return null;
                    
                    const priceAdjustment = Number(option.priceAdjustment) * quantity;
                    modifiersPrice += priceAdjustment;
                    
                    return {
                        id: option.id,
                        name: option.name,
                        quantity: quantity,
                        priceAdjustment: Number(option.priceAdjustment),
                        totalPrice: priceAdjustment
                    };
                }).filter(Boolean);
            }

            const unitPrice = Number(menuItem.price) + modifiersPrice;

            orderItemsData.push({
                orderId: orderId,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: unitPrice,
                modifiers: modifierDetails,
                specialInstructions: item.specialInstructions,
            });
        }

        // 3. Add new items to order
        await prisma.orderItem.createMany({
            data: orderItemsData
        });

        // 4. Update order timestamp and reset to SUBMITTED if it was already accepted
        // (waiter needs to review new items)
        const updateData = {
            updatedAt: new Date()
        };

        // If order was already in progress, keep status but notify waiter
        // If you don't want waiter to re-accept new items, comment below:
        if (order.status !== 'SUBMITTED') {
            updateData.status = 'SUBMITTED';
        }

        await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });

        // 5. Increment orderCount for popularity tracking
        for (const item of newItems) {
            await prisma.menuItem.update({
                where: { id: item.menuItemId },
                data: {
                    orderCount: {
                        increment: item.quantity
                    }
                }
            });
        }

        // 6. Return updated order
        const updatedOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: { menuItem: true }
                },
                table: true,
                customer: true
            }
        });

        return updatedOrder;
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
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new Error('Order not found');

        // Validate that discount doesn't exceed order total? 
        // Logic can be added here.

        return await prisma.order.update({
            where: { id: orderId },
            data: { discount: Number(amount) }
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
        // Get all tables with active orders accepted by this waiter
        const orders = await prisma.order.findMany({
            where: {
                acceptedById: waiterId,
                status: { notIn: ['COMPLETED', 'CANCELLED'] }
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
        const where = {
            acceptedById: waiterId
        };

        if (status) where.status = status;

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
            doc.text(item.unitPrice.toLocaleString('vi-VN') + ' đ', 350, y);
            doc.text(item.total.toLocaleString('vi-VN') + ' đ', 450, y);

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
        doc.text(billData.bill.subtotal.toLocaleString('vi-VN') + ' đ', 450, doc.y - doc.currentLineHeight());

        if (billData.bill.discount > 0) {
            doc.text('Discount:', rightColX);
            doc.text('-' + billData.bill.discount.toLocaleString('vi-VN') + ' đ', 450, doc.y - doc.currentLineHeight());
        }

        doc.text('Tax (10%):', rightColX);
        doc.text(billData.bill.tax.toLocaleString('vi-VN') + ' đ', 450, doc.y - doc.currentLineHeight());

        doc.font('Helvetica-Bold').text('TOTAL:', rightColX, doc.y + 10);
        doc.text(billData.bill.total.toLocaleString('vi-VN') + ' đ', 450, doc.y - doc.currentLineHeight());

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).text('Thank you for dining with us!', { align: 'center' });

        doc.end();
    }

}

module.exports = new OrderService();
