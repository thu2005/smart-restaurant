import axios from "axios";

const API_URL = "/api"; // Adjust base URL as needed, or use environment variable

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

// Mock state for photos (in-memory for demo)
let mockPhotos = [
  {
    id: "p1",
    url: "https://via.placeholder.com/300",
    is_primary: true,
  },
  {
    id: "p2",
    url: "https://via.placeholder.com/300",
    is_primary: false,
  },
];

const menuService = {
  // --- Categories ---
  getCategories: async (params) => {
    // Mock data for demo
    const categories = [
      {
        id: "cat1",
        name: "Appetizers",
        display_order: 1,
        status: "active",
        items_count: 5,
        created_at: "2023-01-15T10:00:00Z",
      },
      {
        id: "cat2",
        name: "Main Course",
        display_order: 2,
        status: "active",
        items_count: 12,
        created_at: "2023-01-10T10:00:00Z",
      },
      {
        id: "cat3",
        name: "Drinks",
        display_order: 3,
        status: "active",
        items_count: 8,
        created_at: "2023-01-20T10:00:00Z",
      },
      {
        id: "cat4",
        name: "Desserts",
        display_order: 4,
        status: "active",
        items_count: 4,
        created_at: "2023-02-01T10:00:00Z",
      },
    ];
    return categories;
    /*
    try {
      const response = await api.get("/admin/menu/categories", { params });
      return response.data;
    } catch (error) {
      console.warn("API call failed, returning mock categories");
      return [ ... ];
    }
    */
  },

  createCategory: async (data) => {
    const response = await api.post("/admin/menu/categories", data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/admin/menu/categories/${id}`, data);
    return response.data;
  },

  updateCategoryStatus: async (id, status) => {
    const response = await api.patch(`/admin/menu/categories/${id}/status`, {
      status,
    });
    return response.data;
  },

  // --- Menu Items ---
  getItems: async (params) => {
    // Mock data for demo
    let items = [
      {
        id: "1",
        name: "Grilled Salmon",
        category_name: "Main Course",
        category_id: "cat2",
        price: 24.99,
        status: "available",
        is_chef_recommended: true,
        created_at: "2023-03-10T12:00:00Z",
        popularity: 95,
      },
      {
        id: "2",
        name: "Caesar Salad",
        category_name: "Appetizers",
        category_id: "cat1",
        price: 12.5,
        status: "available",
        is_chef_recommended: false,
        created_at: "2023-03-11T11:00:00Z",
        popularity: 80,
      },
      {
        id: "3",
        name: "Tiramisu",
        category_name: "Desserts",
        category_id: "cat4",
        price: 8.0,
        status: "sold_out",
        is_chef_recommended: true,
        created_at: "2023-03-12T14:00:00Z",
        popularity: 90,
      },
      {
        id: "4",
        name: "Iced Latte",
        category_name: "Drinks",
        category_id: "cat3",
        price: 5.5,
        status: "available",
        is_chef_recommended: false,
        created_at: "2023-03-13T09:00:00Z",
        popularity: 85,
      },
      {
        id: "5",
        name: "Steak Frites",
        category_name: "Main Course",
        category_id: "cat2",
        price: 29.99,
        status: "available",
        is_chef_recommended: true,
        created_at: "2023-03-14T18:00:00Z",
        popularity: 98,
      },
      {
        id: "6",
        name: "Cheesecake",
        category_name: "Desserts",
        category_id: "cat4",
        price: 7.5,
        status: "available",
        is_chef_recommended: false,
        created_at: "2023-03-15T13:00:00Z",
        popularity: 75,
      },
    ];

    // Filtering
    if (params) {
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter((item) => item.name.toLowerCase().includes(q));
      }
      if (params.categoryId && params.categoryId !== "all") {
        items = items.filter((item) => item.category_id === params.categoryId);
      }
      if (params.status && params.status !== "all") {
        items = items.filter((item) => item.status === params.status);
      }

      // Sorting
      if (params.sort) {
        const [field, order] = params.sort.split(":"); // e.g. "price:asc"
        items.sort((a, b) => {
          let valA = a[field];
          let valB = b[field];

          if (field === "created_at") {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          }

          if (valA < valB) return order === "desc" ? 1 : -1;
          if (valA > valB) return order === "desc" ? -1 : 1;
          return 0;
        });
      }

      // Pagination
      if (params.page && params.limit) {
        const start = (params.page - 1) * params.limit;
        const end = start + params.limit;
        // Return object with data and pagination info if needed, but current UI expects array
        // For now, just slice the array to simulate pagination
        items = items.slice(start, end);
      }
    }

    return items;
    /*
    try {
      // params: page, limit, search, categoryId, sort, status
      const response = await api.get("/admin/menu/items", { params });
      return response.data;
    } catch (error) {
      console.warn("API call failed, returning mock items");
      return [ ... ];
    }
    */
  },

  getItemById: async (id) => {
    // Force mock for demo
    console.log("Mock getItemById:", id);
    return {
      id: id,
      name: "Mock Item " + id,
      category_id: "cat2",
      price: 19.99,
      description: "This is a mock item description for testing purposes.",
      prep_time_minutes: 15,
      status: "available",
      is_chef_recommended: false,
      photos: [...mockPhotos],
      modifier_groups: [
        { id: "mg1", name: "Size", selection_type: "single" },
      ],
    };
    /*
    try {
      const response = await api.get(`/admin/menu/items/${id}`);
      return response.data;
    } catch (error) {
      console.warn("API call failed, returning mock item detail");
      return {
        id: id,
        name: "Mock Item " + id,
        category_id: "cat2",
        price: 19.99,
        description: "This is a mock item description for testing purposes.",
        prep_time_minutes: 15,
        status: "available",
        is_chef_recommended: false,
        photos: [...mockPhotos],
        modifier_groups: [
          { id: "mg1", name: "Size", selection_type: "single" },
        ],
      };
    }
    */
  },

  createItem: async (data) => {
    console.log("Mock createItem:", data);
    return {
      id: "mock-new-" + Date.now(),
      ...data,
      created_at: new Date().toISOString(),
    };
    /*
    const response = await api.post("/admin/menu/items", data);
    return response.data;
    */
  },

  updateItem: async (id, data) => {
    console.log("Mock updateItem:", id, data);
    return {
      id,
      ...data,
    };
    /*
    const response = await api.put(`/admin/menu/items/${id}`, data);
    return response.data;
    */
  },

  deleteItem: async (id) => {
    console.log("Mock deleteItem:", id);
    return { success: true };
    /*
    const response = await api.delete(`/admin/menu/items/${id}`);
    return response.data;
    */
  },

  // --- Photos ---
  uploadPhotos: async (itemId, formData) => {
    console.log("Mock uploadPhotos:", itemId);

    // Handle file preview generation
    const files = formData.getAll("photos");
    const newPhotos = [];

    files.forEach((file) => {
      if (file instanceof File) {
        const url = URL.createObjectURL(file);
        const newPhoto = {
          id:
            "mock-photo-" +
            Date.now() +
            Math.random().toString(36).substr(2, 9),
          url: url,
          is_primary: mockPhotos.length === 0, // First photo is primary
        };
        mockPhotos.push(newPhoto);
        newPhotos.push(newPhoto);
      }
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return newPhotos.length > 0 ? newPhotos[0] : null;
    /*
    const response = await api.post(
      `/admin/menu/items/${itemId}/photos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
    */
  },

  deletePhoto: async (itemId, photoId) => {
    console.log("Mock deletePhoto:", itemId, photoId);
    mockPhotos = mockPhotos.filter((p) => p.id !== photoId);
    return { success: true };
    /*
    const response = await api.delete(
      `/admin/menu/items/${itemId}/photos/${photoId}`
    );
    return response.data;
    */
  },

  setPrimaryPhoto: async (itemId, photoId) => {
    console.log("Mock setPrimaryPhoto:", itemId, photoId);
    mockPhotos = mockPhotos.map((p) => ({
      ...p,
      is_primary: p.id === photoId,
    }));
    return { success: true };
    /*
    const response = await api.patch(
      `/admin/menu/items/${itemId}/photos/${photoId}/primary`
    );
    return response.data;
    */
  },

  // --- Modifiers ---
  getModifierGroups: async () => {
    console.log("Mock getModifierGroups");
    return [
      {
        id: "mg1",
        name: "Size",
        selection_type: "single",
        is_required: true,
        options: [
          { id: "o1", name: "Small", price_adjustment: 0 },
          { id: "o2", name: "Medium", price_adjustment: 1.5 },
          { id: "o3", name: "Large", price_adjustment: 3.0 },
        ],
      },
      {
        id: "mg2",
        name: "Toppings",
        selection_type: "multiple",
        is_required: false,
        max_selections: 3,
        options: [
          { id: "o4", name: "Cheese", price_adjustment: 0.5 },
          { id: "o5", name: "Bacon", price_adjustment: 1.0 },
        ],
      },
    ];
    /*
    try {
      const response = await api.get("/admin/menu/modifier-groups");
      return response.data;
    } catch (error) {
      console.warn("API call failed, returning mock modifier groups");
      return [
        {
          id: "mg1",
          name: "Size",
          selection_type: "single",
          is_required: true,
          options: [
            { id: "o1", name: "Small", price_adjustment: 0 },
            { id: "o2", name: "Medium", price_adjustment: 1.5 },
            { id: "o3", name: "Large", price_adjustment: 3.0 },
          ],
        },
        {
          id: "mg2",
          name: "Toppings",
          selection_type: "multiple",
          is_required: false,
          max_selections: 3,
          options: [
            { id: "o4", name: "Cheese", price_adjustment: 0.5 },
            { id: "o5", name: "Bacon", price_adjustment: 1.0 },
          ],
        },
      ];
    }
    */
  },

  createModifierGroup: async (data) => {
    console.log("Mock createModifierGroup:", data);
    return { id: "mock-mg-" + Date.now(), ...data };
    /*
    const response = await api.post("/admin/menu/modifier-groups", data);
    return response.data;
    */
  },

  updateModifierGroup: async (id, data) => {
    console.log("Mock updateModifierGroup:", id, data);
    return { id, ...data };
    /*
    const response = await api.put(`/admin/menu/modifier-groups/${id}`, data);
    return response.data;
    */
  },

  createModifierOption: async (groupId, data) => {
    console.log("Mock createModifierOption:", groupId, data);
    return { id: "mock-opt-" + Date.now(), ...data };
    /*
    // Note: Endpoint might vary based on backend implementation, following suggested
    const response = await api.post(
      `/admin/menu/modifier-groups/${groupId}/options`,
      data
    );
    return response.data;
    */
  },

  updateModifierOption: async (id, data) => {
    console.log("Mock updateModifierOption:", id, data);
    return { id, ...data };
    /*
    const response = await api.put(`/admin/menu/modifier-options/${id}`, data);
    return response.data;
    */
  },

  attachModifierGroupToItem: async (itemId, groupIds) => {
    console.log("Mock attachModifierGroupToItem:", itemId, groupIds);
    return { success: true };
    /*
    // groupIds could be an array or single ID depending on backend
    const response = await api.post(
      `/admin/menu/items/${itemId}/modifier-groups`,
      { groupIds }
    );
    return response.data;
    */
  },

  // --- Guest Menu ---
  getGuestMenu: async (params) => {
    // Mock data for demo
    const mockItems = [
      {
        id: "1",
        name: "Grilled Salmon with Herbs",
        description:
          "Fresh Atlantic salmon grilled to perfection with aromatic herbs",
        price: 24.99,
        category_id: "cat2",
        primary_photo_url:
          "https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=1000&auto=format&fit=crop",
        prep_time_minutes: 25,
        status: "available",
        is_chef_recommended: true,
      },
      {
        id: "2",
        name: "Caesar Salad Supreme",
        description:
          "Crisp romaine lettuce tossed with classic Caesar dressing",
        price: 12.99,
        category_id: "cat1",
        primary_photo_url:
          "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=1000&auto=format&fit=crop",
        prep_time_minutes: 10,
        status: "available",
        is_chef_recommended: false,
      },
      {
        id: "3",
        name: "Margherita Pizza",
        description:
          "Traditional Italian pizza with fresh mozzarella and basil",
        price: 16.99,
        category_id: "cat2",
        primary_photo_url:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000&auto=format&fit=crop",
        prep_time_minutes: 20,
        status: "available",
        is_chef_recommended: true,
      },
      {
        id: "4",
        name: "Iced Caramel Latte",
        description: "Smooth espresso blended with cold milk and caramel syrup",
        price: 5.99,
        category_id: "cat3",
        primary_photo_url:
          "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=1000&auto=format&fit=crop",
        prep_time_minutes: 5,
        status: "available",
        is_chef_recommended: false,
      },
      {
        id: "5",
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with a molten chocolate center",
        price: 8.99,
        category_id: "cat4",
        primary_photo_url:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476d?q=80&w=1000&auto=format&fit=crop",
        prep_time_minutes: 15,
        status: "available",
        is_chef_recommended: true,
      },
    ];

    let filtered = mockItems;
    if (params?.categoryId && params.categoryId !== "all") {
      filtered = filtered.filter(
        (item) => item.category_id === params.categoryId
      );
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    return filtered;
    /*
    try {
      // params: q, categoryId, sort, chefRecommended, page, limit
      const response = await api.get("/menu", { params });
      return response.data;
    } catch (error) {
      console.warn("API call failed, returning mock guest menu");
      // ...
    }
    */
  },
};

export default menuService;
