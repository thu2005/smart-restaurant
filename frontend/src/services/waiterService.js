import axios from "axios";

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const waiterService = {
    /**
     * Get pending orders waiting for waiter acceptance
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Orders with status SUBMITTED
     */
    getPendingOrders: async (restaurantId) => {
        const response = await api.get("/orders", {
            params: {
                restaurantId,
                status: "SUBMITTED",
            },
        });
        return response.data;
    },

    /**
     * Get orders accepted/handled by this waiter
     * @param {string} status - Optional status filter (RECEIVED, PREPARING, READY, SERVED)
     * @returns {Promise} Waiter's orders
     */
    getWaiterOrders: async (status = null) => {
        const params = status ? { status } : {};
        const response = await api.get("/orders/waiter/orders", { params });
        return response.data;
    },

    /**
     * Get tables assigned to this waiter
     * @returns {Promise} Tables with active orders
     */
    getWaiterTables: async () => {
        const response = await api.get("/orders/waiter/tables");
        return response.data;
    },

    /**
     * Accept an order (waiter accepts customer order)
     * @param {string} orderId - Order ID
     * @returns {Promise} Updated order
     */
    acceptOrder: async (orderId) => {
        const response = await api.put(`/orders/${orderId}/status`, {
            status: "RECEIVED",
        });
        return response.data;
    },

    /**
     * Reject an order with reason
     * @param {string} orderId - Order ID
     * @param {string} reason - Rejection reason
     * @returns {Promise} Updated order
     */
    rejectOrder: async (orderId, reason) => {
        const response = await api.put(`/orders/${orderId}/status`, {
            status: "REJECTED",
            rejectionReason: reason,
        });
        return response.data;
    },

    /**
     * Send order to kitchen (change status to PREPARING)
     * @param {string} orderId - Order ID
     * @returns {Promise} Updated order
     */
    sendToKitchen: async (orderId) => {
        const response = await api.put(`/orders/${orderId}/status`, {
            status: "PREPARING",
        });
        return response.data;
    },

    /**
     * Mark order as served
     * @param {string} orderId - Order ID
     * @returns {Promise} Updated order
     */
    markAsServed: async (orderId) => {
        const response = await api.put(`/orders/${orderId}/status`, {
            status: "SERVED",
        });
        return response.data;
    },

    /**
     * Get single order details
     * @param {string} orderId - Order ID
     * @returns {Promise} Order details
     */
    getOrderById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },
};

export default waiterService;
