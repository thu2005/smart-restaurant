const reviewService = require('../services/review.service');
const { validationResult } = require('express-validator');

exports.createReview = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { menuItemId, rating, comment } = req.body;

        const review = await reviewService.createReview({
            userId: req.user.id,
            menuItemId,
            restaurantId: req.body.restaurantId || req.user.restaurantId, // Fallback if admin
            rating: Number(rating),
            comment
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        if (error.message === 'Menu item not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

exports.getReviews = async (req, res, next) => {
    try {
        const { menuItemId } = req.params;
        const { page, limit } = req.query;

        const result = await reviewService.getReviews(menuItemId, {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        });

        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};
