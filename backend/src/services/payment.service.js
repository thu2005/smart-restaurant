const { prisma } = require('../config/database');

// Mock Gateways
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

class PaymentService {
    async createPayment(data) {

        const { orderId, restaurantId, amount, method, tip, tax } = data;

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
            // Use unitPrice which includes modifiers now
            expectedTotal += (Number(item.unitPrice) * item.quantity);
        }
        // Add tip and tax if provided
        const totalPaid = parseFloat(amount);
        const expectedWithExtras = expectedTotal + (parseFloat(tax) || 0) + (parseFloat(tip) || 0);

        // Validate payment amount matches order total (within small margin for floating point)
        if (totalPaid < expectedWithExtras) {
            throw new Error(`Payment amount (${totalPaid}) does not match order total (${expectedWithExtras})`);
        }

        // Create pending payment
        const payment = await prisma.payment.create({
            data: {
                orderId,
                restaurantId,
                amount, // The total amount paid
                tip: tip || 0,
                tax: tax || 0,
                total: totalPaid,
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
                        amount: Math.round(totalPaid * 100), // cents
                        currency: 'usd', // or vnd
                        metadata: { orderId: String(orderId), paymentId: String(payment.id) }
                    });
                    console.log('💳 Stripe PaymentIntent Created. Data:', { orderId, paymentId: payment.id, intentId: intent.id });
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
        if (gateway === 'STRIPE') {
            const event = payload;
            console.log('🔔 Webhook Received:', event.type);

            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                console.log('📋 Payment Intent Metadata:', paymentIntent.metadata);

                const { paymentId, orderId } = paymentIntent.metadata || {};

                if (!paymentId || !orderId) {
                    console.error('❌ Missing paymentId or orderId in metadata');
                    return { received: true, error: 'Missing metadata' };
                }

                try {
                    console.log(`💰 Updating Status for Payment ${paymentId} / Order ${orderId}`);

                    // 1. Update Payment Status
                    const updatedPayment = await prisma.payment.update({
                        where: { id: paymentId },
                        data: {
                            status: 'COMPLETED',
                            gatewayResponse: paymentIntent,
                            paidAt: new Date()
                        }
                    });

                    // 2. Update Order Status
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { status: 'COMPLETED' }
                    });

                    console.log('✅ Database Updated Successfully');

                    return {
                        success: true,
                        orderId,
                        restaurantId: updatedPayment.restaurantId
                    };
                } catch (dbError) {
                    console.error('❌ Database Update Failed:', dbError.message);
                    return { received: true, error: dbError.message };
                }
            }
        }
        return { received: true };
    }
}

module.exports = new PaymentService();

