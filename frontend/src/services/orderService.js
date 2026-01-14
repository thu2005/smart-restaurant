import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// Create axios instance with default config
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

// Helper function to get restaurantId and tableId
const getRestaurantId = () => {
  return localStorage.getItem("restaurantId") || "default-restaurant-id";
};

const getTableId = () => {
  return localStorage.getItem("tableId") || sessionStorage.getItem("tableId");
};

const orderService = {
  // Create a new order (replaces cart functionality)
  createOrder: async (orderData) => {
    try {
      const payload = {
        restaurantId: orderData.restaurantId || getRestaurantId(),
        tableId: orderData.tableId || getTableId(),
        items: orderData.items.map((item) => ({
          menuItemId: item.menuItemId || item.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || item.notes || "",
        })),
        customerName: orderData.customerName || "",
        customerPhone: orderData.customerPhone || "",
        specialInstructions:
          orderData.specialInstructions || orderData.notes || "",
      };

      const response = await api.post("/orders", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Get orders for staff
  getOrders: async (params = {}) => {
    try {
      const queryParams = {
        restaurantId: params.restaurantId || getRestaurantId(),
        ...params,
      };

      const response = await api.get("/orders", { params: queryParams });
      return response.data;
    } catch (error) {
      console.error("Error getting orders:", error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Generate bill for order
  createBill: async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/bill`);
      return response.data;
    } catch (error) {
      console.error("Error creating bill:", error);
      throw error;
    }
  },

  // Get bill details
  getBill: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/bill`);
      return response.data;
    } catch (error) {
      console.error("Error getting bill:", error);
      throw error;
    }
  },

  // Apply discount to order
  applyDiscount: async (orderId, amount) => {
    try {
      const response = await api.post(`/orders/${orderId}/discount`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error("Error applying discount:", error);
      throw error;
    }
  },

  // Get bill as PDF
  downloadBillPDF: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/bill/pdf`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading bill PDF:", error);
      throw error;
    }
  },

  // Update individual order item status
  updateOrderItemStatus: async (orderId, itemId, itemStatus) => {
    try {
      const response = await api.patch(
        `/orders/${orderId}/items/${itemId}/status`,
        {
          itemStatus,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating order item status:", error);
      throw error;
    }
  },

  // Get waiter's tables
  getWaiterTables: async () => {
    try {
      const response = await api.get("/orders/waiter/my-tables");
      return response.data;
    } catch (error) {
      console.error("Error getting waiter tables:", error);
      throw error;
    }
  },

  // Get waiter's orders
  getWaiterOrders: async (params = {}) => {
    try {
      const response = await api.get("/orders/waiter/my-orders", { params });
      return response.data;
    } catch (error) {
      console.error("Error getting waiter orders:", error);
      throw error;
    }
  },
};

export default orderService;
