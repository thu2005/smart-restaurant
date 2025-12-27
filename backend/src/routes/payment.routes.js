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

router.post('/webhook', paymentController.webhook);

module.exports = router;
