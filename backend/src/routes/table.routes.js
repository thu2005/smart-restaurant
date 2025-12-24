const express = require('express');
const { check } = require('express-validator');
const tableController = require('../controllers/table.controller');
const downloadController = require('../controllers/download.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();


/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Create a new table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - tableNumber
 *             properties:
 *               restaurantId:
 *                 type: string
 *               tableNumber:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Table created
 */
router.post(
    '/',
    protect,
    authorize('ADMIN', 'SUPER_ADMIN'),
    [
        check('restaurantId', 'Restaurant ID is required').not().isEmpty(),
        check('tableNumber', 'Table Number is required').not().isEmpty(),
        check('capacity', 'Capacity must be an integer').optional().isInt(),
    ],
    tableController.createTable
);

/**
 * @swagger
 * /api/tables/details/{id}:
 *   get:
 *     summary: Get table details by ID
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Table details
 *       404:
 *         description: Table not found
 */
router.get('/details/:id', protect, tableController.getTableById);

/**
 * @swagger
 * /api/tables/{id}/qr/download:
 *   get:
 *     summary: Download QR Code for a table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, png]
 *         description: File format (pdf or png)
 *     responses:
 *       200:
 *         description: File data
 */
router.get('/:id/qr/download', protect, authorize('ADMIN', 'SUPER_ADMIN'), downloadController.downloadQR);

/**
 * @swagger
 * /api/tables/qr/download-all:
 *   get:
 *     summary: Download all QR Codes for a restaurant
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, zip]
 *         description: File format (pdf or zip of pngs)
 *       - in: query
 *         name: layout
 *         schema:
 *           type: string
 *           enum: [single, grid]
 *         description: Layout for PDF (single page per QR or grid)
 *     responses:
 *       200:
 *         description: File data
 */
router.get('/qr/download-all', protect, authorize('ADMIN', 'SUPER_ADMIN'), downloadController.downloadAllQR);

/**
 * @swagger
 * /api/tables/{id}/qr/generate:
 *   post:
 *     summary: Generate/Regenerate QR token for a table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: New QR data
 */
router.post('/:id/qr/generate', protect, authorize('ADMIN', 'SUPER_ADMIN'), tableController.generateQR);

/**
 * @swagger
 * /api/tables/qr/regenerate-all:
 *   post:
 *     summary: Regenerate all QR tokens for a restaurant
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success message with count
 */
router.post('/qr/regenerate-all', protect, authorize('ADMIN', 'SUPER_ADMIN'), tableController.regenerateAllQRs);

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Update a table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableNumber:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Table updated
 */
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), tableController.updateTable);


module.exports = router;
