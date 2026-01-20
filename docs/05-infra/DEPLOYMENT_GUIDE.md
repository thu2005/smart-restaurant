# Deployment Guide - Smart Restaurant QR Ordering System

## Table of Contents
- [Overview](#overview)
- [Deployment Architecture](#deployment-architecture)
- [Prerequisites](#prerequisites)
- [Backend Deployment (Render)](#backend-deployment-render)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Database Setup (Supabase)](#database-setup-supabase)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Post-Deployment Verification](#post-deployment-verification)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Smart Restaurant system uses a **serverless/cloud-native deployment** model with the following components:

| Component | Platform | URL Pattern | Technology |
|-----------|----------|-------------|------------|
| **Frontend** | Vercel | `https://*.vercel.app` | React + Vite |
| **Backend API** | Render | `https://*.onrender.com` | Node.js + Express |
| **Database** | Supabase | `db.*.supabase.co` | PostgreSQL 14+ |
| **Static Assets** | Vercel/Render | CDN | Images, QR codes |
| **Monitoring** | Render Metrics | Dashboard | Prometheus metrics |

**Deployment Flow:**
```
Developer Push to GitHub
    ↓
GitHub Webhook Trigger
    ↓
├── Vercel (Frontend) - Auto Deploy
│   ├── Install dependencies
│   ├── Build React app
│   ├── Deploy to CDN
│   └── Generate preview URL
│
└── Render (Backend) - Auto Deploy
    ├── Install dependencies
    ├── Run Prisma migrations
    ├── Generate Prisma Client
    ├── Start Node.js server
    └── Health check verification
```

---

## Deployment Architecture

### Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Internet Users                       │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌────────┐   ┌─────────┐   ┌──────────┐
   │Vercel  │   │ Render  │   │Supabase  │
   │Frontend│◄──┤ Backend │◄──┤PostgreSQL│
   │  CDN   │   │   API   │   │    DB    │
   └────────┘   └─────────┘   └──────────┘
        │             │
        └─────────────┼──────────────┐
                      ▼              ▼
              ┌──────────────┐  ┌─────────┐
              │Socket.IO     │  │ Stripe  │
              │Real-time WS  │  │ Payment │
              └──────────────┘  └─────────┘
```

### Multi-Environment Setup

| Environment | Frontend URL | Backend URL | Database | Branch |
|-------------|-------------|-------------|----------|--------|
| **Local** | `localhost:5173` | `localhost:5001` | Local PG | `dev` |
| **Staging** | `smart-restaurant-staging.vercel.app` | `smart-restaurant-staging.onrender.com` | Supabase (staging) | `staging` |
| **Production** | `smart-restaurant-neon.vercel.app` | `smart-restaurant-neon.onrender.com` | Supabase (prod) | `main` |

---

## Prerequisites

### Required Accounts

1. **GitHub Account** (for code repository)
   - Create repository: `smart-restaurant`
   - Push code to GitHub

2. **Vercel Account** ([vercel.com](https://vercel.com))
   - Sign up with GitHub
   - Free tier: Unlimited deployments, 100GB bandwidth/month

3. **Render Account** ([render.com](https://render.com))
   - Sign up with GitHub
   - Free tier: 750 hours/month (sufficient for 1 service)

4. **Supabase Account** ([supabase.com](https://supabase.com))
   - Sign up
   - Free tier: 500MB database, 2GB bandwidth/month

### Required Tools

- Git CLI
- Node.js 18+ (for local testing)
- PostgreSQL client (for database access)

---

## Backend Deployment (Render)

### Step 1: Create Render Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:

**Basic Settings:**
- **Name**: `smart-restaurant-neon`
- **Region**: `Singapore` (closest to Vietnam) or `Oregon (US West)`
- **Branch**: `main` (production) or `dev` (staging)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install && npx prisma generate
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

**Instance Type:**
- Free tier: `Free` (512 MB RAM, shared CPU)
- Paid: `Starter` ($7/month, 512 MB RAM) or higher

### Step 2: Configure Environment Variables

In Render dashboard, go to **Environment** tab and add these lines (or you can embed directly .env in your project):

```env
# Node Environment
NODE_ENV=production

# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Frontend URL
FRONTEND_URL=https://smart-restaurant-neon.vercel.app
QR_BASE_URL=https://smart-restaurant-neon.vercel.app

# Stripe Payment
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...

# Momo Configuration (Vietnamese e-wallet)
# For testing: Use public sandbox credentials
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://host-device-ip:5173/customer/payment/result
MOMO_NOTIFY_URL=http://localhost:5000/api/payments/momo/callback

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://smart-restaurant-neon.onrender.com/api/auth/google/callback

# Email Service (Resend)
RESEND_API_KEY=re_...

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Metabase (optional)
METABASE_SITE_URL=https://your-metabase-instance.com
METABASE_SECRET_KEY=your-metabase-jwt-secret
```

**How to get these values:**
- `DATABASE_URL`: From Supabase project settings → Database → Connection string (Transaction pooler)
- `DIRECT_URL`: From Supabase → Connection string (Session pooler)
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `STRIPE_SECRET_KEY`: From Stripe dashboard → Developers → API keys
- `RESEND_API_KEY`: From Resend dashboard → API Keys

### Step 3: Add `render.yaml` Configuration (Optional)

Create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: smart-restaurant-neon
    runtime: node
    env: node
    region: singapore
    plan: free
    rootDir: backend
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false  # Set manually in dashboard
      - key: JWT_SECRET
        generateValue: true  # Auto-generate secure secret
      - key: JWT_EXPIRE
        value: 30d
      - key: FRONTEND_URL
        value: https://smart-restaurant-neon.vercel.app
      - key: STRIPE_SECRET_KEY
        sync: false
```

**Note**: `render.yaml` enables infrastructure-as-code but environment variables still need manual setup for sensitive values.

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone repository
   - Install dependencies
   - Run build command
   - Start server
   - Assign public URL

**Deployment logs:**
```
==> Cloning from https://github.com/your-org/smart-restaurant...
==> Running build command: npm install && npx prisma generate
==> Prisma schema loaded from prisma/schema.prisma
==> Prisma Client generated to node_modules/@prisma/client
==> Build succeeded 
==> Starting service: npm start
==> Server listening on port 10000
==> Your service is live 
```

**Service URL**: `https://smart-restaurant-neon.onrender.com`

### Step 5: Run Database Migrations

**Option 1: Add migration to build command**

Update `render.yaml`:
```yaml
buildCommand: npm install && npx prisma migrate deploy && npx prisma generate
```

**Option 2: Run manually via Render Shell**

1. Go to Render dashboard → Service → Shell
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

### Step 6: Verify Deployment

**Health check endpoint:**
```bash
curl https://smart-restaurant-neon.onrender.com/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T12:34:56.789Z",
  "uptime": 123.456
}
```

**Test API:**
```bash
curl https://smart-restaurant-neon.onrender.com/api/restaurants
```

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:

**Framework Preset**: `Vite`  
**Root Directory**: `./` (project root)  
**Build Command**: 
```bash
cd frontend && npm install && npm run build
```
**Output Directory**: `frontend/dist`  
**Install Command**: 
```bash
cd frontend && npm install
```

### Step 2: Configure Environment Variables

In Vercel project settings → Environment Variables:

```env
# Backend API URL
VITE_API_URL=https://smart-restaurant-neon.onrender.com
VITE_SOCKET_URL=https://smart-restaurant-neon.onrender.com

# Stripe (Public Key)
VITE_STRIPE_PUBLIC_KEY=pk_live_... (or pk_test_...)

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_METABASE=true
```

**Important**: Prefix all variables with `VITE_` for Vite to expose them to the browser.

### Step 3: Add `vercel.json` Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Explanation:**
- `rewrites`: Enables SPA routing (all routes serve `index.html`)
- `framework: null`: Disable auto-detection, use manual commands

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will automatically:
   - Clone repository
   - Install dependencies
   - Build React app
   - Deploy to global CDN
   - Assign URL

**Deployment URL**: `https://smart-restaurant-neon.vercel.app`

**Preview URLs**: Every PR gets a unique preview URL like `https://smart-restaurant-git-feature-branch.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your domain: `app.yourrestaurant.com`
3. Configure DNS:
   - **Type**: `CNAME`
   - **Name**: `app`
   - **Value**: `cname.vercel-dns.com`

### Step 6: Verify Deployment

**Open frontend:**
```
https://smart-restaurant-neon.vercel.app
```

**Check API connection:**
1. Open browser DevTools → Network tab
2. Visit homepage
3. Verify API calls to `https://smart-restaurant-neon.onrender.com`

---

## Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New project"**
3. Configure:
   - **Name**: `smart-restaurant-prod`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: `Southeast Asia (Singapore)`
   - **Pricing Plan**: `Free` (500MB) or `Pro` ($25/month, 8GB)

### Step 2: Get Connection Strings

1. Go to Project Settings → Database
2. Copy connection strings:

**Connection string (Transaction pooler)** - for Prisma:
```
postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Connection string (Session pooler)** - for migrations:
```
postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Step 3: Configure Prisma

Update `backend/.env`:

```env
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### Step 4: Run Migrations

```bash
cd backend
npx prisma migrate deploy
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Applied migration 20240115_init
✔ Applied migration 20240120_add_item_status
All migrations applied successfully
```

### Step 5: Seed Database (Optional)

```bash
npm run seed
```

This creates sample data (restaurant, users, menu items, etc.)

### Step 6: Enable Realtime (Optional)

For Socket.IO compatibility:

1. Go to Database → Replication
2. Enable replication for tables that need real-time updates:
   - `Order`
   - `OrderItem`
   - `Payment`

---

## Environment Configuration

### Backend Environment Variables

**File**: `backend/.env`

```env
# ======================
# Node Environment
# ======================
NODE_ENV=production
PORT=5001

# ======================
# Database
# ======================
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# ======================
# JWT Authentication
# ======================
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRE=30d

# ======================
# Frontend URLs
# ======================
FRONTEND_URL=https://smart-restaurant-neon.vercel.app
QR_BASE_URL=https://smart-restaurant-neon.vercel.app

# ======================
# Stripe Payment
# ======================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://smart-restaurant-neon.vercel.app/payment/success
STRIPE_CANCEL_URL=https://smart-restaurant-neon.vercel.app/payment/cancel

# ======================
# MoMo Payment (Vietnam)
# ======================
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_ENDPOINT=https://payment.momo.vn
MOMO_RETURN_URL=https://smart-restaurant-neon.vercel.app/payment/momo/callback
MOMO_NOTIFY_URL=https://smart-restaurant-neon.onrender.com/api/payments/momo/webhook

# ======================
# Google OAuth
# ======================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://smart-restaurant-neon.onrender.com/api/auth/google/callback

# ======================
# Email Service (Resend)
# ======================
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@smartrestaurant.com

# ======================
# File Upload
# ======================
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# ======================
# Metabase Analytics
# ======================
METABASE_SITE_URL=https://your-metabase.com
METABASE_SECRET_KEY=your-metabase-jwt-secret

# ======================
# Security
# ======================
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

**File**: `frontend/.env`

```env
# Backend API
VITE_API_URL=https://smart-restaurant-neon.onrender.com
VITE_SOCKET_URL=https://smart-restaurant-neon.onrender.com

# Stripe (Public Key)
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_GOOGLE_LOGIN=true
VITE_ENABLE_METABASE=true

# App Metadata
VITE_APP_NAME=Smart Restaurant
VITE_APP_VERSION=1.0.0
```

---

## CI/CD Pipeline

### Automated Deployment Flow

**On Push to `main` branch:**

1. **GitHub** detects push
2. **Vercel** webhook triggered:
   - Clone repository
   - Build frontend
   - Deploy to production
   - Invalidate CDN cache
   
3. **Render** webhook triggered:
   - Clone repository
   - Install dependencies
   - Run migrations
   - Build backend
   - Deploy to production
   - Run health checks

**On Pull Request:**
- Vercel creates preview deployment
- Unique URL for testing: `https://smart-restaurant-git-pr-123.vercel.app`

### GitHub Actions (Optional Advanced CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Backend Dependencies
        run: cd backend && npm ci
      
      - name: Run Backend Tests
        run: cd backend && npm test
      
      - name: Install Frontend Dependencies
        run: cd frontend && npm ci
      
      - name: Run Frontend Tests
        run: cd frontend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deploy
        run: |
          curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK_URL }}
```

**Setup:**
1. Add secrets in GitHub → Settings → Secrets
2. Get deploy hooks from Render/Vercel dashboards

---

## Post-Deployment Verification

### Verification Checklist

**Backend API:**
- [ ] Health check passes: `GET /health`
- [ ] API responds: `GET /api/restaurants`
- [ ] Database connected (no 500 errors)
- [ ] Metrics endpoint: `GET /metrics`
- [ ] Swagger docs: `GET /api-docs`

**Frontend:**
- [ ] Homepage loads
- [ ] Menu page loads
- [ ] API calls successful (check Network tab)
- [ ] Images load correctly
- [ ] Socket.IO connects (check Console for "Connected to server")

**Database:**
- [ ] Migrations applied
- [ ] Tables exist (check Prisma Studio)
- [ ] Seed data present (optional)

**Integration:**
- [ ] QR code scan works
- [ ] Order placement successful
- [ ] Payment gateway reachable
- [ ] Email delivery working
- [ ] WebSocket real-time updates

### Test Deployment

**1. Health Check:**
```bash
curl https://smart-restaurant-neon.onrender.com/health
```

**2. API Test:**
```bash
curl https://smart-restaurant-neon.onrender.com/api/restaurants
```

**3. Frontend Test:**
- Open `https://smart-restaurant-neon.vercel.app`
- Check browser console for errors
- Test QR code: Navigate to `https://smart-restaurant-neon.vercel.app/menu?restaurantId=[ID]&tableId=[ID]`

**4. End-to-End Flow:**
1. Scan QR code
2. Browse menu
3. Add items to cart
4. Place order
5. Verify waiter receives order (WebSocket)
6. Check kitchen display
7. Complete payment
8. Verify order status updates

---

## Monitoring & Logging

### Render Monitoring

**Access metrics:**
1. Go to Render dashboard → Service → Metrics
2. View:
   - CPU usage
   - Memory usage
   - Request rate
   - Response time
   - Error rate

**Access logs:**
1. Go to Render dashboard → Service → Logs
2. Real-time log streaming
3. Search and filter logs

**Prometheus metrics:**
```bash
curl https://smart-restaurant-neon.onrender.com/metrics
```

**Metrics exposed:**
- `http_request_duration_seconds` - Request latency histogram
- `http_requests_total` - Total request counter
- `process_cpu_seconds_total` - CPU usage
- `nodejs_heap_size_used_bytes` - Memory usage

### Vercel Analytics

**Enable analytics:**
1. Go to Vercel project → Analytics tab
2. View:
   - Page views
   - Unique visitors
   - Performance (Web Vitals)
   - Top pages

### Error Tracking (Optional)

**Integrate Sentry:**

```bash
npm install @sentry/node @sentry/react
```

**Backend (`server.js`):**
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

**Frontend (`main.jsx`):**
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

---

## Troubleshooting

### Issue 1: Backend Fails to Start

**Symptoms:**
- Render logs show "Build succeeded" but service is "Unavailable"
- 503 errors when accessing API

**Diagnosis:**
```bash
# Check logs in Render dashboard
# Look for:
# - Port binding errors
# - Database connection errors
# - Missing environment variables
```

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check if migrations ran: Add `npx prisma migrate deploy` to build command
3. Ensure `PORT` env var is not set (Render provides it automatically)
4. Check start command: Should be `npm start` not `npm run dev`

### Issue 2: Frontend Can't Reach Backend

**Symptoms:**
- Frontend loads but shows "Cannot connect to server"
- Network errors in browser console

**Diagnosis:**
```javascript
// Check browser console
// Look for CORS errors or 404s
```

**Solutions:**
1. Verify `VITE_API_URL` in Vercel environment variables
2. Check backend CORS settings:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```
3. Ensure backend is running (check Render status)

### Issue 3: Database Migration Fails

**Symptoms:**
- Build fails with "Migration failed to apply"
- Prisma errors in logs

**Diagnosis:**
```bash
# Check Render logs for Prisma errors
# Look for:
# - Connection timeout
# - Invalid credentials
# - Schema conflicts
```

**Solutions:**
1. Verify `DIRECT_URL` for migrations (should use port 5432, not 6543)
2. Check Supabase is accessible
3. Reset migrations and re-run:
   ```bash
   # Locally
   npx prisma migrate reset --force
   npx prisma migrate deploy
   
   # Then redeploy
   ```

### Issue 4: Environment Variables Not Loading

**Symptoms:**
- `undefined` values for environment variables
- Features not working (payment, email, etc.)

**Solutions:**

**Backend (Render):**
1. Go to Environment tab
2. Verify all required variables are set
3. Restart service after adding variables

**Frontend (Vercel):**
1. Check variables are prefixed with `VITE_`
2. Redeploy after adding variables (not just restart)
3. Clear build cache: Settings → General → Clear Cache & Redeploy

### Issue 5: Uploads/Images Not Working

**Symptoms:**
- Image upload fails
- Uploaded images return 404

**Diagnosis:**
```bash
# Check backend logs for file write errors
# Check if uploads/ folder exists
```

**Solutions:**
1. Render free tier has **ephemeral storage** (files deleted on restart)
2. Use cloud storage for production:
   - AWS S3
   - Cloudinary
   - Supabase Storage
   
**Example: Supabase Storage**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

// Upload file
const { data, error } = await supabase.storage
  .from('menu-items')
  .upload('photo.jpg', file);
```

### Issue 6: WebSocket Disconnects

**Symptoms:**
- Real-time updates stop working
- Socket.IO connection errors

**Solutions:**
1. Render free tier spins down after inactivity - upgrade to paid plan
2. Implement reconnection logic (already in codebase):
   ```javascript
   socket.on('disconnect', () => {
     setTimeout(() => socket.connect(), 5000);
   });
   ```
3. Check firewall/proxy settings

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database backup created
- [ ] Staging tested successfully
- [ ] Team notified of deployment

### Backend Deployment

- [ ] Render service created
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Build command verified
- [ ] Health check endpoint working

### Frontend Deployment

- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Build settings correct
- [ ] Preview deployment tested
- [ ] Custom domain configured (if applicable)

### Database Setup

- [ ] Supabase project created
- [ ] Connection strings obtained
- [ ] Migrations applied
- [ ] Seed data loaded (if needed)
- [ ] Backups enabled

### Post-Deployment

- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] WebSocket connected
- [ ] Payment gateway working
- [ ] Email delivery working
- [ ] Monitoring configured
- [ ] Logs accessible
- [ ] Team notified of completion

---

## Quick Reference

### Deployment URLs

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Production | `smart-restaurant-neon.vercel.app` | `smart-restaurant-neon.onrender.com` | Supabase (prod) |
| Staging | `smart-restaurant-staging.vercel.app` | `smart-restaurant-staging.onrender.com` | Supabase (staging) |
| Local | `localhost:5173` | `localhost:5001` | `localhost:5432` |

### Common Commands

```bash
# Deploy backend (via git push)
git push origin main

# Deploy frontend (via git push)
git push origin main

# Run migrations on production
# (via Render Shell)
npx prisma migrate deploy

# View production logs
# (via Render dashboard → Logs)

# Rollback deployment
# (via Render/Vercel dashboard → Deployments → Redeploy previous)
```

### Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)

