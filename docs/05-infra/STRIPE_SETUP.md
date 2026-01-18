# Stripe Credit/Debit Card Payment Integration Guide

This guide explains how to set up and test Stripe credit/debit card payments in the Smart Restaurant application.

## Overview

The application now supports three payment methods:
1. **Credit/Debit Card** (via Stripe)
2. **MoMo Wallet** (Vietnamese e-wallet)
3. **Pay at Counter** (Cash)

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js and npm installed
3. Backend and frontend dependencies installed

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)

### 2. Configure Backend

Add your Stripe secret key to `backend/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

The backend has already been configured with:
- Payment Intent creation endpoint: `POST /api/payments/stripe/create-intent`
- Payment confirmation endpoint: `POST /api/payments/stripe/confirm`
- Webhook handler: `POST /api/payments/webhook`

### 3. Configure Frontend

Add your Stripe publishable key to `frontend/.env`:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### 4. Install Dependencies (Already Done)

Backend:
```bash
cd backend
npm install stripe  # Already installed
```

Frontend:
```bash
cd frontend
npm install @stripe/react-stripe-js @stripe/stripe-js  # Already installed
```

## Testing Locally

### 1. Start the Backend

```bash
cd backend
npm run dev
```

Your backend should be running on http://localhost:5000

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

Your frontend should be running on http://localhost:5173

### 3. Test Card Payments

Use Stripe's test card numbers:

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

**Test Card Details:**
- **Card Number:** 4242 4242 4242 4242
- **Expiry Date:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)
- **Cardholder Name:** Any name

### 4. Payment Flow

1. Navigate to the order tracking page after placing an order
2. Select "Credit/Debit Card" as payment method
3. The app will automatically create a PaymentIntent with Stripe
4. Enter test card details in the Stripe Elements form
5. Click "Pay" button
6. The payment will be processed securely through Stripe
7. On success, the order status will update to "COMPLETED"

## Webhook Testing (Optional)

To test webhooks locally, you need to expose your local server to the internet using ngrok or Stripe CLI.

### Using Stripe CLI (Recommended)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
4. The CLI will provide a webhook signing secret (starts with `whsec_`)
5. Add it to your `backend/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_CLI
   ```

### Using ngrok

1. Install ngrok: https://ngrok.com/download
2. Start ngrok tunnel:
   ```bash
   ngrok http 5000
   ```
3. Copy the HTTPS URL (e.g., https://abcd1234.ngrok.io)
4. Go to Stripe Dashboard > Developers > Webhooks
5. Add endpoint: `https://abcd1234.ngrok.io/api/payments/webhook`
6. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
7. Copy the webhook signing secret and add to `backend/.env`

## Production Deployment

### 1. Update Environment Variables

**Backend (Vercel/Railway/Heroku):**
```env
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

### 2. Set Up Production Webhooks

1. Go to Stripe Dashboard (live mode)
2. Add webhook endpoint: `https://your-backend-domain.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret
5. Add it to your production backend environment variables

### 3. Enable Live Mode

Before going live:
1. Complete Stripe account verification
2. Switch from test keys to live keys
3. Test with real (small amount) transactions
4. Set up proper error handling and logging

## Architecture

### Backend Components

1. **Payment Controller** (`src/controllers/payment.controller.js`)
   - `createStripePaymentIntent`: Creates a new PaymentIntent
   - `confirmStripePayment`: Confirms payment status
   - `webhook`: Handles Stripe webhook events

2. **Payment Service** (`src/services/payment.service.js`)
   - `createStripePaymentIntent`: Business logic for PaymentIntent creation
   - `confirmStripePayment`: Verifies payment with Stripe
   - `handleWebhook`: Processes webhook events and updates database

3. **Payment Routes** (`src/routes/payment.routes.js`)
   - `POST /api/payments/stripe/create-intent`
   - `POST /api/payments/stripe/confirm`
   - `POST /api/payments/webhook`

### Frontend Components

1. **StripePaymentWrapper** (`src/components/payment/StripePaymentWrapper.jsx`)
   - Initializes Stripe.js with publishable key
   - Wraps the payment form with Stripe Elements context

2. **StripeCardForm** (`src/components/payment/StripeCardForm.jsx`)
   - Renders secure card input fields using Stripe Elements
   - Handles card payment confirmation
   - Displays payment errors

3. **BillPaymentSection** (`src/pages/customer/order-status-tracking/components/BillPaymentSection.jsx`)
   - Manages payment method selection
   - Creates PaymentIntent when card is selected
   - Integrates with StripePaymentWrapper

## Security Best Practices

1. **Never store raw card details** - Stripe Elements handles this securely
2. **Always verify webhook signatures** - Prevents fake webhook events
3. **Use HTTPS in production** - Required for Stripe payments
4. **Keep API keys secret** - Never commit them to version control
5. **Validate amounts on backend** - Never trust client-side amounts

## Troubleshooting

### Issue: "No 'Access-Control-Allow-Origin' header" (CORS Error)

**Solution:** Ensure your backend CORS configuration allows requests from your frontend:

```javascript
// backend/server.js or similar
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: "Invalid API key provided"

**Solution:** Check that:
1. Your `STRIPE_SECRET_KEY` in backend/.env is correct
2. You're using the right key for your environment (test vs live)
3. The key starts with `sk_test_` or `sk_live_`

### Issue: "clientSecret is null"

**Solution:** 
1. Check backend logs for PaymentIntent creation errors
2. Ensure the backend API endpoint is reachable
3. Verify `VITE_API_URL` in frontend/.env is correct

### Issue: Payment succeeds but order doesn't update

**Solution:**
1. Check webhook configuration
2. Verify webhook signing secret is correct
3. Check backend logs for webhook processing errors
4. Ensure database connection is working

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application issues:
- Check backend logs
- Check browser console for frontend errors
- Review the code in the files mentioned above

## Test Card Numbers Reference

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Visa - Success |
| 4000 0025 0000 3155 | Visa - 3D Secure authentication required |
| 5555 5555 5555 4444 | Mastercard - Success |
| 4000 0000 0000 0002 | Generic decline |
| 4000 0000 0000 9995 | Insufficient funds decline |
| 4000 0000 0000 9987 | Lost card decline |
| 4000 0000 0000 9979 | Stolen card decline |

All test cards:
- Use any future expiry date
- Use any 3-digit CVV
- Use any cardholder name
- Use any billing postal code

## Next Steps

1. Get your Stripe API keys from the dashboard
2. Add them to your `.env` files
3. Start your backend and frontend servers
4. Test with Stripe test cards
5. Set up webhooks for production deployment

Happy testing! 🎉
