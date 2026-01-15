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
     * Get today's revenue statistics
     * Uses existing /api/reports/revenue endpoint
     */
    getTodayRevenue: async (restaurantId) => {
        try {
            const today = new Date();
            const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

            const response = await api.get("/reports/revenue", {
                params: { restaurantId, startDate, endDate },
            });

            return response.data.data || response.data;
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
    getTopSellingItems: async (restaurantId, limit = 5) => {
        try {
            const today = new Date();
            const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

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
                    startDate.setDate(startDate.getDate() - 7);
                    startDate.setHours(0, 0, 0, 0);
                    backendPeriod = "daily";
                    break;
                case "month":
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 30);
                    startDate.setHours(0, 0, 0, 0);
                    backendPeriod = "daily";
                    break;
                case "year":
                    startDate = new Date();
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    backendPeriod = "monthly";
                    break;
                default:
                    startDate = new Date(new Date().setHours(0, 0, 0, 0));
                    backendPeriod = "daily";
            }

            const response = await api.get("/reports/chart", {
                params: {
                    restaurantId,
                    period: backendPeriod,
                    startDate: startDate.toISOString(),
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

            const orders = (response.data.data || response.data).slice(0, limit);

            // Transform orders to activity feed format
            return orders.map((order) => {
                let type = "order_created";
                let title = `Order #${order.orderNumber} Created`;
                let description = `Table ${order.table?.tableNumber || "N/A"}`;

                if (order.status === "COMPLETED") {
                    type = "order_completed";
                    title = `Order #${order.orderNumber} Completed`;
                    description = `Table ${order.table?.tableNumber || "N/A"} - ${order.orderItems?.length || 0} items delivered`;
                } else if (order.status === "PAYMENT_PENDING" || order.payment) {
                    type = "payment_received";
                    title = "Payment Received";
                    description = `Table ${order.table?.tableNumber || "N/A"} - ${order.payment?.method || "Payment"} processed`;
                }

                return {
                    id: order.id,
                    type,
                    title,
                    description,
                    timestamp: new Date(order.createdAt),
                    amount: order.payment?.total || null,
                };
            });
        } catch (error) {
            console.error("Failed to fetch recent activity:", error);
            throw error;
        }
    },

    /**
     * Get low stock alerts
     * Uses /api/menu/items with stockStatus filter
     */
    getLowStockAlerts: async (restaurantId) => {
        try {
            // Try filtering by stockStatus
            const response = await api.get("/menu/items", {
                params: {
                    restaurantId,
                    stockStatus: "low-stock,out-of-stock",
                },
            });

            const items = response.data.data || response.data;

            // Transform to alert format
            return items.map((item) => ({
                id: item.id,
                severity: item.stockStatus === "out-of-stock" ? "critical" : "warning",
                title: `Low Stock Alert: ${item.name}`,
                message: `${item.name} is ${item.stockStatus === "out-of-stock" ? "out of stock" : "running low"}. Please restock soon.`,
                itemId: item.id,
                itemName: item.name,
                stockStatus: item.stockStatus,
            }));
        } catch (error) {
            console.error("Failed to fetch low stock alerts:", error);
            // Return empty array if endpoint doesn't support filtering
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
            const [
                revenue,
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
                dashboardApi.getActiveOrders(restaurantId),
                dashboardApi.getTableOccupancy(restaurantId),
                dashboardApi.getAveragePrepTime(restaurantId),
                dashboardApi.getTopSellingItems(restaurantId, 5),
                dashboardApi.getRevenueChartData(restaurantId),
                dashboardApi.getRecentActivity(restaurantId, 10),
                dashboardApi.getLowStockAlerts(restaurantId),
                dashboardApi.getOverdueOrders(restaurantId),
            ]);

            return {
                revenue,
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
