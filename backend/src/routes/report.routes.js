const express = require('express');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Analytics and reporting endpoints
 */

/**
 * @swagger
 * /api/reports/revenue:
 *   get:
 *     summary: Get revenue report for a restaurant
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The restaurant ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for the report (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for the report (ISO format)
 *     responses:
 *       200:
 *         description: Revenue report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurantId:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                     totalRevenue:
 *                       type: number
 *                     totalOrders:
 *                       type: number
 *                     totalItems:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     chartData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           revenue:
 *                             type: number
 *       400:
 *         description: Missing restaurantId
 *       403:
 *         description: Access denied
 */
router.get('/revenue', protect, reportController.getRevenueReport);

/**
 * @swagger
 * /api/reports/top-items:
 *   get:
 *     summary: Get top revenue-generating menu items
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The restaurant ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top items to return
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for the report (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for the report (ISO format)
 *     responses:
 *       200:
 *         description: List of top menu items by revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       menuItemId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       image:
 *                         type: string
 *                       totalRevenue:
 *                         type: number
 *                       totalQuantity:
 *                         type: number
 *                       unitPrice:
 *                         type: number
 *       400:
 *         description: Missing restaurantId
 *       403:
 *         description: Access denied
 */
router.get('/top-items', protect, reportController.getTopRevenueByMenuItem);

/**
 * @swagger
 * /api/reports/chart:
 *   get:
 *     summary: Get revenue chart data (daily, weekly, monthly)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The restaurant ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         description: Aggregation period for chart data
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for the chart (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for the chart (ISO format)
 *     responses:
 *       200:
 *         description: Chart data for interactive visualization
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurantId:
 *                       type: string
 *                     period:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                     chartData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                           orderCount:
 *                             type: number
 *                           averageOrderValue:
 *                             type: number
 *       400:
 *         description: Missing or invalid parameters
 *       403:
 *         description: Access denied
 */
router.get('/chart', protect, reportController.getRevenueChartData);

/**
 * @swagger
 * /api/reports/order-stats:
 *   get:
 *     summary: Get order statistics (status breakdown)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The restaurant ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for the stats (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for the stats (ISO format)
 *     responses:
 *       200:
 *         description: Order statistics with status breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurantId:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                     totalOrders:
 *                       type: number
 *                     statusBreakdown:
 *                       type: object
 *       400:
 *         description: Missing restaurantId
 *       403:
 *         description: Access denied
 */
router.get('/order-stats', protect, reportController.getOrderStatistics);

/**
 * @swagger
 * /api/reports/export-pdf:
 *   get:
 *     summary: Export report as PDF
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The restaurant ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for the report (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for the report (ISO format)
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing required parameters
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/export-pdf', protect, reportController.exportReportPDF);

module.exports = router;
