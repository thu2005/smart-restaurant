const paymentService = require('../services/payment.service');
const { validationResult } = require('express-validator');

exports.createPayment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { paymentId, status, gatewayResponse } = await paymentService.createPayment(req.body);

        const io = req.app.get('io');
        if (status === 'COMPLETED' && io) {
            io.to(req.body.restaurantId).emit('payment_received', { orderId: req.body.orderId });
        }

        res.status(200).json({
            success: true,
            data: { paymentId, status, gatewayResponse }
        });
    } catch (error) {
        next(error);
    }
};

exports.webhook = async (req, res, next) => {
    // Webhook handler
    res.json({ received: true });
}
