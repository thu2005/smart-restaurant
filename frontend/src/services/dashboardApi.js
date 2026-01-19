import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";


// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const dashboardApi = {
    /**
     * Get revenue statistics for a specific period
     */
    getRevenueStats: async (restaurantId, startDate, endDate) => {
        try {
            const response = await api.get("/reports/revenue", {
                params: { restaurantId, startDate, endDate },
            });
            return response.data.data || response.data;
        } catch (error) {
            console.error("Failed to fetch revenue stats:", error);
            throw error;
        }
    },

    /**
     * Get today's revenue statistics
     * Uses existing /api/reports/revenue endpoint
     */
    getTodayRevenue: async (restaurantId) => {
        try {
            const today = new Date();
            const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

            return await dashboardApi.getRevenueStats(restaurantId, startDate, endDate);
        } catch (error) {
            console.error("Failed to fetch today's revenue:", error);
            throw error;
        }
    },

    /**
     * Get active orders (SUBMITTED, RECEIVED, PREPARING, READY)
     * Uses existing /api/orders endpoint with status filter
     */
    getActiveOrders: async (restaurantId) => {
        try {
            const response = await api.get("/orders", {
                params: {
                    restaurantId,
                    status: "SUBMITTED,RECEIVED,PREPARING,READY",
                },
            });

            return response.data.data || response.data;
        } catch (error) {
            console.error("Failed to fetch active orders:", error);
            throw error;
        }
    },

    /**
     * Get table occupancy data
     * Uses existing /api/tables/restaurant/:restaurantId endpoint
     */
    getTableOccupancy: async (restaurantId) => {
        try {
            const response = await api.get(`/tables/restaurant/${restaurantId}`);
            const tables = response.data.data || response.data;

            // Calculate occupancy statistics
            const totalTables = tables.length;
            const occupiedTables = tables.filter(
                (t) => t.status === "OCCUPIED"
            ).length;
            const occupancyRate = totalTables > 0 ? occupiedTables / totalTables : 0;

            return {
                tables,
                totalTables,
                occupiedTables,
                occupancyRate,
            };
        } catch (error) {
            console.error("Failed to fetch table occupancy:", error);
            throw error;
        }
    },

    /**
     * Calculate average preparation time from completed orders
     * Uses existing /api/orders endpoint
     */
    getAveragePrepTime: async (restaurantId) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const response = await api.get("/orders", {
                params: {
                    restaurantId,
                    status: "READY,SERVED,COMPLETED",
                },
            });

            const orders = response.data.data || response.data;

            // Filter today's orders and calculate prep time
            const todayOrders = orders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= today;
            });

            if (todayOrders.length === 0) {
                return { averagePrepTime: 0, orderCount: 0 };
            }

            const totalPrepTime = todayOrders.reduce((sum, order) => {
                if (order.acceptedAt && order.readyAt) {
                    const prepTime =
                        new Date(order.readyAt) - new Date(order.acceptedAt);
                    return sum + prepTime / 60000; // Convert to minutes
                }
                return sum;
            }, 0);

            const averagePrepTime = totalPrepTime / todayOrders.length;

            return {
                averagePrepTime: Math.round(averagePrepTime),
                orderCount: todayOrders.length,
            };
        } catch (error) {
            console.error("Failed to calculate average prep time:", error);
            throw error;
        }
    },

    /**
     * Get top selling items
     * Uses existing /api/reports/top-items endpoint
     */
    /**
     * Helper to calculate date range based on period
     */
    calculateDateRange: (period) => {
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        let backendPeriod = "daily";

        switch (period) {
            case "today":
                startDate = new Date(new Date().setHours(0, 0, 0, 0));
                backendPeriod = "hourly";
                break;
            case "week":
                startDate = new Date();
                const day = startDate.getDay(); // 0 is Sunday
                const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
                startDate.setDate(diff);
                startDate.setHours(0, 0, 0, 0);
                backendPeriod = "daily";
                break;
            case "month":
                startDate = new Date();
                startDate.setDate(1); // First day of month
                startDate.setHours(0, 0, 0, 0);
                backendPeriod = "daily";
                break;
            case "year":
                startDate = new Date();
                startDate.setMonth(0, 1); // Jan 1st
                startDate.setHours(0, 0, 0, 0);
                backendPeriod = "monthly";
                break;
            default:
                startDate = new Date(new Date().setHours(0, 0, 0, 0));
                backendPeriod = "daily";
        }

        return { startDate: startDate.toISOString(), endDate, backendPeriod };
    },

    /**
     * Get top selling items
     * Uses existing /api/reports/top-items endpoint
     */
    getTopSellingItems: async (restaurantId, period = "today", limit = 5) => {
        try {
            const { startDate, endDate } = dashboardApi.calculateDateRange(period);

            const response = await api.get("/reports/top-items", {
                params: { restaurantId, limit, startDate, endDate },
            });

            return response.data.data || response.data;
        } catch (error) {
            console.error("Failed to fetch top selling items:", error);
            throw error;
        }
    },

    /**
     * Get revenue chart data
     * Uses existing /api/reports/chart endpoint
     */
    getRevenueChartData: async (restaurantId, period = "today") => {
        try {
            const { startDate, endDate, backendPeriod } = dashboardApi.calculateDateRange(period);

            const response = await api.get("/reports/chart", {
                params: {
                    restaurantId,
                    period: backendPeriod,
                    startDate,
                    endDate
                },
            });

            return response.data.data || response.data;
        } catch (error) {
            console.error("Failed to fetch revenue chart data:", error);
            throw error;
        }
    },

    /**
     * Get recent activity from orders
     * Uses existing /api/orders endpoint
     */
    getRecentActivity: async (restaurantId, limit = 10) => {
        try {
            const response = await api.get("/orders", {
                params: { restaurantId },
            });

            const orders = (response.data.data || response.data);

            // Transform orders to activity feed format with all status changes
            const activities = [];

            orders.forEach((order) => {
                // Use the most recent relevant timestamp for ordering
                let latestTimestamp = new Date(order.createdAt);
                let type = "order_created";
                let title = `Order #${order.orderNumber} Created`;
                let description = `Table ${order.table?.tableNumber || "N/A"}`;
                let amount = null;

                // Determine the latest activity based on order status
                if (order.status === "COMPLETED" && order.completedAt) {
                    type = "order_completed";
                    title = `Order #${order.orderNumber} Completed`;
                    description = `Table ${order.table?.tableNumber || "N/A"} - ${order.orderItems?.length || 0} items delivered`;
                    latestTimestamp = new Date(order.completedAt);
                } else if (order.status === "SERVED" && order.servedAt) {
                    type = "order_served";
                    title = `Order #${order.orderNumber} Served`;
                    description = `Table ${order.table?.tableNumber || "N/A"} - ${order.orderItems?.length || 0} items served`;
                    latestTimestamp = new Date(order.servedAt);
                } else if (order.status === "READY" && order.readyAt) {
                    type = "order_ready";
                    title = `Order #${order.orderNumber} Ready`;
                    description = `Table ${order.table?.tableNumber || "N/A"} - Ready to serve`;
                    latestTimestamp = new Date(order.readyAt);
                } else if (order.status === "PREPARING" && order.preparingAt) {
                    type = "order_preparing";
                    title = `Order #${order.orderNumber} Preparing`;
                    description = `Table ${order.table?.tableNumber || "N/A"} - In kitchen`;
                    latestTimestamp = new Date(order.preparingAt);
                } else if ((order.status === "RECEIVED" || order.status === "ACCEPTED") && order.acceptedAt) {
                    type = "order_accepted";
                    title = `Order #${order.orderNumber} Accepted`;
                    description = `Table ${order.table?.tableNumber || "N/A"} - Accepted by waiter`;
                    latestTimestamp = new Date(order.acceptedAt);
                } else if (order.status === "SUBMITTED" && order.submittedAt) {
                    type = "order_submitted";
                    title = `Order #${order.orderNumber} Submitted`;
                    description = `Table ${order.table?.tableNumber || "N/A"} - Waiting for acceptance`;
                    latestTimestamp = new Date(order.submittedAt);
                }

                // Add payment activity if payment exists
                if (order.payment) {
                    amount = order.payment.total;
                    // If payment is more recent, show payment activity instead
                    const paymentDate = new Date(order.payment.createdAt || order.payment.paidAt);
                    if (paymentDate > latestTimestamp) {
                        type = "payment_received";
                        title = "Payment Received";
                        description = `Table ${order.table?.tableNumber || "N/A"} - ${order.payment.method || "Payment"} processed`;
                        latestTimestamp = paymentDate;
                        amount = order.payment.total;
                    }
                }

                activities.push({
                    id: `${order.id}-${type}`,
                    orderId: order.id,
                    type,
                    title,
                    description,
                    timestamp: latestTimestamp,
                    amount,
                });
            });

            // Sort by timestamp (most recent first) and limit
            return activities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit);
        } catch (error) {
            console.error("Failed to fetch recent activity:", error);
            throw error;
        }
    },

    /**
     * Get low stock alerts
     * Fetches menu items from backend and filters by isAvailable and stockStatus
     */
    getLowStockAlerts: async (restaurantId) => {
        try {
            // Fetch all items from the correct endpoint
            const response = await api.get(`/menu/${restaurantId}/items`, {
                params: {
                    limit: 1000, // Get all items
                },
            });

            const items = response.data.data || response.data;

            // Filter relevant items based on isAvailable status and stockStatus
            const relevantItems = items.filter(item => {
                // Show alert if item is unavailable (isAvailable === false)
                if (item.isAvailable === false) return true;
                
                // Show alert if stockStatus is low_stock, sold_out, or out-of-stock
                const stockStatus = item.stockStatus?.toLowerCase().replace('_', '-');
                return ['low-stock', 'out-of-stock', 'sold-out'].includes(stockStatus);
            });

            // Transform to alert format
            return relevantItems.map((item) => {
                let severity = "warning";
                let title = `Stock Alert: ${item.name}`;
                let message = `${item.name} status is ${item.stockStatus}.`;
                let stockStatus = item.stockStatus;

                // Prioritize unavailable status
                if (item.isAvailable === false) {
                    severity = "critical";
                    title = `Item Unavailable: ${item.name}`;
                    message = `${item.name} is currently unavailable. Check availability status.`;
                    stockStatus = "unavailable";
                } else if (item.stockStatus === "sold_out" || item.stockStatus === "out-of-stock") {
                    severity = "critical";
                    title = `Out of Stock: ${item.name}`;
                    message = `${item.name} is currently out of stock. Please restock immediately.`;
                } else if (item.stockStatus === "low-stock" || item.stockStatus === "low_stock") {
                    severity = "warning";
                    title = `Low Stock: ${item.name}`;
                    message = `${item.name} is running low. Please restock soon.`;
                }

                return {
                    id: item.id,
                    severity,
                    title,
                    message,
                    itemId: item.id,
                    itemName: item.name,
                    stockStatus: stockStatus,
                };
            });
        } catch (error) {
            console.error("Failed to fetch low stock alerts:", error);
            return [];
        }
    },

    /**
     * Get overdue orders (orders in PREPARING status for > 30 minutes)
     */
    getOverdueOrders: async (restaurantId) => {
        try {
            const response = await api.get("/orders", {
                params: {
                    restaurantId,
                    status: "PREPARING",
                },
            });

            const orders = response.data.data || response.data;
            const now = new Date();
            const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

            // Filter orders that have been preparing for > 30 minutes
            const overdueOrders = orders.filter((order) => {
                if (order.preparingAt) {
                    return new Date(order.preparingAt) < thirtyMinutesAgo;
                }
                return false;
            });

            // Transform to alert format
            return overdueOrders.map((order) => ({
                id: `overdue-${order.id}`,
                severity: "critical",
                title: "Order Overdue",
                message: `Order #${order.orderNumber} for Table ${order.table?.tableNumber || "N/A"} has exceeded 30 minutes preparation time. Immediate attention required.`,
                orderId: order.id,
                orderNumber: order.orderNumber,
                tableNumber: order.table?.tableNumber,
                prepTime: Math.round(
                    (now - new Date(order.preparingAt)) / 60000
                ),
            }));
        } catch (error) {
            console.error("Failed to fetch overdue orders:", error);
            return [];
        }
    },

    /**
     * Get all dashboard data in one call
     * Useful for initial load and refresh
     */
    getDashboardData: async (restaurantId) => {
        try {
            // Calculate ranges for yesterday
            const today = new Date();
            const yesterdayStart = new Date(today);
            yesterdayStart.setDate(today.getDate() - 1);
            yesterdayStart.setHours(0, 0, 0, 0);

            const yesterdayEnd = new Date(today);
            yesterdayEnd.setDate(today.getDate() - 1);
            yesterdayEnd.setHours(23, 59, 59, 999);

            const [
                revenue,
                yesterdayRevenue,
                activeOrders,
                tableOccupancy,
                avgPrepTime,
                topItems,
                revenueChart,
                recentActivity,
                lowStockAlerts,
                overdueOrders,
            ] = await Promise.all([
                dashboardApi.getTodayRevenue(restaurantId),
                dashboardApi.getRevenueStats(restaurantId, yesterdayStart.toISOString(), yesterdayEnd.toISOString()),
                dashboardApi.getActiveOrders(restaurantId),
                dashboardApi.getTableOccupancy(restaurantId),
                dashboardApi.getAveragePrepTime(restaurantId),
                dashboardApi.getTopSellingItems(restaurantId, "today", 5),
                dashboardApi.getRevenueChartData(restaurantId),
                dashboardApi.getRecentActivity(restaurantId, 10),
                dashboardApi.getLowStockAlerts(restaurantId),
                dashboardApi.getOverdueOrders(restaurantId),
            ]);

            return {
                revenue,
                yesterdayRevenue,
                activeOrders,
                tableOccupancy,
                avgPrepTime,
                topItems,
                revenueChart,
                recentActivity,
                alerts: [...lowStockAlerts, ...overdueOrders],
            };
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            throw error;
        }
    },
};

export default dashboardApi;
