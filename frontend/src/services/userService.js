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

const userService = {
    /**
     * Create a new user (Admin, Waiter, Kitchen Staff)
     * @param {Object} userData - User data
     * @returns {Promise} Created user
     */
    createUser: async (userData) => {
        const response = await api.post("/users", userData);
        return response.data;
    },

    /**
     * Get all users (filtered by role and status)
     * @param {Object} filters - Optional filters (role, isActive)
     * @returns {Promise} List of users
     */
    getAllUsers: async (filters = {}) => {
        const response = await api.get("/users", { params: filters });
        return response.data;
    },

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise} User details
     */
    getUserById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    /**
     * Update user
     * @param {string} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} Updated user
     */
    updateUser: async (userId, updateData) => {
        const response = await api.put(`/users/${userId}`, updateData);
        return response.data;
    },

    /**
     * Toggle user active status
     * @param {string} userId - User ID
     * @param {boolean} isActive - Active status
     * @returns {Promise} Updated user
     */
    toggleUserStatus: async (userId, isActive) => {
        const response = await api.patch(`/users/${userId}/status`, { isActive });
        return response.data;
    },

    /**
     * Delete user
     * @param {string} userId - User ID
     * @returns {Promise} Deletion result
     */
    deleteUser: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    /**
     * Update own profile
     * @param {Object} profileData - Profile data
     * @returns {Promise} Updated user
     */
    updateOwnProfile: async (profileData) => {
        const response = await api.put("/users/profile", profileData);
        return response.data;
    },
};

export default userService;
