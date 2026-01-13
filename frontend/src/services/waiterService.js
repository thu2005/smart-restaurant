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
        const response = await api.get("/orders/waiter/my-orders", { params });
        return response.data;
    },

    /**
     * Get tables assigned to this waiter
     * @returns {Promise} Tables with active orders
     */
    getWaiterTables: async () => {
        const response = await api.get("/orders/waiter/my-tables");
        return response.data;
    },

    /**
     * Accept an order (waiter accepts customer order)
     * @param {string} orderId - Order ID
     * @returns {Promise} Updated order
     */
    acceptOrder: async (orderId) => {
        const response = await api.patch(`/orders/${orderId}/status`, {
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
        const response = await api.patch(`/orders/${orderId}/status`, {
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
        const response = await api.patch(`/orders/${orderId}/status`, {
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
        const response = await api.patch(`/orders/${orderId}/status`, {
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

    // ============================================
    // Bill Management
    // ============================================

    /**
     * Create bill for an order
     * @param {string} orderId - Order ID
     * @returns {Promise} Created bill with subtotal, tax, discount, total
     */
    createBill: async (orderId) => {
        const response = await api.post(`/orders/${orderId}/bill`);
        return response.data;
    },

    /**
     * Get bill details for an order
     * @param {string} orderId - Order ID
     * @returns {Promise} Bill details
     */
    getBill: async (orderId) => {
        const response = await api.get(`/orders/${orderId}/bill`);
        return response.data;
    },

    /**
     * Apply discount to an order
     * @param {string} orderId - Order ID
     * @param {number} amount - Discount amount (already calculated)
     * @returns {Promise} Updated order with discount
     */
    applyDiscount: async (orderId, amount) => {
        const response = await api.post(`/orders/${orderId}/discount`, {
            amount: parseFloat(amount)
        });
        return response.data;
    },

    /**
     * Print bill - Opens PDF in new window and triggers print dialog
     * Supports thermal printers and regular printers
     * @param {string} orderId - Order ID
     * @returns {Promise} Triggers browser print dialog
     */
    printBill: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/bill/pdf`, {
                responseType: 'blob'
            });

            // Create blob URL
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Open in new window and trigger print dialog
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            } else {
                // Fallback: download if popup blocked
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `bill-${orderId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            // Clean up after a delay
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);

            return response.data;
        } catch (error) {
            console.error('Error printing bill:', error);
            throw error;
        }
    },

    /**
     * Process payment for an order
     * @param {string} orderId - Order ID
     * @param {object} paymentData - { method: 'CASH'|'CARD_AT_COUNTER'|'ZALOPAY', amount, tax, total }
     * @returns {Promise} Payment record
     */
    processPayment: async (orderId, paymentData) => {
        const response = await api.post(`/payments`, {
            orderId,
            method: paymentData.method,
            amount: parseFloat(paymentData.amount),
            tax: parseFloat(paymentData.tax),
            total: parseFloat(paymentData.total)
        });
        return response.data;
    },
};

export default waiterService;
