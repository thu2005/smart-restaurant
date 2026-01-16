import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Report API Service
 * Handles all report-related API calls and frontend calculations
 */

/**
 * Get revenue report for a time period
 */
export const getRevenueReport = async (restaurantId, startDate, endDate) => {
    const params = new URLSearchParams({
        restaurantId,
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
    });

    const response = await api.get(`/reports/revenue?${params}`);
    return response.data.data || response.data;
};

/**
 * Get top selling items by revenue
 */
export const getTopItems = async (restaurantId, limit = 10, startDate, endDate) => {
    const params = new URLSearchParams({
        restaurantId,
        limit: limit.toString(),
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
    });

    const response = await api.get(`/reports/top-items?${params}`);
    return response.data.data || response.data;
};

/**
 * Get revenue chart data (daily, weekly, monthly, hourly)
 */
export const getRevenueChartData = async (restaurantId, period = 'daily', startDate, endDate) => {
    const params = new URLSearchParams({
        restaurantId,
        period,
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
    });

    const response = await api.get(`/reports/chart?${params}`);
    return response.data.data || response.data;
};

/**
 * Get orders for prep time calculation
 */
export const getOrders = async (restaurantId, startDate, endDate) => {
    const params = new URLSearchParams({
        restaurantId,
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
    });

    const response = await api.get(`/orders?${params}`);
    return response.data.data || response.data;
};

/**
 * Calculate peak hours from hourly chart data
 * @param {Array} hourlyData - Array of {period, revenue, orderCount}
 * @param {number} limit - Number of top hours to return
 * @returns {Array} Top N hours sorted by order count
 */
export const getPeakHours = (hourlyData, limit = 6) => {
    if (!hourlyData || hourlyData.length === 0) return [];

    // Parse hour from ISO string and add order count
    const hoursWithData = hourlyData.map(item => {
        const date = new Date(item.period);
        return {
            hour: date.getHours(),
            hourLabel: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
            orderCount: item.orderCount || 0,
            revenue: item.revenue || 0,
        };
    });

    // Sort by order count descending and take top N
    return hoursWithData
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, limit);
};

/**
 * Calculate average prep time from orders
 * @param {Array} orders - Array of order objects with preparingAt and submittedAt
 * @returns {number} Average prep time in minutes
 */
export const calculateAveragePrepTime = (orders) => {
    if (!orders || orders.length === 0) return 0;

    // Filter orders that have both timestamps
    const ordersWithPrepTime = orders.filter(
        order => order.preparingAt && order.submittedAt
    );

    if (ordersWithPrepTime.length === 0) return 0;

    // Calculate total prep time in minutes
    const totalPrepTime = ordersWithPrepTime.reduce((sum, order) => {
        const prepTime = new Date(order.preparingAt) - new Date(order.submittedAt);
        return sum + (prepTime / 60000); // Convert milliseconds to minutes
    }, 0);

    return Math.round(totalPrepTime / ordersWithPrepTime.length);
};

/**
 * Calculate period comparison (percentage changes)
 * @param {Object} currentData - Current period data
 * @param {Object} previousData - Previous period data
 * @returns {Object} Data with percentage changes
 */
export const calculatePeriodComparison = (currentData, previousData) => {
    const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return {
        totalRevenue: {
            current: currentData.totalRevenue || 0,
            previous: previousData.totalRevenue || 0,
            change: calculateChange(currentData.totalRevenue, previousData.totalRevenue),
        },
        totalOrders: {
            current: currentData.totalOrders || 0,
            previous: previousData.totalOrders || 0,
            change: calculateChange(currentData.totalOrders, previousData.totalOrders),
        },
        averageOrderValue: {
            current: currentData.averageOrderValue || 0,
            previous: previousData.averageOrderValue || 0,
            change: calculateChange(currentData.averageOrderValue, previousData.averageOrderValue),
        },
    };
};

/**
 * Calculate previous period date range
 * @param {Date} startDate - Current period start date
 * @param {Date} endDate - Current period end date
 * @returns {Object} Previous period {startDate, endDate}
 */
export const calculatePreviousPeriod = (startDate, endDate) => {
    const duration = endDate - startDate;
    const previousEndDate = new Date(startDate.getTime() - 1); // 1ms before current start
    const previousStartDate = new Date(previousEndDate.getTime() - duration);

    return {
        startDate: previousStartDate,
        endDate: previousEndDate,
    };
};

/**
 * Export report data to CSV
 * @param {Object} data - Report data to export
 * @param {string} filename - Output filename
 */
export const exportToCSV = (data, filename = 'report.csv') => {
    // Convert data to CSV format
    let csv = '';

    // Add overview metrics
    if (data.metrics) {
        csv += 'Overview Metrics\n';
        csv += 'Metric,Value,Change\n';
        data.metrics.forEach(metric => {
            csv += `${metric.title},${metric.value},${metric.change}\n`;
        });
        csv += '\n';
    }

    // Add top items
    if (data.topItems && data.topItems.length > 0) {
        csv += 'Top Selling Items\n';
        csv += 'Rank,Item,Category,Orders,Revenue\n';
        data.topItems.forEach((item, index) => {
            csv += `${index + 1},${item.name},${item.category},${item.orderCount || item.totalQuantity},$${(item.revenue || item.totalRevenue) / 100}\n`;
        });
    }

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export report data to PDF
 * Uses backend PDFKit generation (same pattern as bill PDF)
 * @param {Object} data - Report data including restaurantId, startDate, endDate
 * @param {string} filename - Output filename
 */
export const exportToPDF = async (data, filename = 'report.pdf') => {
    try {
        const params = new URLSearchParams({
            restaurantId: data.restaurantId || localStorage.getItem('restaurantId'),
            ...(data.startDate && { startDate: data.startDate }),
            ...(data.endDate && { endDate: data.endDate }),
        });

        const response = await api.get(`/reports/export-pdf?${params}`, {
            responseType: 'blob'
        });

        // Create blob and download (same pattern as bill PDF)
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('PDF export failed:', error);
        alert('Failed to export PDF. Please try again.');
    }
};

export default {
    getRevenueReport,
    getTopItems,
    getRevenueChartData,
    getOrders,
    getPeakHours,
    calculateAveragePrepTime,
    calculatePeriodComparison,
    calculatePreviousPeriod,
    exportToCSV,
    exportToPDF,
};
