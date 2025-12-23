const tableService = require('../services/table.service');
const { validationResult } = require('express-validator');

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

exports.deleteTable = async (req, res, next) => {
    try {
        await tableService.deleteTable(req.params.id);
        res.status(200).json({ success: true, message: 'Table deleted successfully' });
    } catch (error) {
        // Prisma error code for record not found is P2025
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }
        next(error);
    }
};
