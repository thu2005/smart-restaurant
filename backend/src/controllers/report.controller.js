const reportService = require('../services/report.service');

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
