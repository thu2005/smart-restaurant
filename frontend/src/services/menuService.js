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

// Add interceptor for auth token if needed (assuming stored in localStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get restaurantId (assuming stored in localStorage)
const getRestaurantId = () => {
  return localStorage.getItem("restaurantId") || "default-restaurant-id";
};

// Helper functions to transform data between camelCase (backend) and snake_case (frontend)
const toSnakeCase = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    result[snakeKey] = value;
  }
  return result;
};

const toCamelCase = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    result[camelKey] = value;
  }
  return result;
};

const menuService = {
  // --- Categories ---
  getCategories: async (params) => {
    try {
      const response = await api.get("/menu/categories", { params });
      const categories = response.data.data || response.data;

      // Transform backend data to frontend format
      return categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        display_order: category.displayOrder || 0,
        status: category.isActive ? "active" : "inactive",
        items_count: category.menuItems ? category.menuItems.length : 0,
        created_at: category.createdAt,
      }));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  },

  createCategory: async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        displayOrder: data.display_order || 0,
        restaurantId: getRestaurantId(),
      };
      const response = await api.post("/menu/categories", payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        displayOrder: data.display_order || 0,
      };
      const response = await api.put(`/menu/categories/${id}`, payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    }
  },

  updateCategoryStatus: async (id, status) => {
    try {
      const payload = { isActive: status === "active" };
      const response = await api.patch(
        `/menu/categories/${id}/status`,
        payload
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to update category status:", error);
      throw error;
    }
  },

  // --- Menu Items ---
  getItems: async (params) => {
    try {
      const response = await api.get("/menu/items", { params });
      const items = response.data.data || response.data;

      // Transform backend data to frontend format
      return items.map((item) => ({
        id: item.id,
        name: item.name,
        category_name: item.category?.name || "",
        category_id: item.categoryId,
        price: parseFloat(item.price),
        status: item.isAvailable
          ? item.stockStatus === "out-of-stock"
            ? "sold_out"
            : "available"
          : "unavailable",
        is_chef_recommended: item.isChefRecommended || false,
        created_at: item.createdAt,
        description: item.description,
        prep_time_minutes: item.prepTime || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch items:", error);
      throw error;
    }
  },

  getItemById: async (id) => {
    try {
      const restaurantId = getRestaurantId();
      const response = await api.get(`/menu/${restaurantId}/items/${id}`);
      const item = response.data.data || response.data;

      // Transform backend data to frontend format
      return {
        id: item.id,
        name: item.name,
        category_id: item.categoryId,
        price: parseFloat(item.price),
        description: item.description,
        prep_time_minutes: item.prepTime || 0,
        status: item.isAvailable
          ? item.stockStatus === "out-of-stock"
            ? "sold_out"
            : "available"
          : "unavailable",
        is_chef_recommended: item.isChefRecommended || false,
        photos:
          item.photos?.map((photo) => ({
            id: photo.id,
            url: photo.url,
            is_primary: photo.isPrimary,
          })) || [],
        modifier_groups: item.modifier_groups || [],
      };
    } catch (error) {
      console.error("Failed to fetch item:", error);
      throw error;
    }
  },

  createItem: async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.category_id,
        prepTime: data.prep_time_minutes || 0,
        isAvailable: data.status === "available",
        stockStatus: data.status === "sold_out" ? "out-of-stock" : "available",
        isChefRecommended: data.is_chef_recommended || false,
        restaurantId: getRestaurantId(),
      };
      const response = await api.post("/menu/items", payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to create item:", error);
      throw error;
    }
  },

  updateItem: async (id, data) => {
    try {
      const restaurantId = getRestaurantId();
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        categoryId: data.category_id,
        prepTime: data.prep_time_minutes || 0,
        isAvailable: data.status === "available",
        stockStatus: data.status === "sold_out" ? "out-of-stock" : "available",
        isChefRecommended: data.is_chef_recommended || false,
      };
      const response = await api.put(
        `/menu/${restaurantId}/items/${id}`,
        payload
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to update item:", error);
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      const restaurantId = getRestaurantId();
      const response = await api.delete(`/menu/${restaurantId}/items/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete item:", error);
      throw error;
    }
  },

  // --- Photos ---
  uploadPhotos: async (itemId, formData) => {
    try {
      const response = await api.post(
        `/menu/items/${itemId}/photos`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to upload photos:", error);
      throw error;
    }
  },

  deletePhoto: async (itemId, photoId) => {
    try {
      const response = await api.delete(
        `/menu/items/${itemId}/photos/${photoId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to delete photo:", error);
      throw error;
    }
  },

  setPrimaryPhoto: async (itemId, photoId) => {
    try {
      const response = await api.patch(
        `/menu/items/${itemId}/photos/${photoId}/primary`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to set primary photo:", error);
      throw error;
    }
  },

  // --- Modifiers ---
  getModifierGroups: async () => {
    try {
      const restaurantId = getRestaurantId();
      const response = await api.get("/menu/modifier-groups", {
        params: { restaurantId },
      });
      const groups = response.data.data || response.data;

      // Transform backend data to frontend format
      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        selection_type: group.selectionType,
        is_required: group.isRequired,
        min_selections: group.minSelections,
        max_selections: group.maxSelections,
        options:
          group.options?.map((option) => ({
            id: option.id,
            name: option.name,
            price_adjustment: parseFloat(option.priceAdjustment || 0),
          })) || [],
      }));
    } catch (error) {
      console.error("Failed to fetch modifier groups:", error);
      throw error;
    }
  },

  createModifierGroup: async (data) => {
    try {
      const payload = {
        name: data.name,
        selectionType: data.selection_type,
        isRequired: data.is_required || false,
        minSelections: data.min_selections || 0,
        maxSelections: data.max_selections || 1,
        restaurantId: getRestaurantId(),
        options:
          data.options?.map((opt) => ({
            name: opt.name,
            priceAdjustment: opt.price_adjustment || 0,
          })) || [],
      };
      const response = await api.post("/menu/modifier-groups", payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to create modifier group:", error);
      throw error;
    }
  },

  updateModifierGroup: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        selectionType: data.selection_type,
        isRequired: data.is_required,
        minSelections: data.min_selections,
        maxSelections: data.max_selections,
      };
      const response = await api.put(`/menu/modifier-groups/${id}`, payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to update modifier group:", error);
      throw error;
    }
  },

  deleteModifierGroup: async (id) => {
    try {
      const response = await api.delete(`/menu/modifier-groups/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete modifier group:", error);
      throw error;
    }
  },

  createModifierOption: async (groupId, data) => {
    try {
      const payload = {
        name: data.name,
        priceAdjustment: data.price_adjustment || 0,
      };
      const response = await api.post(
        `/menu/modifier-groups/${groupId}/options`,
        payload
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to create modifier option:", error);
      throw error;
    }
  },

  updateModifierOption: async (id, data) => {
    try {
      const payload = {
        name: data.name,
        priceAdjustment: data.price_adjustment,
      };
      const response = await api.put(`/menu/modifier-options/${id}`, payload);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to update modifier option:", error);
      throw error;
    }
  },

  deleteModifierOption: async (id) => {
    try {
      const response = await api.delete(`/menu/modifier-options/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete modifier option:", error);
      throw error;
    }
  },

  attachModifierGroupToItem: async (itemId, groupIds) => {
    try {
      const response = await api.post(`/menu/items/${itemId}/modifier-groups`, {
        groupIds,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to attach modifier groups:", error);
      throw error;
    }
  },

  // --- Guest Menu ---
  getGuestMenu: async (params) => {
    try {
      const restaurantId = getRestaurantId();
      const response = await api.get(`/menu/${restaurantId}/items`, { params });
      const items = response.data.data || response.data;

      // Transform backend data to frontend format for guest menu
      return items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category_id: item.categoryId,
        primary_photo_url:
          item.image || item.photos?.find((p) => p.isPrimary)?.url,
        prep_time_minutes: item.prepTime || 0,
        status: item.isAvailable ? "available" : "unavailable",
        is_chef_recommended: item.isChefRecommended || false,
      }));
    } catch (error) {
      console.error("Failed to fetch guest menu:", error);
      throw error;
    }
  },
};

export default menuService;
