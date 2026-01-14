import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with auth token
const api = axios.create({
    baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const kitchenService = {
    /**
     * Get all kitchen orders (RECEIVED, PREPARING, READY)
     */
    getKitchenOrders: async (restaurantId, status = 'all') => {
        const params = { restaurantId };
        if (status && status !== 'all') {
            params.status = status;
        }
        return api.get('/kitchen/orders', { params });
    },

    /**
     * Update order status (PREPARING or READY)
     */
    updateOrderStatus: async (orderId, status) => {
        return api.put(`/kitchen/orders/${orderId}/status`, { status });
    },

    /**
     * Get kitchen statistics
     */
    getKitchenStats: async (restaurantId) => {
        return api.get('/kitchen/stats', { params: { restaurantId } });
    },
};

export default kitchenService;
