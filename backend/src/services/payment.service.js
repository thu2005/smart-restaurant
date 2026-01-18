const { prisma } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');

// Payment Gateways for stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// Momo Configuration - Using sandbox credentials for testing
const MOMO_CONFIG = {
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
    secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:5173/customer/payment/result',
    notifyUrl: process.env.MOMO_NOTIFY_URL || 'http://localhost:5000/api/payments/momo/callback'
};

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

        // Check if a pending payment already exists, update it instead of creating new
        let payment;
        if (order.payment && (order.payment.status === 'PENDING' || order.payment.status === 'FAILED')) {
            // Update existing pending/failed payment
            payment = await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                    amount,
                    tip: tip || 0,
                    tax: tax || 0,
                    total: totalPaid,
                    method,
                    status: 'PENDING',
                    gatewayResponse: null,
                }
            });
            console.log('Reusing existing payment record:', payment.id);
        } else {
            // Create new pending payment
            payment = await prisma.payment.create({
                data: {
                    orderId,
                    restaurantId,
                    amount,
                    tip: tip || 0,
                    tax: tax || 0,
                    total: totalPaid,
                    method,
                    status: 'PENDING',
                }
            });
            console.log('Created new payment record:', payment.id);
        }

        // Handle Gateway Logic
        let gatewayResponse = {};
        let status = 'PENDING';

        try {
            if (method === 'STRIPE') {
                // Create PaymentIntent for Stripe
                if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock') {
                    const intent = await stripe.paymentIntents.create({
                        amount: Math.round(totalPaid * 100), // cents (or smallest currency unit)
                        currency: 'vnd', // Vietnamese Dong
                        automatic_payment_methods: {
                            enabled: true,
                        },
                        metadata: { 
                            orderId: String(orderId), 
                            paymentId: String(payment.id),
                            restaurantId: String(restaurantId)
                        }
                    });
                    console.log('Stripe PaymentIntent Created:', { orderId, paymentId: payment.id, intentId: intent.id });
                    gatewayResponse = {
                        clientSecret: intent.client_secret,
                        paymentIntentId: intent.id,
                        status: intent.status
                    };
                } else {
                    // Mock success for development
                    status = 'COMPLETED';
                    gatewayResponse = { id: 'mock_stripe_tx_' + Date.now(), status: 'succeeded' };
                }
            } else if (method === 'MOMO') {
                // Create Momo payment request
                const momoPayment = await this.createMomoPayment({
                    orderId,
                    paymentId: payment.id,
                    amount: totalPaid,
                    restaurantId
                });
                gatewayResponse = momoPayment;
                // Momo returns payment URL, status stays PENDING until callback
            } else if (method === 'CASH') {
                status = 'COMPLETED'; // Cash is "paid" when waiter confirms
            } else if (method === 'CARD_AT_COUNTER') {
                status = 'COMPLETED'; // Card at counter confirmed by waiter
            } else {
                // Other methods (ZaloPay, VNPAY) - return mock URL for now
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
            console.log('Webhook Received:', event.type);

            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                console.log('Payment Intent Metadata:', paymentIntent.metadata);
                const { paymentId, orderId } = paymentIntent.metadata || {};

                if (!paymentId || !orderId) {
                    console.error('Missing paymentId or orderId in metadata');
                    return { received: true, error: 'Missing metadata' };
                }

                try {
                    console.log(`Updating Status for Payment ${paymentId} / Order ${orderId}`);

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

                    console.log('Database Updated Successfully');

                    return {
                        success: true,
                        orderId,
                        restaurantId: updatedPayment.restaurantId
                    };
                } catch (dbError) {
                    console.error('Database Update Failed:', dbError.message);
                    return { received: true, error: dbError.message };
                }
            }
        }
        return { received: true };
    }

    /**
     * Create Stripe PaymentIntent
     * @param {Object} data - Payment data
     * @returns {Object} PaymentIntent client secret and metadata
     */
    async createStripePaymentIntent(data) {
        const { orderId, restaurantId, amount, tip, tax } = data;

        // Check if order exists
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

        // Calculate total
        const totalPaid = parseFloat(amount) + (parseFloat(tip) || 0) + (parseFloat(tax) || 0);

        // Check if a pending payment already exists, update it instead of creating new
        let payment;
        if (order.payment && (order.payment.status === 'PENDING' || order.payment.status === 'FAILED')) {
            payment = await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                    amount: parseFloat(amount),
                    tip: parseFloat(tip) || 0,
                    tax: parseFloat(tax) || 0,
                    total: totalPaid,
                    method: 'STRIPE',
                    status: 'PENDING',
                    gatewayResponse: null,
                }
            });
        } else {
            payment = await prisma.payment.create({
                data: {
                    orderId,
                    restaurantId,
                    amount: parseFloat(amount),
                    tip: parseFloat(tip) || 0,
                    tax: parseFloat(tax) || 0,
                    total: totalPaid,
                    method: 'STRIPE',
                    status: 'PENDING',
                }
            });
        }

        // Create PaymentIntent
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
            // Return mock for development
            return {
                clientSecret: 'mock_client_secret_' + payment.id,
                paymentIntentId: 'mock_pi_' + Date.now(),
                paymentId: payment.id,
                amount: totalPaid
            };
        }

        const intent = await stripe.paymentIntents.create({
            amount: Math.round(totalPaid * 100), // Convert to cents
            currency: 'vnd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: String(orderId),
                paymentId: String(payment.id),
                restaurantId: String(restaurantId)
            }
        });

        // Update payment with PaymentIntent ID
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                gatewayResponse: {
                    paymentIntentId: intent.id,
                    status: intent.status
                }
            }
        });

        return {
            clientSecret: intent.client_secret,
            paymentIntentId: intent.id,
            paymentId: payment.id,
            amount: totalPaid
        };
    }

    /**
     * Confirm Stripe payment status
     * @param {string} paymentIntentId - Stripe PaymentIntent ID
     * @returns {Object} Payment status
     */
    async confirmStripePayment(paymentIntentId) {
        try {
            // Retrieve PaymentIntent from Stripe
            const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

            const { paymentId, orderId, restaurantId } = intent.metadata;

            if (intent.status === 'succeeded') {
                // Update payment status
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'COMPLETED',
                        gatewayResponse: intent,
                        paidAt: new Date()
                    }
                });

                // Update order status
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'COMPLETED' }
                });

                return {
                    success: true,
                    status: 'succeeded',
                    orderId,
                    paymentId,
                    restaurantId
                };
            } else {
                return {
                    success: false,
                    status: intent.status,
                    message: 'Payment not yet completed'
                };
            }
        } catch (error) {
            console.error('Confirm Payment Error:', error);
            return {
                success: false,
                status: 'error',
                message: error.message
            };
        }
    }

    /**
     * Create Momo payment request
     * @param {Object} data - Payment data
     * @returns {Object} Momo payment response with payUrl
     */
    async createMomoPayment(data) {
        const { orderId, paymentId, amount, restaurantId } = data;

        // Generate unique request ID
        const requestId = `${paymentId}_${Date.now()}`;
        const orderInfo = `Payment for Order ${orderId}`;
        const redirectUrl = MOMO_CONFIG.returnUrl;
        const ipnUrl = MOMO_CONFIG.notifyUrl;
        const requestType = 'payWithMethod';
        const extraData = Buffer.from(JSON.stringify({ 
            paymentId, 
            orderId, 
            restaurantId 
        })).toString('base64');

        // Create raw signature string
        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        
        // Generate HMAC SHA256 signature
        const signature = crypto
            .createHmac('sha256', MOMO_CONFIG.secretKey)
            .update(rawSignature)
            .digest('hex');

        // Request body
        const requestBody = {
            partnerCode: MOMO_CONFIG.partnerCode,
            partnerName: 'Smart Restaurant',
            storeId: 'SmartRestaurant',
            requestId: requestId,
            amount: Math.round(amount),
            orderId: requestId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: 'vi',
            extraData: extraData,
            requestType: requestType,
            signature: signature
        };

        try {
            console.log('Creating MoMo payment request:', { amount, requestId, orderId });
            console.log('Using credentials:', { 
                partnerCode: MOMO_CONFIG.partnerCode, 
                accessKey: MOMO_CONFIG.accessKey,
                endpoint: MOMO_CONFIG.endpoint 
            });

            // Always make API call to MoMo (even with sandbox credentials)
            const response = await axios.post(MOMO_CONFIG.endpoint, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('MoMo API Response:', response.data);

            if (response.data.resultCode === 0) {
                return {
                    payUrl: response.data.payUrl,
                    deeplink: response.data.deeplink,
                    qrCodeUrl: response.data.qrCodeUrl,
                    requestId: requestId,
                    message: response.data.message,
                    resultCode: response.data.resultCode
                };
            } else {
                console.error('MoMo API Error:', response.data);
                throw new Error(`Momo Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Momo Payment Error:', error.response?.data || error.message);
            // Return mock URL for development if API fails
            if (MOMO_CONFIG.partnerCode === 'MOMO') {
                console.log('Returning mock payment URL for sandbox testing');
                return {
                    payUrl: `http://localhost:5173/customer/payment/momo-mock?amount=${amount}&orderId=${requestId}`,
                    requestId: requestId,
                    message: 'Mock Momo payment (API call failed)',
                    resultCode: 0
                };
            }
            throw error;
        }
    }

    /**
     * Handle Momo callback/IPN
     * @param {Object} momoData - Callback data from Momo
     * @returns {Object} Processing result
     */
    async handleMomoCallback(momoData) {
        try {
            // Verify signature
            const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${momoData.amount}&extraData=${momoData.extraData}&message=${momoData.message}&orderId=${momoData.orderId}&orderInfo=${momoData.orderInfo}&orderType=${momoData.orderType}&partnerCode=${momoData.partnerCode}&payType=${momoData.payType}&requestId=${momoData.requestId}&responseTime=${momoData.responseTime}&resultCode=${momoData.resultCode}&transId=${momoData.transId}`;
            
            const expectedSignature = crypto
                .createHmac('sha256', MOMO_CONFIG.secretKey)
                .update(rawSignature)
                .digest('hex');

            if (momoData.signature !== expectedSignature && MOMO_CONFIG.secretKey !== 'MOMO_SECRET_KEY') {
                console.error('Momo: Invalid signature');
                return { success: false, message: 'Invalid signature' };
            }

            // Decode extraData to get paymentId
            const extraData = JSON.parse(Buffer.from(momoData.extraData, 'base64').toString('utf-8'));
            const { paymentId, orderId, restaurantId } = extraData;

            // Check if payment was successful
            if (momoData.resultCode === 0) {
                // Update payment status
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'COMPLETED',
                        gatewayResponse: momoData,
                        paidAt: new Date()
                    }
                });

                // Update order status
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'COMPLETED' }
                });

                console.log('Momo payment completed:', paymentId);

                return {
                    success: true,
                    orderId,
                    paymentId,
                    restaurantId
                };
            } else {
                // Payment failed
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: 'FAILED',
                        gatewayResponse: momoData
                    }
                });

                console.log('Momo payment failed:', momoData.message);
                return { success: false, message: momoData.message };
            }
        } catch (error) {
            console.error('Momo Callback Error:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = new PaymentService();

