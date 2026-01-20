import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create separate instance for public endpoints (no auth required)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor for auth token only to authenticated API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get restaurantId (from localStorage, user data, or fallback)
const getRestaurantId = () => {
  // First try to get from QR scan or direct storage
  let restaurantId = localStorage.getItem("restaurantId");
  
  // If not found, try to get from logged-in user
  if (!restaurantId) {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      restaurantId = userData.restaurantId;
    } catch (e) {
      console.error("Error getting restaurantId from user data:", e);
    }
  }
  
  // Fallback to environment variable or default
  return restaurantId || import.meta.env.VITE_DEFAULT_RESTAURANT_ID || null;
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
  getCategories: async (params = {}, restaurantId = null) => {
    try {
      // For public access (customer menu), use restaurant-specific endpoint
      const restaurantId = params.restaurantId || getRestaurantId();
      const { restaurantId: _, ...queryParams } = params;

      const response = await publicApi.get(`/menu/${restaurantId}/categories`, {
        params: queryParams,
      });
      const result = response.data;

      // If pagination info is present, return full result
      if (result.pagination) {
        return {
          data: (result.data || []).map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            display_order: category.displayOrder || 0,
            status: category.isActive ? "active" : "inactive",
            items_count: category.menuItems ? category.menuItems.length : 0,
            created_at: category.createdAt,
          })),
          pagination: result.pagination,
        };
      }

      // Old format without pagination
      const categories = result.data || result;
      return (categories || []).map((category) => ({
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
  getItems: async (params = {}) => {
    try {
      // Use restaurant-specific endpoint
      const restaurantId = params.restaurantId || getRestaurantId();
      const { restaurantId: _, ...queryParams } = params; // Remove restaurantId from query params

      const response = await publicApi.get(`/menu/${restaurantId}/items`, {
        params: queryParams,
      });

      const result = response.data;

      // Handle both paginated and non-paginated responses
      if (result.pagination) {
        return {
          data: (result.data || []).map((item) => ({
            id: item.id,
            name: item.name,
            category_name: item.category?.name || "",
            category_id: item.categoryId,
            price: parseFloat(item.price),
            status:
              item.stockStatus === "out-of-stock"
                ? "sold_out"
                : item.isAvailable
                ? "available"
                : "unavailable",
            is_chef_recommended: item.isChefRecommended || false,
            is_popular: item.isPopular || false,
            dietary: item.dietary || [],
            created_at: item.createdAt,
            description: item.description,
            prep_time_minutes: item.prepTime || 0,
            photos: item.photos || [],
            image: item.image,
          })),
          pagination: result.pagination,
        };
      }

      // Old format without pagination
      const items = result.data || result;
      return (items || []).map((item) => ({
        id: item.id,
        name: item.name,
        category_name: item.category?.name || "",
        category_id: item.categoryId,
        price: parseFloat(item.price),
        status:
          item.stockStatus === "out-of-stock"
            ? "sold_out"
            : item.isAvailable
            ? "available"
            : "unavailable",
        is_chef_recommended: item.isChefRecommended || false,
        is_popular: item.isPopular || false,
        dietary: item.dietary || [],
        created_at: item.createdAt,
        description: item.description,
        prep_time_minutes: item.prepTime || 0,
        photos: item.photos || [],
        image: item.image,
      }));
    } catch (error) {
      console.error("Failed to fetch items:", error);
      throw error;
    }
  },

  getItemById: async (id, restaurantId) => {
    try {
      const restId = restaurantId || getRestaurantId();
      const response = await publicApi.get(`/menu/${restId}/items/${id}`);
      const item = response.data.data || response.data;

      // Transform backend data to frontend format
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        basePrice: parseFloat(item.price), // alias for compatibility
        category_id: item.categoryId,
        category: item.category,
        prep_time_minutes: item.prepTime || 0,
        prepTime: item.prepTime || 0, // alias for compatibility
        calories: item.calories || null,
        status:
          item.stockStatus === "out-of-stock"
            ? "sold_out"
            : item.isAvailable
            ? "available"
            : "unavailable",
        availability:
          item.stockStatus === "out-of-stock"
            ? "sold_out"
            : item.isAvailable
            ? "available"
            : "unavailable",
        is_chef_recommended: item.isChefRecommended || false,
        isChefRecommended: item.isChefRecommended || false, // alias
        is_popular: item.isPopular || false,
        isPopular: item.isPopular || false, // alias
        dietary: item.dietary || [],
        allergens: item.allergens || [],
        created_at: item.createdAt,
        images: (item.photos || []).map((photo) => ({
          url: photo.url?.startsWith("http")
            ? photo.url
            : `${
                import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
                "http://localhost:5000"
              }${photo.url}`,
          alt: item.name,
          is_primary: photo.isPrimary,
        })),
        photos: item.photos || [], // raw photos array
        modifier_groups: (item.modifier_groups || []).map((group) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          selectionType: group.selectionType || 'single',
          modifierType: group.modifierType || 'choice', // 'choice' or 'addon'
          isRequired: group.isRequired,
          maxSelections: group.maxSelections,
          minSelections: group.minSelections,
          options: (group.options || []).map((option) => ({
            id: option.id,
            name: option.name,
            description: option.description,
            priceAdjustment: parseFloat(option.priceAdjustment || 0),
            isAvailable: option.isAvailable !== false,
          })),
        })),
        // Mock data for features not yet in backend
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        isSpicy: false,
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
        isAvailable: data.status !== "unavailable",
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
        isAvailable: data.status !== "unavailable",
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
  getModifierGroups: async (params = {}) => {
    try {
      const restaurantId = getRestaurantId();
      const response = await api.get("/menu/modifier-groups", {
        params: { restaurantId, ...params },
      });
      const result = response.data;

      // If pagination info is present, return full result
      if (result.pagination) {
        return {
          data: (result.data || []).map((group) => ({
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
          })),
          pagination: result.pagination,
        };
      }

      // Old format without pagination
      const groups = result.data || result;

      // Transform backend data to frontend format
      return (groups || []).map((group) => ({
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
  getGuestMenu: async (params, restaurantId = null) => {
    try {
      const resolvedRestaurantId = restaurantId || getRestaurantId();
      const response = await api.get(`/menu/${resolvedRestaurantId}/items`, {
        params,
      });
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

  // --- Chef Recommendations ---
  getChefRecommendations: async (params = {}) => {
    try {
      const restaurantId = params.restaurantId || getRestaurantId();
      const { restaurantId: _, ...queryParams } = params;

      const response = await publicApi.get(`/menu/${restaurantId}/items`, {
        params: { ...queryParams, isChefRecommended: true },
      });
      const result = response.data;

      const items = result.data || result;
      return (items || [])
        .filter((item) => item.isChefRecommended)
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: parseFloat(item.price) || 0,
          image: item.image || item.photos?.[0]?.url || "",
          category_id: item.categoryId,
          category_name: item.category?.name || "",
          prep_time: item.prepTime || 15,
          is_popular: item.isPopular || false,
          is_chef_recommended: true,
          dietary_info: item.dietary || [],
          is_available: item.isAvailable !== false,
          stock_status: item.stockStatus || "available",
        }));
    } catch (error) {
      console.error("Error getting chef recommendations:", error);
      throw error;
    }
  },

  // --- Reviews ---
  // --- Reviews ---
  getReviews: async (menuItemId) => {
    try {
      const response = await publicApi.get(`/reviews/${menuItemId}`);
      const rawReviews = response.data.reviews || response.data.data || [];
      
      // Transform backend data to frontend format
      return rawReviews.map(review => ({
        id: review.id,
        userName: review.user?.fullName || "Anonymous",
        userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.fullName || "User"}`, // Generating avatar based on name
        userAvatarAlt: "User Avatar",
        rating: review.rating,
        date: new Date(review.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        comment: review.comment || ""
      }));

    } catch (error) {
      console.error("Error getting reviews:", error);
      throw error;
    }
  },

  createReview: async (reviewData) => {
    try {
      const response = await api.post("/reviews", reviewData);
      return response.data;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },
};

export default menuService;
export { getRestaurantId };