const tableService = require('../services/table.service');
const { validationResult } = require('express-validator');
const { generateTableToken } = require('../utils/token');
const { generateQRCode } = require('../utils/qr.service');

exports.createTable = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const table = await tableService.createTable(req.body);
        res.status(201).json({ success: true, data: table });
    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.getTables = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const tables = await tableService.getTablesByRestaurant(restaurantId);
        res.status(200).json({ success: true, data: tables });
    } catch (error) {
        next(error);
    }
};

exports.getTableById = async (req, res, next) => {
    try {
        const table = await tableService.getTableById(req.params.id);
        if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
        res.status(200).json({ success: true, data: table });
    } catch (error) {
        next(error);
    }
};

exports.updateTable = async (req, res, next) => {
    try {
        const table = await tableService.updateTable(req.params.id, req.body);
        res.status(200).json({ success: true, data: table });
    } catch (error) {
        next(error);
    }
};

exports.deleteTable = async (req, res, next) => {
    try {
        const updatedTable = await tableService.toggleTableActive(req.params.id);
        res.status(200).json({ success: true, data: updatedTable, message: 'Table status updated successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }
        next(error);
    }
};

exports.generateQR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const table = await tableService.getTableById(id);

        if (!table) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }

        const token = generateTableToken(table.id, table.tableNumber, table.restaurantId);

        // Use service to update DB and get new URL
        const updatedTable = await tableService.updateQRToken(id, token);

        const baseURL = process.env.QR_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
        const qrContent = `${baseURL}/qr/${table.restaurantId}/${table.id}?tableNumber=${table.tableNumber}&token=${token}`;

        res.json({
            success: true,
            data: {
                qrCode: updatedTable.qrCodeUrl,
                qrContent: qrContent,
                token,
                tableId: table.id,
                tableNumber: table.tableNumber,
                restaurantId: table.restaurantId
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.regenerateAllQRs = async (req, res, next) => {
    try {
        let { restaurantId } = req.body;
        // Fallback to user's restaurantId if not in body
        if (!restaurantId && req.user && req.user.restaurantId) {
            restaurantId = req.user.restaurantId;
        }

        if (!restaurantId) return res.status(400).json({ success: false, message: 'Restaurant ID required' });

        const count = await tableService.regenerateAllQRs(restaurantId);

        res.json({
            success: true,
            message: `Successfully regenerated QR codes for ${count} tables.`,
            count
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTableStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        const table = await tableService.updateTable(id, { status });
        res.status(200).json({ success: true, data: table });
    } catch (error) {
        next(error);
    }
};

