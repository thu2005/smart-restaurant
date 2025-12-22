const menuService = require('../services/menu.service');
const { validationResult } = require('express-validator');

exports.getCategories = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const categories = await menuService.getCategories(restaurantId);
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        // Ideally validate restaurantId from token vs body
        const category = await menuService.createCategory(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

exports.getMenuItems = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const { categoryId } = req.query;
        const items = await menuService.getMenuItems(restaurantId, categoryId);
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

exports.getMenuItemById = async (req, res, next) => {
    try {
        const item = await menuService.getMenuItemById(req.params.id);
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        if (error.message === 'Menu item not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
}

exports.createMenuItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const item = await menuService.createMenuItem(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

exports.updateMenuItem = async (req, res, next) => {
    try {
        const item = await menuService.updateMenuItem(req.params.id, req.body);
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        if (error.message === 'Menu item not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.deleteMenuItem = async (req, res, next) => {
    try {
        await menuService.deleteMenuItem(req.params.id);
        res.status(200).json({ success: true, message: 'Item deleted' });
    } catch (error) {
        if (error.message === 'Menu item not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};
