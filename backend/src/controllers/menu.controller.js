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

// --- Photos ---
exports.uploadMenuItemPhotos = async (req, res, next) => {
    try {
        const { id: itemId } = req.params;
        const files = req.files;
        const result = await menuService.uploadMenuItemPhotos(itemId, files);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.deleteMenuItemPhoto = async (req, res, next) => {
    try {
        const { id: itemId, photoId } = req.params;
        await menuService.deleteMenuItemPhoto(itemId, photoId);
        res.status(200).json({ success: true, message: 'Photo deleted' });
    } catch (error) {
        next(error);
    }
};

exports.setMenuItemPrimaryPhoto = async (req, res, next) => {
    try {
        const { id: itemId, photoId } = req.params;
        await menuService.setMenuItemPrimaryPhoto(itemId, photoId);
        res.status(200).json({ success: true, message: 'Primary photo updated' });
    } catch (error) {
        next(error);
    }
};

// --- Modifiers ---
exports.getModifierGroups = async (req, res, next) => {
    try {
        const restaurantId = req.query.restaurantId || req.body.restaurantId || req.user.restaurantId;
        if (!restaurantId) {
            return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
        }
        const groups = await menuService.getModifierGroups(restaurantId);
        res.status(200).json({ success: true, data: groups });
    } catch (error) {
        next(error);
    }
};

exports.createModifierGroup = async (req, res, next) => {
    try {
        // Allow restaurantId from body (for super admin) or from user token
        const restaurantId = req.body.restaurantId || req.user.restaurantId;
        const data = { ...req.body, restaurantId };
        const group = await menuService.createModifierGroup(data);
        res.status(201).json({ success: true, data: group });
    } catch (error) {
        next(error);
    }
};

exports.updateModifierGroup = async (req, res, next) => {
    try {
        const group = await menuService.updateModifierGroup(req.params.id, req.body);
        res.status(200).json({ success: true, data: group });
    } catch (error) {
        next(error);
    }
};

exports.createModifierOption = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const option = await menuService.createModifierOption(groupId, req.body);
        res.status(201).json({ success: true, data: option });
    } catch (error) {
        next(error);
    }
};

exports.updateModifierOption = async (req, res, next) => {
    try {
        const option = await menuService.updateModifierOption(req.params.id, req.body);
        res.status(200).json({ success: true, data: option });
    } catch (error) {
        next(error);
    }
};

exports.attachModifierGroupToItem = async (req, res, next) => {
    try {
        const { id: itemId } = req.params;
        const { groupIds } = req.body;
        await menuService.attachModifierGroupToItem(itemId, groupIds);
        res.status(200).json({ success: true, message: 'Modifier groups attached' });
    } catch (error) {
        next(error);
    }
};
