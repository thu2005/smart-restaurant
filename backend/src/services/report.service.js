const { prisma } = require('../config/database');

class ReportService {
    /**
     * Get revenue report for a restaurant
     * @param {String} restaurantId
     * @param {String} startDate - ISO format
     * @param {String} endDate - ISO format
     * @returns {Object} revenue statistics
     */
    async getRevenueReport(restaurantId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();

        // Get bills for the period (Sales Report)
        const bills = await prisma.bill.findMany({
            where: {
                restaurantId,
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                order: {
                    include: { orderItems: true }
                }
            }
        });

        // Calculate revenue
        let totalRevenue = 0;
        let totalOrders = bills.length;
        let totalItems = 0;

        const dailyRevenue = {};

        bills.forEach(bill => {
            const revenue = parseFloat(bill.total);
            totalRevenue += revenue;

            // Group by day
            const day = bill.createdAt.toISOString().split('T')[0];
            if (!dailyRevenue[day]) {
                dailyRevenue[day] = 0;
            }
            dailyRevenue[day] += revenue;

            // Count items from the associated order
            if (bill.order && bill.order.orderItems) {
                totalItems += bill.order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
            }
        });

        // Convert daily revenue to array for charts
        const chartData = Object.keys(dailyRevenue).sort().map(date => ({
            date,
            revenue: dailyRevenue[date]
        }));

        return {
            restaurantId,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            totalRevenue,
            totalOrders,
            totalItems,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            chartData
        };
    }

