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

const restaurantService = {
    /**
     * Get all restaurants
     * @param {Object} params - Query parameters (page, limit)
     * @returns {Promise} List of restaurants
     */
    getAllRestaurants: async (params = {}) => {
        const response = await api.get("/restaurants", { params });
        return response.data;
    },

    /**
     * Get restaurant by ID
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Restaurant details
     */
    getRestaurantById: async (restaurantId) => {
        const response = await api.get(`/restaurants/${restaurantId}`);
        return response.data;
    },

    /**
     * Create a new restaurant
     * @param {Object} restaurantData - Restaurant data
     * @returns {Promise} Created restaurant
     */
    createRestaurant: async (restaurantData) => {
        const response = await api.post("/restaurants", restaurantData);
        return response.data;
    },

    /**
     * Update restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} Updated restaurant
     */
    updateRestaurant: async (restaurantId, updateData) => {
        const response = await api.put(`/restaurants/${restaurantId}`, updateData);
        return response.data;
    },

    /**
     * Delete restaurant
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Deletion result
     */
    deleteRestaurant: async (restaurantId) => {
        const response = await api.delete(`/restaurants/${restaurantId}`);
        return response.data;
    },

    /**
     * Assign restaurant to admin
     * @param {string} adminId - Admin user ID
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Updated user
     */
    assignRestaurantToAdmin: async (adminId, restaurantId) => {
        const response = await api.patch(`/users/${adminId}`, { restaurantId });
        return response.data;
    },
};

export default restaurantService;
