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
            // Emit to waiters
            io.to(req.body.restaurantId).emit('payment_received', { orderId: req.body.orderId });
            // Also emit to customers
            io.to(req.body.restaurantId).emit('payment_confirmed', { orderId: req.body.orderId });
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
};

exports.momoCallback = async (req, res, next) => {
    try {
        const result = await paymentService.handleMomoCallback(req.body);

        if (result.success) {
            const io = req.app.get('io');
            if (io && result.restaurantId) {
                io.to(result.restaurantId).emit('payment_received', { 
                    orderId: result.orderId,
                    paymentId: result.paymentId 
                });
            }
        }

        res.json({ resultCode: result.success ? 0 : 1, message: result.message || 'Processed' });
    } catch (err) {
        console.error('Momo Callback Error:', err.message);
        res.status(400).json({ resultCode: 1, message: err.message });
    }
};

exports.momoReturn = async (req, res, next) => {
    try {
        // This is the return URL where customer lands after payment
        // Redirect to frontend with payment status
        const { resultCode, orderId, message } = req.query;
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
        const redirectUrl = `${frontendUrl}/customer/payment/result?resultCode=${resultCode}&orderId=${orderId}&message=${encodeURIComponent(message || '')}`;
        
        res.redirect(redirectUrl);
    } catch (err) {
        console.error('Momo Return Error:', err.message);
        res.status(400).send(`Error: ${err.message}`);
    }
};
