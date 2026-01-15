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
          modifiers: Array.isArray(item.modifiers)
            ? item.modifiers.map((m) => {
                if (typeof m === 'object') {
                  return {
                    id: m.id,
                    quantity: m.quantity || 1
                  };
                }
                return { id: m, quantity: 1 };
              })
            : [],
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

  /**
   * Get active order for a table (not completed/cancelled)
   * Used to check if table has ongoing order before creating new one
   */
  getActiveOrderByTable: async (tableId, restaurantId) => {
    try {
      const params = {
        tableId: tableId || getTableId(),
        restaurantId: restaurantId || getRestaurantId(),
      };

      const response = await api.get("/orders/active", { params });
      return response.data; // { success: true, data: order | null }
    } catch (error) {
      console.error("Error getting active order:", error);
      throw error;
    }
  },

  /**
   * Add items to existing order (for "add more items" flow)
   * Maintains single order per table session
   */
  addItemsToOrder: async (orderId, items) => {
    try {
      const payload = {
        items: items.map((item) => ({
          menuItemId: item.menuItemId || item.id,
          quantity: item.quantity,
          modifiers: Array.isArray(item.modifiers)
            ? item.modifiers.map((m) => {
                if (typeof m === 'object') {
                  return {
                    id: m.id,
                    quantity: m.quantity || 1
                  };
                }
                return { id: m, quantity: 1 };
              })
            : [],
          specialInstructions: item.specialInstructions || item.notes || "",
        })),
      };

      const response = await api.post(`/orders/${orderId}/items`, payload);
      return response.data;
    } catch (error) {
      console.error("Error adding items to order:", error);
      throw error;
    }
  },

  /**
   * Smart order placement - checks for active order and either creates new or adds to existing
   * This is the main method to use from Cart
   */
  placeOrder: async (cartItems, orderData = {}) => {
    try {
      const tableId = orderData.tableId || getTableId();
      const restaurantId = orderData.restaurantId || getRestaurantId();

      // Check if table has active order
      const activeOrderResponse = await orderService.getActiveOrderByTable(
        tableId,
        restaurantId
      );
      const activeOrder = activeOrderResponse?.data;

      if (activeOrder) {
        // Add to existing order
        console.log("Adding items to existing order:", activeOrder.id);
        return await orderService.addItemsToOrder(activeOrder.id, cartItems);
      } else {
        // Create new order
        console.log("Creating new order");
        return await orderService.createOrder({
          ...orderData,
          items: cartItems,
          restaurantId,
          tableId,
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  },
};

export default orderService;
