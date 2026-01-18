# Stripe Payment Testing Checklist

Use this checklist to verify your Stripe credit/debit card payment integration is working correctly.

## Pre-Testing Setup

- [ ] Stripe account created at https://stripe.com
- [ ] Test API keys obtained from https://dashboard.stripe.com/test/apikeys
- [ ] Backend `.env` file updated with `STRIPE_SECRET_KEY`
- [ ] Frontend `.env` file updated with `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Backend server running (`npm run dev` in backend folder)
- [ ] Frontend server running (`npm run dev` in frontend folder)
- [ ] No console errors in browser
- [ ] Backend logs showing "Server running on port 5000"

## Basic Payment Flow Test

### 1. Navigate to Payment Screen
- [ ] Can access the restaurant menu
- [ ] Can add items to cart
- [ ] Can place an order successfully
- [ ] Order status page loads
- [ ] Payment section is visible

### 2. Payment Method Selection
- [ ] Three payment options visible:
  - [ ] Credit/Debit Card
  - [ ] MoMo Wallet
  - [ ] Pay at Counter
- [ ] Can click on "Credit/Debit Card" option
- [ ] Card option becomes selected (highlighted)

### 3. Stripe Form Loading
- [ ] After selecting card, see "Initializing secure payment..." message
- [ ] Stripe card form loads within 2-3 seconds
- [ ] Form fields appear:
  - [ ] Cardholder Name input
  - [ ] Card Details input (Stripe Elements)
  - [ ] "Save this card" checkbox
  - [ ] Security message displayed
  - [ ] Pay button visible

### 4. Successful Payment
- [ ] Enter test card: **4242 4242 4242 4242**
- [ ] Enter cardholder name: "Test User"
- [ ] Card element accepts the input (no red error)
- [ ] Click "Pay" button
- [ ] Button shows loading state ("Processing Payment...")
- [ ] Payment completes within 3-5 seconds
- [ ] Success message appears
- [ ] Order status updates to "COMPLETED"
- [ ] Backend logs show "Payment Intent Succeeded"

### 5. Declined Card Test
- [ ] Start a new order
- [ ] Navigate to payment screen
- [ ] Select "Credit/Debit Card"
- [ ] Enter declined test card: **4000 0000 0000 0002**
- [ ] Enter any name and click Pay
- [ ] Error message appears: "Your card was declined"
- [ ] Can try again with different card
- [ ] Order status remains PAYMENT_PENDING

### 6. 3D Secure Test (Optional)
- [ ] Start a new order
- [ ] Select "Credit/Debit Card"
- [ ] Enter 3DS test card: **4000 0025 0000 3155**
- [ ] Click Pay
- [ ] 3D Secure modal appears
- [ ] Click "Complete" or "Fail" in test modal
- [ ] Payment succeeds or fails accordingly

## Error Handling Tests

### Network Errors
- [ ] Stop backend server
- [ ] Try to make payment
- [ ] Appropriate error message shown
- [ ] Frontend doesn't crash
- [ ] Can retry after restarting backend

### Invalid API Keys
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY` to invalid value
- [ ] Restart frontend
- [ ] Error appears in console about invalid key
- [ ] Payment form doesn't load properly

### Missing Environment Variables
- [ ] Remove `VITE_STRIPE_PUBLISHABLE_KEY` from .env
- [ ] Restart frontend
- [ ] Check if app handles missing key gracefully
- [ ] Add key back and restart

## UI/UX Tests

### Visual Appearance
- [ ] Card form looks professional and clean
- [ ] Stripe branding visible in form
- [ ] Loading states are clear
- [ ] Error messages are readable
- [ ] Success feedback is obvious
- [ ] Mobile responsive (test on phone or resize browser)

### User Experience
- [ ] Form validation works (try invalid card numbers)
- [ ] Can't submit empty form
- [ ] Clear what to do at each step
- [ ] No confusing error messages
- [ ] Payment process feels secure

## Integration Tests

### Database Updates
- [ ] After successful payment, check database:
  - [ ] Payment record created with status "COMPLETED"
  - [ ] Order status updated to "COMPLETED"
  - [ ] Payment amount matches order total
  - [ ] Payment method is "STRIPE"
  - [ ] `paidAt` timestamp is set

