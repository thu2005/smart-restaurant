import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
};

export default restaurantService;
