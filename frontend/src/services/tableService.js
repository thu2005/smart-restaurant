import axios from "axios";

// Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token interceptor (use 'token' to match authService.js)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const tableAPI = {
    getAllTables: async (restaurantId) => {
        const response = await api.get(`/tables/restaurant/${restaurantId}`);
        return response.data;
    },

    getTableById: async (id) => {
        const response = await api.get(`/tables/details/${id}`);
        return response.data;
    },

    createTable: async (tableData) => {
        const response = await api.post("/tables", tableData);
        return response.data;
    },

    updateTable: async (id, tableData) => {
        const response = await api.put(`/tables/${id}`, tableData);
        return response.data;
    },

    updateTableStatus: async (id, status) => {
        // Update table status by updating the table data
        const response = await api.put(`/tables/${id}`, { status });
        return response.data;
    },

    deleteTable: async (id) => {
        const response = await api.delete(`/tables/${id}`);
        return response.data;
    },

    generateQR: async (id) => {
        const response = await api.post(`/tables/${id}/qr/generate`);
        return response.data;
    },

    regenerateAllQRs: async () => {
        // Send restaurantId explicitly to match backend expectations
        let restaurantId = null;
        try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            restaurantId = userData?.restaurantId || import.meta.env.VITE_DEFAULT_RESTAURANT_ID || null;
        } catch {}

        const response = await api.post("/tables/qr/regenerate-all", {
            restaurantId,
        });
        return response.data;
    },

    getDownloadPngUrl: (id) => {
        return `${API_BASE_URL}/tables/${id}/qr/download?format=png`;
    },

    getDownloadPdfUrl: (id) => {
        return `${API_BASE_URL}/tables/${id}/qr/download?format=pdf`;
    },

    downloadQR: async (id, format = "png") => {
        const response = await api.get(`/tables/${id}/qr/download`, {
            params: { format },
            responseType: "blob",
        });
        return response.data;
    },

    downloadAllQR: async (format = "zip", layout = "single", restaurantId = null) => {
        const params = { format, layout };
        if (restaurantId) {
            params.restaurantId = restaurantId;
        }
        const response = await api.get("/tables/qr/download-all", {
            params,
            responseType: "blob",
        });
        return response.data;
    },
};

export default api;