const restaurantService = require('../services/restaurant.service');
const { validationResult } = require('express-validator');

exports.getAllRestaurants = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await restaurantService.getAll(page, limit);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.getRestaurantById = async (req, res, next) => {
    try {
        const restaurant = await restaurantService.getById(req.params.id);
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        if (error.message === 'Restaurant not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.createRestaurant = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const restaurant = await restaurantService.create(req.body);
        res.status(201).json({ success: true, data: restaurant });
    } catch (error) {
        next(error);
    }
};

exports.updateRestaurant = async (req, res, next) => {
    try {
        const restaurant = await restaurantService.update(req.params.id, req.body);
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        if (error.message === 'Restaurant not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.deleteRestaurant = async (req, res, next) => {
    try {
        await restaurantService.delete(req.params.id);
        res.status(200).json({ success: true, message: 'Restaurant deleted' });
    } catch (error) {
        if (error.message === 'Restaurant not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};
