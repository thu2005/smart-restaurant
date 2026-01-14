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
    try {
        // In a real app, verify Stripe signature header here
        const result = await paymentService.handleWebhook('STRIPE', req.body);

        if (result.success) {
            const io = req.app.get('io');
            if (io) {
                io.to(result.restaurantId).emit('payment_received', { orderId: result.orderId });
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
}
