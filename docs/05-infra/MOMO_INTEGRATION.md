# MoMo Payment Integration Guide

## Overview
MoMo payment integration has been implemented using the MoMo sandbox (test) environment. This allows customers to pay for their orders using MoMo Wallet.

## Files Modified

### Backend
1. **`backend/src/services/payment.service.js`**
   - Updated MoMo configuration to use public sandbox credentials
   - Changed `requestType` from `captureWallet` to `payWithMethod`
   - Improved error handling and logging
   - Now attempts real API call first, falls back to mock only on error

2. **`backend/src/controllers/payment.controller.js`**
   - Already had MoMo callback and return handlers

3. **`backend/src/routes/payment.routes.js`**
   - Already had MoMo routes configured

4. **`backend/.env.example`**
   - Updated with public MoMo sandbox credentials

### Frontend
1. **`frontend/src/services/paymentService.js`**
   - Updated to match backend API structure (orderId, restaurantId, amount, method, tip, tax)

2. **`frontend/src/pages/customer/shopping-cart/index.jsx`**
   - Updated `handlePayment` function to:
     - Calculate correct total from order items
     - Handle MoMo payment response with payUrl
     - Redirect to MoMo payment page when MoMo is selected

3. **`frontend/src/pages/customer/payment/result.jsx`** (NEW)
   - Payment result page for handling return from MoMo
   - Shows success/failure status
   - Redirects to order tracking on success or cart on failure

4. **`frontend/src/Routes.jsx`**
   - Updated import path for PaymentResult component

## MoMo Sandbox Credentials (Public - Safe for Testing)
```
Partner Code: MOMO
Access Key: F8BBA842ECF85
Secret Key: K951B6PE1waDMi640xX08PD3vg6EkVlz
Endpoint: https://test-payment.momo.vn/v2/gateway/api/create
```

These are official MoMo sandbox credentials provided for testing purposes.

## How It Works

### Customer Flow
1. Customer adds items to cart
2. Waiter creates a bill for the order
3. Bill appears in customer's shopping cart with itemized details
4. Customer selects "Momo Wallet" as payment method
5. Customer clicks "Pay [amount]₫"
6. Backend creates MoMo payment request
7. Customer is redirected to MoMo payment page
8. Customer completes payment in MoMo app/web
9. MoMo redirects back to `/customer/payment/result`
10. Payment result page shows success/failure

### Backend Flow
1. Receives payment request with orderId, amount, method
2. Creates payment record in database (status: PENDING)
3. Generates MoMo payment request with signature
4. Makes API call to MoMo endpoint
5. Returns payUrl to frontend
6. Waits for MoMo callback (IPN) to confirm payment
7. Updates payment status to COMPLETED on success

### MoMo Callback (IPN)
- Endpoint: `POST /api/payments/momo/callback`
- Verifies signature from MoMo
- Updates payment and order status
- Emits socket event to notify waiters

## Testing MoMo Payment

### Option 1: Real MoMo Sandbox 
1. Make sure backend is running
2. Use the public sandbox credentials (already configured)
3. When you click "Pay with MoMo", you'll be redirected to MoMo's test payment page
4. Use MoMo sandbox app or test account to complete payment

### Option 2: Mock Payment 
- If MoMo API is unreachable, the system automatically returns a mock payment URL
- This allows testing the flow without actual MoMo integration

## For Production

When deploying to production:

1. **Register for MoMo Business Account**
   - Go to https://business.momo.vn
   - Complete merchant registration
   - Get your production credentials

2. **Update Environment Variables**
   ```env
   MOMO_PARTNER_CODE=your_production_partner_code
   MOMO_ACCESS_KEY=your_production_access_key
   MOMO_SECRET_KEY=your_production_secret_key
   MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
   MOMO_RETURN_URL=https://yourdomain.com/customer/payment/result
   MOMO_NOTIFY_URL=https://yourdomain.com/api/payments/momo/callback
   ```

3. **Important: Webhook URL**
   - For local testing, use ngrok to expose your localhost
   - For production, use your actual domain
   - MoMo needs to reach your callback URL to confirm payments

## Webhook Setup for Local Development

Since MoMo needs to send callbacks to your server, and localhost is not accessible from the internet:

### Using ngrok:
```bash
# Install ngrok
npm install -g ngrok

# Start your backend on port 5000
cd backend
npm run dev

# In another terminal, expose port 5000
ngrok http 5000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update your .env:
MOMO_NOTIFY_URL=https://abc123.ngrok.io/api/payments/momo/callback
```

## Payment Methods Available
- **Card** (Credit/Debit Card)
- **MoMo** (MoMo Wallet) - Now fully integrated!
- **Cash** (Pay at Counter)