    /**
     * Get top revenue by menu item
     * @param {String} restaurantId
     * @param {Number} limit - number of top items to return
     * @param {String} startDate - ISO format
     * @param {String} endDate - ISO format
     * @returns {Array} top menu items by revenue
     */
    async getTopRevenueByMenuItem(restaurantId, limit = 10, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();

        // Get all order items from orders that HAVE A BILL
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    restaurantId,
                    bill: {
                        createdAt: {
                            gte: start,
                            lte: end
                        }
                    }
                }
            },
            include: {
                menuItem: {
                    include: {
                        category: true,
                        photos: {
                            where: { isPrimary: true },
                            take: 1
                        }
                    }
                }
            }
        });

        // Aggregate by menu item
        const itemRevenue = {};

        orderItems.forEach(item => {
            const menuItemId = item.menuItemId;
            const revenue = parseFloat(item.unitPrice) * item.quantity;
            const quantity = item.quantity;

            if (!itemRevenue[menuItemId]) {
                itemRevenue[menuItemId] = {
                    menuItemId,
                    name: item.menuItem.name,
                    category: item.menuItem.category?.name || 'Uncategorized',
                    image: item.menuItem.photos?.[0]?.url || item.menuItem.image || null,
                    totalRevenue: 0,
                    totalQuantity: 0,
                    unitPrice: parseFloat(item.menuItem.price),
                    orderCount: 0,
                    revenue: 0
                };
            }

            itemRevenue[menuItemId].totalRevenue += revenue;
            itemRevenue[menuItemId].totalQuantity += quantity;
            itemRevenue[menuItemId].orderCount = itemRevenue[menuItemId].totalQuantity;
            itemRevenue[menuItemId].revenue = itemRevenue[menuItemId].totalRevenue;
        });

        // Convert to array and sort by revenue
        const topItems = Object.values(itemRevenue)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, limit);

        return topItems;
    }

    /**
     * Get revenue chart data (daily, weekly, monthly)
     * @param {String} restaurantId
     * @param {String} period - 'daily', 'weekly', 'monthly'
     * @param {String} startDate - ISO format
     * @param {String} endDate - ISO format
     * @returns {Object} chart data
     */
    async getRevenueChartData(restaurantId, period = 'daily', startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
        const end = endDate ? new Date(endDate) : new Date();

        // Get bills directly
        const bills = await prisma.bill.findMany({
            where: {
                restaurantId,
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Aggregate based on period
        const revenueData = {};
        const orderCountData = {};

        bills.forEach(bill => {
            const revenue = parseFloat(bill.total);
            let key;

            const date = bill.createdAt;

            switch (period) {
                case 'hourly':
                    const h = new Date(date);
                    h.setMinutes(0, 0, 0);
                    key = h.toISOString();
                    break;
                case 'daily':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'weekly':
                    // Get week number
                    const weekStart = new Date(date);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                case 'monthly':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                default:
                    key = date.toISOString().split('T')[0];
            }

            if (!revenueData[key]) {
                revenueData[key] = 0;
                orderCountData[key] = 0;
            }

            revenueData[key] += revenue;
            orderCountData[key] += 1;
        });

        // Convert to array for chart
        const chartData = Object.keys(revenueData).sort().map(key => ({
            period: key,
            revenue: revenueData[key],
            orderCount: orderCountData[key],
            averageOrderValue: revenueData[key] / orderCountData[key]
        }));

        return {
            restaurantId,
            period,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            chartData
        };
    }

    /**
     * Get order statistics
     * @param {String} restaurantId
     * @param {String} startDate - ISO format
     * @param {String} endDate - ISO format
     * @returns {Object} order statistics
     */
    async getOrderStatistics(restaurantId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();

        // Get all orders in period
        const orders = await prisma.order.findMany({
            where: {
                restaurantId,
                createdAt: {
                    gte: start,
                    lte: end
                }
            }
        });

        // Count by status
        const statusCounts = {};
        orders.forEach(order => {
            if (!statusCounts[order.status]) {
                statusCounts[order.status] = 0;
            }
            statusCounts[order.status] += 1;
        });

        return {
            restaurantId,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            totalOrders: orders.length,
            statusBreakdown: statusCounts
        };
    }

    /**
     * Generate PDF report for a restaurant
     * Uses PDFKit to create a formatted PDF with metrics and top items
     * @param {String} restaurantId
     * @param {String} startDate - ISO format
     * @param {String} endDate - ISO format
     * @param {Object} res - Express response object
     */
    async generateReportPDF(restaurantId, startDate, endDate, res) {
        const PDFDocument = require('pdfkit');
        const { formatCurrency } = require('../utils/currency');

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Fetch restaurant currency
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { currency: true }
        });
        const currency = restaurant?.currency || 'VND';

        // Fetch report data
        const revenueData = await this.getRevenueReport(restaurantId, start.toISOString(), end.toISOString());
        const topItems = await this.getTopRevenueByMenuItem(restaurantId, 10, start.toISOString(), end.toISOString());

        // Create PDF document
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        doc.pipe(res);

        // Use Helvetica font for better Unicode support
        doc.font('Helvetica');

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('REPORTS & ANALYTICS', { align: 'center' });
        doc.moveDown();

        // Date range
        doc.fontSize(12).font('Helvetica')
            .text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Divider line
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown();

        // Overview Metrics Section
        doc.fontSize(16).font('Helvetica-Bold').text('Overview Metrics');
        doc.moveDown(0.5);

        const metrics = [
            { label: 'Total Revenue', value: formatCurrency(revenueData.totalRevenue, currency) },
            { label: 'Total Orders', value: revenueData.totalOrders.toString() },
            { label: 'Average Order Value', value: formatCurrency(revenueData.averageOrderValue, currency) },
            { label: 'Total Items Sold', value: revenueData.totalItems.toString() }
        ];

        // Draw metrics in a grid (2x2)
        const metricsStartY = doc.y;
        const colWidth = (doc.page.width - 100) / 2;

        metrics.forEach((metric, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = 50 + (col * colWidth);
            const y = metricsStartY + (row * 60);

            // Metric box
            doc.rect(x + 5, y, colWidth - 10, 50).lineWidth(1).strokeColor('#ddd').stroke();

            doc.fontSize(10).font('Helvetica').fillColor('#666')
                .text(metric.label, x + 15, y + 12, { width: colWidth - 30 });

            doc.fontSize(18).font('Helvetica-Bold').fillColor('#000')
                .text(metric.value, x + 15, y + 28, { width: colWidth - 30 });
        });

        doc.y = metricsStartY + 130;
        doc.moveDown();

        // Divider line
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown();

        // Top Selling Items Section
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#000').text('Top Selling Items');
        doc.moveDown(0.5);

        if (topItems && topItems.length > 0) {
            // Table header
            const tableTop = doc.y;
            const colWidths = {
                rank: 40,
                name: 180,
                category: 100,
                orders: 80,
                revenue: 100
            };

            // Header background
            doc.rect(50, tableTop, doc.page.width - 100, 25).fill('#f0f0f0');

            // Header text
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
            let xPos = 50;
            doc.text('Rank', xPos + 5, tableTop + 8, { width: colWidths.rank });
            xPos += colWidths.rank;
            doc.text('Item', xPos + 5, tableTop + 8, { width: colWidths.name });
            xPos += colWidths.name;
            doc.text('Category', xPos + 5, tableTop + 8, { width: colWidths.category });
            xPos += colWidths.category;
            doc.text('Orders', xPos + 5, tableTop + 8, { width: colWidths.orders });
            xPos += colWidths.orders;
            doc.text('Revenue', xPos + 5, tableTop + 8, { width: colWidths.revenue });

            doc.y = tableTop + 25;

            // Table rows
            topItems.slice(0, 10).forEach((item, index) => {
                const rowY = doc.y;

                // Alternate row background
                if (index % 2 === 0) {
                    doc.rect(50, rowY, doc.page.width - 100, 30).fill('#fafafa');
                }

                doc.fontSize(9).font('Helvetica').fillColor('#000');

                xPos = 50;
                // Rank
                doc.text((index + 1).toString(), xPos + 5, rowY + 10, { width: colWidths.rank });
                xPos += colWidths.rank;

                // Item name
                doc.text(item.name || 'N/A', xPos + 5, rowY + 10, {
                    width: colWidths.name - 10,
                    ellipsis: true
                });
                xPos += colWidths.name;

                // Category
                doc.text(item.category || 'N/A', xPos + 5, rowY + 10, {
                    width: colWidths.category - 10,
                    ellipsis: true
                });
                xPos += colWidths.category;

                // Orders
                doc.text((item.totalQuantity || 0).toString(), xPos + 5, rowY + 10, { width: colWidths.orders });
                xPos += colWidths.orders;

                // Revenue
                doc.text(formatCurrency(item.totalRevenue || 0, currency), xPos + 5, rowY + 10, { width: colWidths.revenue });

                doc.y = rowY + 30;

                // Check if we need a new page
                if (doc.y > doc.page.height - 100 && index < topItems.length - 1) {
                    doc.addPage();
                }
            });
        } else {
            doc.fontSize(10).font('Helvetica').fillColor('#666')
                .text('No sales data available for this period.', { align: 'center' });
        }

        // Footer
        doc.fontSize(8).font('Helvetica').fillColor('#999')
            .text(
                `Smart Restaurant - Reports & Analytics | Page ${doc.bufferedPageRange().count}`,
                50,
                doc.page.height - 50,
                { align: 'center', width: doc.page.width - 100 }
            );

        doc.end();
    }
}

module.exports = new ReportService();
