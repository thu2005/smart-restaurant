const { prisma } = require('../config/database');

// Mock Gateways
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

class PaymentService {
    async createPayment(data) {
        const { orderId, restaurantId, amount, method, tip } = data;

        // Check if order exists and is not already paid
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true }
        });

        if (!order) throw new Error('Order not found');
        if (order.payment && order.payment.status === 'COMPLETED') {
            throw new Error('Order already paid');
        }

        const total = parseFloat(amount) + (parseFloat(tip) || 0);

        // Create pending payment
        const payment = await prisma.payment.create({
            data: {
                orderId,
                restaurantId,
                amount,
                tip: tip || 0,
                total,
                method,
                status: 'PENDING',
            }
        });

        // Handle Gateway Logic
        let gatewayResponse = {};
        let status = 'PENDING';

        try {
            if (method === 'STRIPE') {
                // Create PaymentIntent
                if (process.env.STRIPE_SECRET_KEY) {
                    const intent = await stripe.paymentIntents.create({
                        amount: Math.round(total * 100), // cents
                        currency: 'usd', // or vnd
                        metadata: { orderId, paymentId: payment.id }
                    });
                    gatewayResponse = intent;
                    // Client uses client_secret to complete on frontend
                    // Webhook will update status later
                } else {
                    // Mock success for development
                    status = 'COMPLETED';
                    gatewayResponse = { id: 'mock_tx_123', status: 'succeeded' };
                }
            } else if (method === 'CASH') {
                status = 'COMPLETED'; // Cash is "paid" when waiter confirms (different flow usually, but simplifying)
            } else {
                // ZaloPay / MoMo - usually return a payment URL
                gatewayResponse = { payUrl: `https://mock-gateway.com/pay/${payment.id}` };
            }
        } catch (err) {
            console.error('Payment Gateway Error:', err);
            status = 'FAILED';
        }

        // Update payment record if synchronous success (like mock)
        if (status !== 'PENDING') {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status,
                    gatewayResponse: gatewayResponse,
                    paidAt: status === 'COMPLETED' ? new Date() : null
                }
            });

            if (status === 'COMPLETED') {
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'COMPLETED' } // or whatever final status
                });
            }
        }

        return { paymentId: payment.id, status, gatewayResponse };
    }

    async handleWebhook(gateway, payload) {
        // Logic to update payment status based on webhook
        return { received: true };
    }
}

module.exports = new PaymentService();
