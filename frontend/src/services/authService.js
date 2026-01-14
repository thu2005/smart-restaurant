import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, data: user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        // Also set restaurantId if available in user object
        if (user.restaurantId) {
          localStorage.setItem("restaurantId", user.restaurantId);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    const userStr = localStorage.getItem("user");
    let isStaff = false;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Check if user is admin/staff (has role other than CUSTOMER)
        isStaff = user.role && user.role !== "CUSTOMER";
      } catch (e) {
        // Ignore parse error
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Only clear restaurant context if it was a staff session
    // Customers need to keep restaurantId/tableId to continue ordering as guest or re-login
    if (isStaff) {
      localStorage.removeItem("restaurantId");
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;
