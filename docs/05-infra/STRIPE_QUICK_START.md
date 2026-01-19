# Quick Start: Stripe Card Payments

## 1. Get Stripe Keys (5 minutes)

Visit: https://dashboard.stripe.com/test/apikeys

Copy:
- **Publishable Key** (pk_test_...) → Frontend .env
- **Secret Key** (sk_test_...) → Backend .env

## 2. Add to Environment Files

**Backend (.env):**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_API_URL=http://localhost:5000/api
```

## 3. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 4. Test Payment

1. Place an order in the app
2. Go to order tracking page
3. Select "Credit/Debit Card"
4. Use test card: **4242 4242 4242 4242**
5. Any future expiry, any CVV, any name
6. Click Pay button

## Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Declined |
| 4000 0025 0000 3155 | 🔐 Requires 3D Secure |

## Webhook Setup (for Production)

### Option 1: Stripe CLI (Local Testing)
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

### Option 2: ngrok (Local Testing)
```bash
ngrok http 5000
# Use the https URL in Stripe Dashboard → Webhooks
```

### Option 3: Production
Add webhook in Stripe Dashboard:
```
https://your-backend-domain.com/api/payments/webhook
```

Events to listen for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/stripe/create-intent` | POST | Create PaymentIntent |
| `/api/payments/stripe/confirm` | POST | Confirm payment status |
| `/api/payments/webhook` | POST | Handle Stripe webhooks |

## Key Files

**Backend:**
- `src/controllers/payment.controller.js` - Payment endpoints
- `src/services/payment.service.js` - Stripe integration logic
- `src/routes/payment.routes.js` - API routes

**Frontend:**
- `src/components/payment/StripePaymentWrapper.jsx` - Stripe provider
- `src/components/payment/StripeCardForm.jsx` - Card input form
- `src/pages/customer/order-status-tracking/components/BillPaymentSection.jsx` - Payment UI

## Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Add frontend URL to backend CORS config |
| Invalid API key | Check .env file has correct Stripe keys |
| Payment not updating | Verify webhook URL and signing secret |
| Loading forever | Check backend is running and API_URL is correct |

## Documentation

Full guide: `docs/05-infra/STRIPE_SETUP.md`
