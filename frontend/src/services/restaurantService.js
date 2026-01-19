import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token interceptor
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
        try {
            const response = await api.get("/restaurants", { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch restaurants:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get restaurant by ID
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Restaurant data
     */
    getRestaurant: async (restaurantId) => {
        try {
            const response = await api.get(`/restaurants/${restaurantId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch restaurant:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get restaurant by ID (alias for compatibility)
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Restaurant details
     */
    getRestaurantById: async (restaurantId) => {
        return restaurantService.getRestaurant(restaurantId);
    },

    /**
     * Create a new restaurant
     * @param {Object} restaurantData - Restaurant data
     * @returns {Promise} Created restaurant
     */
    createRestaurant: async (restaurantData) => {
        try {
            const response = await api.post("/restaurants", restaurantData);
            return response.data;
        } catch (error) {
            console.error("Failed to create restaurant:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update restaurant profile
     * @param {string} restaurantId - Restaurant ID
     * @param {object} data - Restaurant data to update
     * @returns {Promise} Updated restaurant
     */
    updateRestaurant: async (restaurantId, data) => {
        try {
            const response = await api.put(`/restaurants/${restaurantId}`, data);
            return response.data;
        } catch (error) {
            console.error("Failed to update restaurant:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Delete restaurant
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Deletion result
     */
    deleteRestaurant: async (restaurantId) => {
        try {
            const response = await api.delete(`/restaurants/${restaurantId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete restaurant:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Upload restaurant logo
     * @param {string} restaurantId - Restaurant ID
     * @param {FormData} formData - Form data with logo file
     * @returns {Promise} Updated restaurant with logo URL
     */
    uploadLogo: async (restaurantId, formData) => {
        try {
            const response = await api.post(
                `/restaurants/${restaurantId}/logo`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to upload logo:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Delete restaurant logo
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Updated restaurant without logo
     */
    deleteLogo: async (restaurantId) => {
        try {
            const response = await api.delete(`/restaurants/${restaurantId}/logo`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete logo:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Assign restaurant to admin
     * @param {string} adminId - Admin user ID
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Updated user
     */
    assignRestaurantToAdmin: async (adminId, restaurantId) => {
        try {
            const response = await api.patch(`/users/${adminId}`, { restaurantId });
            return response.data;
        } catch (error) {
            console.error("Failed to assign restaurant to admin:", error);
            throw error.response?.data || error.message;
        }
    },
};

export default restaurantService;
