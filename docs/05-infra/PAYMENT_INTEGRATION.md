# Payment Integration Guide

This document explains how to set up and use Stripe and Momo wallet payments in the Smart Restaurant system.

## Overview

The system supports multiple payment methods:
- **Stripe**: International card payments (Visa, Mastercard, Apple Pay, Google Pay)
- **Momo**: Vietnamese e-wallet (most popular in Vietnam)
- **Cash**: Pay at counter
- **Card at Counter**: Physical card payment at counter

## Payment Flow

### Customer Flow:
1. Customer browses menu and adds items to cart
2. Customer submits order
3. When order is served, customer clicks "Request Bill"
4. Customer selects payment method:
   - **Stripe**: Pay with card online
   - **Momo**: Redirected to Momo app/website
   - **Cash**: Pay at counter when waiter arrives
5. Payment is processed
6. Waiter receives notification of successful payment
7. Order is marked as completed

### Waiter Flow:
1. Waiter receives real-time notification when customer requests bill
2. Waiter creates bill (shows subtotal, tax, total)
3. Waiter can apply discounts if needed
4. Waiter processes payment or waits for online payment confirmation
5. Waiter receives notification when payment is successful
6. Order status automatically updates to "Completed"

## Stripe Setup

### 1. Create Stripe Account
- Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
- Create an account
- Complete business verification

### 2. Get API Keys
- Navigate to **Developers > API keys** in Stripe Dashboard
- Copy your **Secret key** (starts with `sk_test_` for test mode)
- Copy your **Webhook secret** (from Webhooks section)

### 3. Configure Backend
Add to `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Setup Webhook
- Go to **Developers > Webhooks** in Stripe Dashboard
- Click "Add endpoint"
- URL: `https://your-domain.com/api/payments/webhook`
- Select events: `payment_intent.succeeded`
- Save and copy the webhook secret

### 5. Test Stripe
Use test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Any future expiry date and any CVV

## Momo Wallet Setup

### 1. Register for Momo Business Account
- Visit [Momo Business](https://business.momo.vn/)
- Register for a business account
- Complete KYC verification

### 2. Get Momo Credentials
After approval, you'll receive:
- Partner Code
- Access Key
- Secret Key

### 3. Configure Backend
Add to `backend/.env`:
```env
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:5174/customer/payment/result
MOMO_NOTIFY_URL=https://your-domain.com/api/payments/momo/callback
```

**Important for Production:**
- Change `MOMO_ENDPOINT` to production URL: `https://payment.momo.vn/v2/gateway/api/create`
- Update `MOMO_RETURN_URL` to your production frontend URL
- Update `MOMO_NOTIFY_URL` to your production backend URL

### 4. Test Momo
For testing without real credentials, the system uses mock mode:
- Mock credentials are used if you haven't set real ones
- A mock payment URL will be generated
- You can test the flow without actual Momo integration

## Currency Settings

### Stripe
Currently configured for **VND (Vietnamese Dong)**. To change:
```javascript
// backend/src/services/payment.service.js
currency: 'vnd', // Change to 'usd', 'eur', etc.
```

### Momo
Momo only supports VND (Vietnamese Dong).

## Development vs Production

### Development Mode
- Stripe: Use test mode keys (starts with `sk_test_`)
- Momo: Use test endpoint and credentials
- Webhook URLs: Use tools like [ngrok](https://ngrok.com/) to expose localhost

### Production Mode
- Stripe: Use live mode keys (starts with `sk_live_`)
- Momo: Use production endpoint
- Webhook URLs: Use your actual domain with HTTPS

## Webhook Setup for Development

Use ngrok to test webhooks locally:

```bash
# Install ngrok
npm install -g ngrok

# Start your backend
cd backend
npm run dev

# In another terminal, expose port 5000
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Add it to Stripe/Momo webhook settings:
# Stripe: https://abc123.ngrok.io/api/payments/webhook
# Momo: https://abc123.ngrok.io/api/payments/momo/callback
```

## Frontend Integration

The frontend is already configured to support both payment methods. No additional setup needed.

### Stripe Elements (Future Enhancement)
For a more secure card input, consider using Stripe Elements:
1. Install: `npm install @stripe/react-stripe-js @stripe/stripe-js`
2. Update PaymentMethodSelector component
3. Use Stripe's pre-built card input components

## API Endpoints

### Create Payment
```
POST /api/payments
```
Body:
```json
{
  "orderId": "order_id",
  "restaurantId": "restaurant_id",
  "amount": 100000,
  "tax": 10000,
  "tip": 5000,
  "method": "STRIPE" // or "MOMO", "CASH", "CARD_AT_COUNTER"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_id",
    "status": "PENDING",
    "gatewayResponse": {
      "clientSecret": "pi_xxx_secret_xxx", // For Stripe
      "payUrl": "https://payment.momo.vn/..." // For Momo
    }
  }
}
```

### Stripe Webhook
```
POST /api/payments/webhook
```
Automatically called by Stripe when payment succeeds.

### Momo Callback
```
POST /api/payments/momo/callback
```
Automatically called by Momo when payment completes.

### Momo Return URL
```
GET /api/payments/momo/return
```
Customer is redirected here after Momo payment.

## Testing the Flow

### Test Stripe Payment:
1. Request bill from order status page
2. Select "Credit/Debit Card"
3. Use test card: 4242 4242 4242 4242
4. Any future expiry, any CVV
5. Payment should succeed
6. Waiter receives notification

### Test Momo Payment (Mock):
1. Request bill from order status page
2. Select "Momo Wallet"
3. You'll be redirected to mock Momo page
4. Click confirm
5. Redirected back with success message
6. Waiter receives notification

### Test Cash Payment:
1. Request bill from order status page
2. Waiter sees bill request notification
3. Waiter creates bill
4. Waiter selects "Cash" and confirms
5. Order marked as completed

## Troubleshooting

### Stripe Issues:
- **"No such payment intent"**: Check if STRIPE_SECRET_KEY is correct
- **"Invalid API key"**: Verify you're using the right key for test/live mode
- **Webhook not firing**: Check ngrok URL and Stripe webhook configuration

### Momo Issues:
- **"Invalid signature"**: Check MOMO_SECRET_KEY
- **"Partner not found"**: Verify MOMO_PARTNER_CODE
- **Callback not working**: Ensure MOMO_NOTIFY_URL is publicly accessible

### General Issues:
- **Payment not updating**: Check if WebSocket is connected
- **Database not updating**: Check backend logs for errors
- **Frontend not showing payment methods**: Clear browser cache

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all credentials
3. **Validate webhook signatures** (already implemented)
4. **Use HTTPS in production** for all webhook URLs
5. **Implement rate limiting** for payment endpoints
6. **Log all payment transactions** for audit trail
7. **Regularly rotate API keys**

## Support

- **Stripe**: [Stripe Documentation](https://stripe.com/docs)
- **Momo**: [Momo Developer Portal](https://developers.momo.vn/)
- **Project Issues**: Create an issue in the repository

## License

This integration is part of the Smart Restaurant system.
