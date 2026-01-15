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
                        category: true
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
                    image: item.menuItem.image,
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
}

module.exports = new ReportService();
