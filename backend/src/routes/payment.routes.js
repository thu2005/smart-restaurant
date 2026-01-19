const express = require('express');
const { check } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Initiate a payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - restaurantId
 *               - amount
 *               - method
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *                 enum: [STRIPE, MOMO, ZALOPAY, CASH]
 *     responses:
 *       200:
 *         description: Payment initiated
 */
router.post(
    '/',
    [
        check('orderId', 'Order ID is required').not().isEmpty(),
        check('amount', 'Amount is required').isNumeric(),
        check('method', 'Method is required').isIn(['STRIPE', 'MOMO', 'ZALOPAY', 'CASH', 'VNPAY', 'CARD_AT_COUNTER']),
    ],
    paymentController.createPayment
);

/**
 * @swagger
 * /api/payments/stripe/create-intent:
 *   post:
 *     summary: Create Stripe PaymentIntent
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - restaurantId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *               amount:
 *                 type: number
 *               tip:
 *                 type: number
 *               tax:
 *                 type: number
 *     responses:
 *       200:
 *         description: PaymentIntent created successfully
 */
router.post(
    '/stripe/create-intent',
    [
        check('orderId', 'Order ID is required').not().isEmpty(),
        check('restaurantId', 'Restaurant ID is required').not().isEmpty(),
        check('amount', 'Amount is required').isNumeric(),
    ],
    paymentController.createStripePaymentIntent
);

/**
 * @swagger
 * /api/payments/stripe/confirm:
 *   post:
 *     summary: Confirm Stripe payment status
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment status confirmed
 */
router.post(
    '/stripe/confirm',
    [
        check('paymentIntentId', 'PaymentIntent ID is required').not().isEmpty(),
    ],
    paymentController.confirmStripePayment
);

router.post('/webhook', paymentController.webhook);

/**
 * @swagger
 * /api/payments/momo/callback:
 *   post:
 *     summary: Momo payment callback/IPN endpoint
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Callback processed
 */
router.post('/momo/callback', paymentController.momoCallback);

/**
 * @swagger
 * /api/payments/momo/return:
 *   get:
 *     summary: Momo payment return URL (customer redirect after payment)
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Return processed
 */
router.get('/momo/return', paymentController.momoReturn);

module.exports = router;
