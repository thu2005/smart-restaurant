import axios from "axios";

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token (use 'token' to match authService.js)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const orderService = {
    createOrder: async (orderData) => {
        // orderData: { restaurantId, tableId, items: [{ menuItemId, quantity, modifiers... }] }
        const response = await api.post("/orders", orderData);
        return response.data;
    },

    // Get orders (for customers: my orders, for staff: restaurant orders)
    getOrders: async (params = {}) => {
        // params: { restaurantId, status, tableId }
        const response = await api.get("/orders", { params });
        return response.data;
    },

    // Get single order (not yet in backend controller, but good to have)
    getOrderById: async (id) => {
        // Assuming backend will have GET /orders/:id
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    // Helper to get my orders as customer
    getMyOrders: async () => {
        // No params needed, backend will infer from token and filter by customerId
        const response = await api.get("/orders");
        return response.data;
    }
};

export default orderService;