### API Endpoint Tests
Using a tool like Postman or curl:

#### Create PaymentIntent
```bash
curl -X POST http://localhost:5000/api/payments/stripe/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "restaurantId": "YOUR_RESTAURANT_ID",
    "amount": 100,
    "tax": 10,
    "tip": 5
  }'
```
- [ ] Returns 200 status
- [ ] Response contains `clientSecret`
- [ ] Response contains `paymentIntentId`

## Webhook Tests (Optional but Recommended)

### Local Webhook Testing with Stripe CLI
- [ ] Stripe CLI installed
- [ ] Logged in to Stripe CLI: `stripe login`
- [ ] Webhook forwarding running: `stripe listen --forward-to localhost:5000/api/payments/webhook`
- [ ] Make a test payment
- [ ] Webhook event received by CLI
- [ ] Webhook forwarded to local server
- [ ] Backend processes webhook successfully
- [ ] Database updated via webhook

### Webhook Signature Verification
- [ ] Set `STRIPE_WEBHOOK_SECRET` in backend .env
- [ ] Webhook with invalid signature is rejected
- [ ] Webhook with valid signature is processed
- [ ] Logs show signature verification status

## Performance Tests

### Response Times
- [ ] PaymentIntent creation < 2 seconds
- [ ] Card form loading < 3 seconds
- [ ] Payment confirmation < 5 seconds
- [ ] Page remains responsive during payment

### Multiple Concurrent Payments
- [ ] Open multiple browser tabs
- [ ] Start payments in each tab
- [ ] All payments process correctly
- [ ] No race conditions or conflicts

## Production Readiness Checks

Before deploying to production:

### Security
- [ ] Using HTTPS for all production endpoints
- [ ] Environment variables not committed to git
- [ ] Live Stripe keys kept secure
- [ ] Webhook signature verification enabled
- [ ] CORS configured correctly

### Monitoring
- [ ] Error logging set up
- [ ] Payment success/failure tracking
- [ ] Webhook delivery monitoring
- [ ] Alert system for failed payments

### Testing
- [ ] Tested with small real payment amounts
- [ ] Tested refund process (if applicable)
- [ ] Load testing completed
- [ ] Edge cases handled

### Documentation
- [ ] Team knows how to access Stripe Dashboard
- [ ] Troubleshooting guide available
- [ ] Support contacts documented
- [ ] Backup plan if Stripe is down

## Test Card Reference

| Card Number | Scenario | Expected Result |
|------------|----------|-----------------|
| 4242 4242 4242 4242 | Successful payment | ✅ Payment succeeds |
| 5555 5555 5555 4444 | Successful Mastercard | ✅ Payment succeeds |
| 4000 0000 0000 0002 | Generic decline | ❌ Card declined |
| 4000 0000 0000 9995 | Insufficient funds | ❌ Insufficient funds |
| 4000 0000 0000 9987 | Lost card | ❌ Lost card |
| 4000 0000 0000 9979 | Stolen card | ❌ Stolen card |
| 4000 0025 0000 3155 | 3D Secure required | 🔐 Authentication modal |
| 4242 4242 4242 4241 | Invalid card | ❌ Invalid card number |

**For all test cards:**
- Use any future expiry date (e.g., 12/26)
- Use any 3-digit CVV (e.g., 123)
- Use any billing postal code (e.g., 12345)

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Form not loading | Check `VITE_STRIPE_PUBLISHABLE_KEY` in frontend .env |
| "Invalid API key" | Verify backend `STRIPE_SECRET_KEY` starts with `sk_test_` |
| CORS error | Add frontend URL to backend CORS config |
| Payment succeeds but order not updating | Check webhook configuration |
| Card element styling broken | Verify Stripe Elements loaded correctly |

## Sign-Off

- [ ] All basic tests passed
- [ ] All error handling tests passed
- [ ] UI/UX is acceptable
- [ ] Integration tests passed
- [ ] Webhook tests passed (or N/A)
- [ ] Performance is acceptable
- [ ] Production checklist reviewed
- [ ] Ready for deployment / user testing

**Tester Name:** ___________________
**Date:** ___________________
**Environment:** □ Local  □ Staging  □ Production
**Overall Status:** □ Pass  □ Fail  □ Pass with issues

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
