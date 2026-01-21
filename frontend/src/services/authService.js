import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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

  resendVerification: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
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

  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      const user = response.data.data;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      return user;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      const user = response.data.data;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateAvatar: async (formData) => {
    try {
      const response = await api.put("/auth/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const user = response.data.data;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Update user profile
   * @param {object} userData - User data to update (fullName, phone, email)
   * @returns {Promise} Updated user data
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData);
      const updatedUser = response.data.data || response.data;

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Upload user avatar
   * @param {FormData} formData - Form data with avatar file
   * @returns {Promise} Updated user with avatar URL
   */
  uploadAvatar: async (formData) => {
    try {
      const response = await api.post("/auth/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUser = response.data.data || response.data;

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Success message
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put("/auth/password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Success message
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Failed to request password reset:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} Success message
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to reset password:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default authService;
