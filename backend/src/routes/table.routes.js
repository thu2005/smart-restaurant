const express = require('express');
const { check } = require('express-validator');
const tableController = require('../controllers/table.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Restaurant Table management
 */

/**
 * @swagger
 * /api/tables/{restaurantId}:
 *   get:
 *     summary: Get all tables for a restaurant
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *     responses:
 *       200:
 *         description: List of tables
 */
router.get('/:restaurantId', tableController.getTables);

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
 * /api/tables/{id}:
 *   delete:
 *     summary: Delete a table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Table deleted
 */
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), tableController.deleteTable);

module.exports = router;
