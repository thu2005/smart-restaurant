const { prisma } = require('../config/database');

// Mock Gateways
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

class PaymentService {
    async createPayment(data) {

        const { orderId, restaurantId, amount, method, tip } = data;

        // Check if order exists and is not already paid
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                payment: true,
                orderItems: {
                    include: { menuItem: true }
                }
            }
        });

        if (!order) throw new Error('Order not found');
        if (order.payment && order.payment.status === 'COMPLETED') {
            throw new Error('Order already paid');
        }

        // Calculate expected order total from order items
        let expectedTotal = 0;
        for (const item of order.orderItems) {
            expectedTotal += (item.menuItem.price * item.quantity);
        }
        // Add tip if provided
        const total = parseFloat(amount) + (parseFloat(tip) || 0);
        const expectedWithTip = expectedTotal + (parseFloat(tip) || 0);

        // Validate payment amount matches order total
        if (total < expectedWithTip) {
            throw new Error(`Payment amount (${total}) does not match order total (${expectedWithTip})`);
        }

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
                if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock') {
                    const intent = await stripe.paymentIntents.create({
                        amount: Math.round(total * 100), // cents
                        currency: 'usd', // or vnd
                        metadata: { orderId, paymentId: payment.id }
                    });
                    gatewayResponse = intent;
                    
                } else {
                    // Mock success for development
                    status = 'COMPLETED';
                    gatewayResponse = { id: 'mock_tx_123', status: 'succeeded' };
                }
            } else if (method === 'CASH') {
                status = 'COMPLETED'; // Cash is "paid" when waiter confirms 
            } else {
                // ZaloPay / MoMo - usually return a payment URL
                gatewayResponse = { payUrl: `https://mock-gateway.com/pay/${payment.id}` };
            }
        } catch (err) {
            console.error('Payment Gateway Error:', err);
            status = 'FAILED';
        }

        // Update payment record if synchronous success 
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
                    data: { status: 'COMPLETED' } 
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
