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
                    include: {
                        menuItem: {
                            include: { photos: true }
                        }
                    }
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
                    include: {
                        menuItem: {
                            include: { photos: true }
                        }
                    }
                },
                table: true,
                customer: true,
                bill: true  // Include bill relation
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

        // If order was already in progress or SERVED, keep status but notify waiter
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
                    include: {
                        menuItem: {
                            include: { photos: true }
                        }
                    }
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
                    include: {
                        menuItem: {
                            include: { photos: true }
                        }
                    }
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

    async getOrderById(orderId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        menuItem: {
                            include: { photos: true }
                        }
                    }
                },
                table: true,
                customer: true,
                bill: true,
            }
        });

        if (!order) {
            return null;
        }

        // Calculate total
        let total = 0;
        if (order.bill) {
            total = Number(order.bill.total);
        } else {
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
    }

    async updateStatus(orderId, status, userId, rejectionReason = null) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        });
        if (!order) throw new Error('Order not found');

        let newStatus = status;
        const now = new Date();
        const updateData = {};

        // Special handling for Multi-batch Rejection
        // If waiter rejects a new batch but the order already has SERVED items,
        // we should NOT set the whole order to REJECTED (which implies the whole meal is cancelled).
        // Instead, we should set it back to SERVED (meaning "Previous state was good, new request denied").
        if (status === 'REJECTED') {
            const hasServedItems = order.orderItems.some(item => item.itemStatus === 'served');
            if (hasServedItems) {
                // Revert to SERVED instead of REJECTED
                newStatus = 'SERVED';

                // Mark all non-served items as rejected to prevent them from affecting future batches
                await prisma.orderItem.updateMany({
                    where: {
                        orderId: orderId,
                        itemStatus: { notIn: ['served', 'completed', 'rejected'] }
                    },
                    data: { itemStatus: 'rejected' }
                });
            } else {
                // No served items yet, mark all items as rejected
                await prisma.orderItem.updateMany({
                    where: { orderId: orderId },
                    data: { itemStatus: 'rejected' }
                });
            }
        }

        updateData.status = newStatus;

        if (newStatus === 'RECEIVED') {
            updateData.acceptedAt = now;
            updateData.acceptedById = userId; // Waiter
        } else if (status === 'REJECTED') {
            if (newStatus === 'REJECTED') {
                updateData.rejectionReason = rejectionReason;
            }
        } else if (newStatus === 'PREPARING') {
            updateData.preparingAt = now;
        } else if (newStatus === 'READY') {
            updateData.readyAt = now;
        } else if (newStatus === 'SERVED') {
            updateData.servedAt = now;
            // Update all non-rejected items to 'served'
            await prisma.orderItem.updateMany({
                where: {
                    orderId: orderId,
                    itemStatus: { not: 'rejected' }
                },
                data: { itemStatus: 'served' }
            });
        } else if (newStatus === 'COMPLETED') {
            updateData.completedAt = now;
            // Update all non-rejected items to 'completed'
            await prisma.orderItem.updateMany({
                where: {
                    orderId: orderId,
                    itemStatus: { not: 'rejected' }
                },
                data: { itemStatus: 'completed' }
            });
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

        // Calculate totals based on CURRENT order items
        let subtotal = 0;
        for (const item of order.orderItems) {
            // Ensure we don't count cancelled/rejected items if logic requires (optional, assuming all in list are billable)
            if (item.itemStatus !== 'rejected' && item.itemStatus !== 'cancelled') {
                subtotal += (Number(item.unitPrice) * item.quantity);
            }
        }
        const discount = Number(order.discount) || 0;
        const taxRate = 0.1;
        const subtotalAfterDiscount = Math.max(0, subtotal - discount);
        const tax = subtotalAfterDiscount * taxRate;
        const total = subtotalAfterDiscount + tax;

        // Check if bill already exists
        const existingBill = await prisma.bill.findUnique({ where: { orderId } });

        if (existingBill) {
            // Update existing bill with new totals
            await prisma.bill.update({
                where: { id: existingBill.id },
                data: {
                    subtotal,
                    discount,
                    tax,
                    total,
                    updatedAt: new Date()
                    // createdBy: userId // Optional: update who updated it?
                }
            });
        } else {
            // Create new bill
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
        }

        return await this.getBillDetails(orderId);
    }

    async getBillDetails(orderId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        menuItem: {
                            include: { photos: true }
                        }
                    }
                },
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
            bill: billData,
            // Include order and table for socket notification
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                restaurantId: order.restaurantId,
                table: order.table
            }
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
            include: { bill: true, orderItems: { include: { menuItem: { include: { photos: true } } } } }
        });
    }

    async updateOrderItemStatus(orderId, itemId, itemStatus) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        });
        if (!order) throw new Error('Order not found');

        const orderItem = await prisma.orderItem.findUnique({ where: { id: itemId } });
        if (!orderItem || orderItem.orderId !== orderId) throw new Error('Order item not found');

        // Update the item status
        const updatedItem = await prisma.orderItem.update({
            where: { id: itemId },
            data: { itemStatus },
            include: { menuItem: true }
        });

        // After updating an item to 'ready', check if all items are now ready
        if (itemStatus === 'ready') {
            // Re-fetch all order items to get latest state
            const allItems = await prisma.orderItem.findMany({
                where: { orderId: orderId }
            });

            // Check if there are any items that are NOT ready and still need prep
            // We ignore items that are already 'served', 'completed', or 'rejected'
            const pendingItems = allItems.filter(item =>
                !['ready', 'served', 'completed', 'rejected'].includes(item.itemStatus)
            );

            if (pendingItems.length === 0) {
                // All items that needed prep are now done!
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'READY',
                        readyAt: new Date()
                    }
                });
            }
        }

        return updatedItem;
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
                orderItems: {
                    include: {
                        menuItem: {
                            include: { photos: true }
                        }
                    }
                },
                table: true,
                customer: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Helper to streamline PDF generation logic
    /**
     * Get bills for a restaurant, filter by paid/unpaid
     * @param {string} restaurantId
     * @param {string} status - 'PAID', 'UNPAID', or undefined for all
     */
    async getBillsByStatus(restaurantId, status) {
        // Find all bills for restaurant
        const bills = await prisma.bill.findMany({
            where: { restaurantId },
            include: {
                order: {
                    include: {
                        payment: true,
                        table: true,
                        customer: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Attach payment status
        return bills.filter(bill => {
            const payment = bill.order?.payment;
            if (status === 'PAID') {
                return payment && payment.status === 'COMPLETED';
            }
            if (status === 'UNPAID') {
                return !payment || payment.status !== 'COMPLETED';
            }
            return true; // all
        }).map(bill => ({
            ...bill,
            paymentStatus: bill.order?.payment?.status || 'UNPAID',
            paidAt: bill.order?.payment?.paidAt || null
        }));
    }

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

    /**
     * Get customer order history (completed orders only)
     * @param {string} customerId - Customer user ID
     * @param {Object} options - Pagination options
     * @returns {Array} List of completed orders with items
     */
    async getCustomerOrderHistory(customerId, options = {}) {
        const { limit = 20, offset = 0 } = options;

        const orders = await prisma.order.findMany({
            where: {
                customerId: customerId,
                status: 'COMPLETED'
            },
            include: {
                orderItems: {
                    include: {
                        menuItem: {
                            include: {
                                photos: {
                                    where: { isPrimary: true },
                                    take: 1
                                }
                            }
                        }
                    }
                },
                table: {
                    select: {
                        tableNumber: true,
                        location: true
                    }
                },
                restaurant: {
                    select: {
                        name: true,
                        address: true
                    }
                },
                payment: {
                    select: {
                        total: true,
                        method: true,
                        status: true,
                        paidAt: true
                    }
                },
                bill: {
                    select: {
                        billNumber: true,
                        subtotal: true,
                        tax: true,
                        discount: true,
                        total: true
                    }
                }
            },
            orderBy: {
                completedAt: 'desc'
            },
            take: limit,
            skip: offset
        });

        return orders;
    }
}

module.exports = new OrderService();
