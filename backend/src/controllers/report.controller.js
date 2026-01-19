const reportService = require('../services/report.service');
const jwt = require('jsonwebtoken');

// ... existing code ...

// @desc    Get Metabase Signed Embedding URL
// @route   GET /api/reports/metabase-dashboard
// @access  Private (Admin)
exports.getMetabaseDashboardUrl = async (req, res, next) => {
    try {
        const METABASE_SITE_URL = process.env.METABASE_SITE_URL || "http://localhost:3000";
        const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;
        const METABASE_DASHBOARD_ID = process.env.METABASE_DASHBOARD_ID ? parseInt(process.env.METABASE_DASHBOARD_ID) : null;

        if (!METABASE_SECRET_KEY || !METABASE_DASHBOARD_ID) {
            return res.status(500).json({
                success: false,
                message: "Metabase configuration missing. Please set METABASE_SECRET_KEY and METABASE_DASHBOARD_ID in .env"
            });
        }

        const payload = {
            resource: { dashboard: METABASE_DASHBOARD_ID },
            params: {}, // Pass user-specific params here if needed (e.g. { "restaurant_id": req.user.restaurantId })
            exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
        };

        const token = jwt.sign(payload, METABASE_SECRET_KEY);
        const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;

        res.status(200).json({
            success: true,
            data: { iframeUrl }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get revenue report
// @route   GET /api/reports/revenue
// @access  Private (Admin/Staff)
exports.getRevenueReport = async (req, res, next) => {
    try {
        const { restaurantId, startDate, endDate } = req.query;

        // Validate restaurantId
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId is required'
            });
        }

        // Check if user has access to this restaurant
        if (req.user.role !== 'SUPER_ADMIN' && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this restaurant'
            });
        }

        const report = await reportService.getRevenueReport(restaurantId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get top revenue by menu item
// @route   GET /api/reports/top-items
// @access  Private (Admin/Staff)
exports.getTopRevenueByMenuItem = async (req, res, next) => {
    try {
        const { restaurantId, limit, startDate, endDate } = req.query;

        // Validate restaurantId
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId is required'
            });
        }

        // Check if user has access to this restaurant
        if (req.user.role !== 'SUPER_ADMIN' && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this restaurant'
            });
        }

        const topItems = await reportService.getTopRevenueByMenuItem(
            restaurantId,
            limit ? parseInt(limit) : 10,
            startDate,
            endDate
        );

        res.status(200).json({
            success: true,
            data: topItems
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get revenue chart data
// @route   GET /api/reports/chart
// @access  Private (Admin/Staff)
exports.getRevenueChartData = async (req, res, next) => {
    try {
        const { restaurantId, period, startDate, endDate } = req.query;

        // Validate restaurantId
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId is required'
            });
        }

        // Check if user has access to this restaurant
        if (req.user.role !== 'SUPER_ADMIN' && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this restaurant'
            });
        }

        // Validate period
        const validPeriods = ['hourly', 'daily', 'weekly', 'monthly'];
        if (period && !validPeriods.includes(period)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid period. Must be daily, weekly, or monthly'
            });
        }

        const chartData = await reportService.getRevenueChartData(
            restaurantId,
            period || 'daily',
            startDate,
            endDate
        );

        res.status(200).json({
            success: true,
            data: chartData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order statistics
// @route   GET /api/reports/order-stats
// @access  Private (Admin/Staff)
exports.getOrderStatistics = async (req, res, next) => {
    try {
        const { restaurantId, startDate, endDate } = req.query;

        // Validate restaurantId
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId is required'
            });
        }

        // Check if user has access to this restaurant
        if (req.user.role !== 'SUPER_ADMIN' && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this restaurant'
            });
        }

        const stats = await reportService.getOrderStatistics(restaurantId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export report as PDF
// @route   GET /api/reports/export-pdf
// @access  Private (Admin/Staff)
exports.exportReportPDF = async (req, res, next) => {
    try {
        const { restaurantId, startDate, endDate } = req.query;

        // Validate restaurantId
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId is required'
            });
        }

        // Check if user has access to this restaurant
        if (req.user.role !== 'SUPER_ADMIN' && req.user.restaurantId !== restaurantId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this restaurant'
            });
        }

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report-${restaurantId}-${new Date().toISOString().split('T')[0]}.pdf"`);

        // Generate and stream PDF
        await reportService.generateReportPDF(restaurantId, startDate, endDate, res);

    } catch (error) {
        console.error('Error generating PDF report:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error generating PDF report'
            });
        }
    }
};
