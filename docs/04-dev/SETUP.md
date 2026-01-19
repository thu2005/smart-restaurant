# Setup Guide - Smart Restaurant QR Ordering System

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Supabase Configuration](#supabase-configuration)
- [Seed Data](#seed-data)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
  - Recommended: Node.js 18.x or 20.x LTS version
  - Verify installation: `node --version`
  - npm comes bundled with Node.js
  
- **Package Manager**
  - **npm** (comes with Node.js) - Recommended
  - Or **yarn** as alternative: `npm install -g yarn`
  
- **Git** for version control ([Download](https://git-scm.com/))
  - Verify installation: `git --version`
  
- **Code Editor** (Recommended)
  - Visual Studio Code with extensions:
    - Prisma (for schema.prisma syntax)
    - ESLint (code quality)
    - Prettier (code formatting)
    - ES7+ React/Redux/React-Native snippets

### Required Accounts

- **Supabase Account** ([Sign up at supabase.com](https://supabase.com))
  - Free tier: 500MB database storage, 2GB bandwidth
  - Required for PostgreSQL database hosting
  
### Optional Services (for full functionality)

- **Stripe Account** ([dashboard.stripe.com](https://dashboard.stripe.com))
  - Required for credit card payments
  - Use test mode for development
  
- **Google Cloud Console Account** ([console.cloud.google.com](https://console.cloud.google.com))
  - Required for Google OAuth login
  - Free tier available
  
- **Gmail Account** (for SMTP email service)
  - Or **Resend Account** ([resend.com](https://resend.com)) - alternative email service

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:

**Core Framework:**
- `express` (4.18+) - Web server framework
- `dotenv` (16.3+) - Environment variable management

**Database & ORM:**
- `@prisma/client` (5.8+) - Prisma ORM client
- `prisma` (5.8+) - Prisma CLI (dev dependency)

**Authentication:**
- `passport` (0.7+) - Authentication middleware
- `passport-jwt` (4.0+) - JWT authentication strategy
- `passport-google-oauth20` (2.0+) - Google OAuth strategy
- `jsonwebtoken` (9.0+) - JWT token generation/verification
- `bcryptjs` (2.4+) - Password hashing

**Real-Time Communication:**
- `socket.io` (4.6+) - WebSocket server for live updates

**Security:**
- `helmet` (7.1+) - Security HTTP headers
- `cors` (2.8+) - Cross-Origin Resource Sharing

**File Handling:**
- `multer` (1.4.5+) - File upload middleware
- `qrcode` (1.5+) - QR code generation
- `pdfkit` (0.17+) - PDF generation for bills
- `archiver` (7.0+) - File compression

**Payment Gateways:**
- `stripe` (14.0+) - Stripe payment integration
- `axios` (1.13+) - HTTP client for MoMo/ZaloPay API calls

**Email Services:**
- `nodemailer` (7.0+) - SMTP email sending
- `resend` (6.7+) - Modern email API (alternative)

**Monitoring:**
- `prom-client` (15.1+) - Prometheus metrics collection

**API Documentation:**
- `swagger-jsdoc` (6.2+) - Swagger/OpenAPI documentation generator
- `swagger-ui-express` (5.0+) - Swagger UI interface

**Validation & Logging:**
- `express-validator` (7.3+) - Request validation
- `morgan` (1.10+) - HTTP request logging

**Development Tools:**
- `nodemon` (3.0+) - Auto-restart on file changes (dev only)

**Installation time:** Typically 1-3 minutes depending on internet speed.

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory by copying the example:

```bash
cp .env.example .env
```

**Edit the `.env` file and configure the following variables:**

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
# Options: development, production, test
# Affects: error messages detail, CORS, logging

PORT=5000
# Backend server port
# Default: 5000 (change if port conflict occurs)

# ============================================
# POSTGRESQL DATABASE (SUPABASE)
# ============================================
# Connection Pooling URL - Used for regular app queries
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&statement_cache_size=0"

# Direct Connection URL - Used for migrations only
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# IMPORTANT:
# - Replace [PROJECT_REF] with your Supabase project reference
# - Replace [PASSWORD] with your database password (URL-encoded if contains special chars)
# - Replace [REGION] with your region (e.g., ap-southeast-1)
# - Pooled connection (6543) for app queries
# - Direct connection (5432) for migrations

# ============================================
# JWT (JSON WEB TOKEN) CONFIGURATION
# ============================================
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
# SECURITY: Must be at least 32 characters
# Generate strong key: openssl rand -base64 32
# Never share or commit this value

JWT_EXPIRE=7d
# Token expiration duration
# Format: 7d (days), 24h (hours), 60m (minutes)
# Recommended: 7d for development, 1d for production

# ============================================
# QR CODE & FRONTEND URLS
# ============================================
QR_BASE_URL=http://localhost:5173
# Frontend URL used in QR codes for customer ordering
# Development: http://localhost:5173
# Mobile testing: http://YOUR_LOCAL_IP:5173 (e.g., http://192.168.1.100:5173)
# Production: https://your-frontend-domain.com

FRONTEND_URL=http://localhost:5173
# Comma-separated list of allowed CORS origins
# Development: http://localhost:5173
# Multiple: http://localhost:5173,http://192.168.1.100:5173
# Production: https://your-frontend-domain.com

# ============================================
# STRIPE PAYMENT GATEWAY (OPTIONAL)
# ============================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# Get from: https://dashboard.stripe.com/test/apikeys
# Use test keys (sk_test_) for development
# Use live keys (sk_live_) for production only

STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
# Get from: https://dashboard.stripe.com/test/webhooks
# Required for handling Stripe events (payment success/failure)
# Leave empty if not using webhooks

# ============================================
# MOMO E-WALLET PAYMENT (VIETNAMESE)
# ============================================
# Sandbox credentials for testing (these are public test credentials)
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:5173/customer/payment/result
MOMO_NOTIFY_URL=http://localhost:5000/api/payments/momo/callback
# Note: For production, register at https://business.momo.vn

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================
MAX_FILE_SIZE=5242880
# Maximum file size in bytes (5MB = 5242880 bytes)
# Applies to: menu item images, user avatars, restaurant logos

UPLOAD_PATH=./uploads
# Directory for uploaded files (relative to backend root)
# Ensure this folder exists or will be created automatically

# ============================================
# GOOGLE OAUTH (OPTIONAL)
# ============================================
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
# Get from: https://console.cloud.google.com/apis/credentials
# Setup:
#   1. Create OAuth 2.0 Client ID
#   2. Add authorized redirect URI: http://localhost:5000/api/auth/google/callback
#   3. Copy Client ID here

GOOGLE_CLIENT_SECRET=your_google_client_secret
# Get from same Google Cloud Console page as Client ID

# ============================================
# EMAIL SERVICE (SMTP) - GMAIL
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
# Standard Gmail SMTP settings

SMTP_USER=your_email@gmail.com
# Your Gmail address

SMTP_PASS=your_app_specific_password
# NOT your regular Gmail password!
# Generate App Password:
#   1. Go to: https://myaccount.google.com/security
#   2. Enable 2-Step Verification
#   3. Generate App Password under "App passwords"
#   4. Use the 16-character password here

# ============================================
# RESEND EMAIL SERVICE (ALTERNATIVE)
# ============================================
RESEND_API_KEY=re_your_resend_api_key
# Get from: https://resend.com/api-keys
# Modern alternative to SMTP with better deliverability
# Free tier: 100 emails/day, 3,000 emails/month

# ============================================
# MONITORING & ANALYTICS (OPTIONAL)
# ============================================
METABASE_SITE_URL=http://localhost:3000
# Metabase BI dashboard URL (if using docker-compose)

METABASE_SECRET_KEY=your_metabase_secret_key_here
# Used for embedded Metabase dashboards
# Get from: Metabase Admin Settings → Embedding

METABASE_DASHBOARD_ID=1
# Default dashboard ID to embed
```

> **Security Notes:**
> - Never commit the `.env` file to version control (it's in `.gitignore`)
> - Use strong, unique values for JWT_SECRET in production
> - Keep database credentials secure
> - Use environment-specific values (dev vs production)
> - URL-encode special characters in database passwords

> **Quick Setup for Testing:**
> If you just want to test the app quickly, you only need to configure:
> 1. `DATABASE_URL` and `DIRECT_URL` (from Supabase)
> 2. `JWT_SECRET` (any long random string)
> 3. `FRONTEND_URL` and `QR_BASE_URL` (both http://localhost:5173)
> All other services (Stripe, Google OAuth, Email) are optional.

### 4. Database Setup with Supabase

See [Supabase Configuration](#supabase-configuration) section below.

### 5. Push Database Schema

After configuring the database connection, push the Prisma schema to create all tables:

```bash
npx prisma db push
```

**What this command does:**
- Reads the schema definition from `prisma/schema.prisma`
- Creates all tables in your Supabase PostgreSQL database
- Sets up relations (foreign keys) between tables
- Creates indexes for query optimization
- Generates TypeScript types for Prisma Client
- Does NOT create migration files (use for rapid prototyping)

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database

🚀  Your database is now in sync with your Prisma schema. Done in 2.15s

✔ Generated Prisma Client to ./node_modules/@prisma/client
```

**Alternative: Using Migrations (Recommended for Production)**

For version-controlled schema changes, use migrations instead:

```bash
npx prisma migrate dev --name init
```

**What migrations do:**
- Creates a `migrations/` folder with SQL files
- Tracks schema history for team collaboration
- Allows rollback to previous versions
- Better for production environments

**Migration workflow:**
```bash
# 1. Create initial migration
npx prisma migrate dev --name init

# 2. After schema changes, create new migration
npx prisma migrate dev --name add_user_fields

# 3. Apply migrations in production
npx prisma migrate deploy

# 4. View migration status
npx prisma migrate status
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

**What this command does:**
- Generates the Prisma Client library based on your schema
- Creates TypeScript types for type-safe database queries
- Updates `node_modules/@prisma/client` with latest schema
- Must be run after every schema change

**Expected output:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

**When to run:**
- After `prisma db push` or `prisma migrate`
- After modifying `schema.prisma`
- After pulling the repository (if schema changed)
- When Prisma Client is not found errors appear

### 7. Verify Database Setup (Optional but Recommended)

Open Prisma Studio to view your database:

```bash
npx prisma studio
```

**What is Prisma Studio:**
- Visual database browser and editor
- Opens in browser at `http://localhost:5555`
- View, create, edit, and delete records
- Useful for debugging and manual testing

**Troubleshooting Database Issues:**

**Issue: `Environment variable not found: DATABASE_URL`**
```bash
# Solution: Verify .env file exists and contains DATABASE_URL
cat .env | grep DATABASE_URL
```

**Issue: `Can't reach database server`**
```bash
# Solution 1: Check Supabase project is active (not paused)
# Solution 2: Verify connection strings are correct
# Solution 3: Test connection
npx prisma db pull
```

**Issue: `P1001: Can't reach database server`**
```bash
# Possible causes:
# - Wrong host/port in DATABASE_URL
# - Supabase project paused (auto-pauses after 1 week inactivity on free tier)
# - Firewall blocking connection
# - Network connectivity issues

# Solution: Restart Supabase project from dashboard
```

**Issue: `Error: schema.prisma not found`**
```bash
# Make sure you're in the backend directory
cd backend
npx prisma generate
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:

**Core Libraries:**
- `react` (18.2+) - UI library
- `react-dom` (18.2+) - React DOM renderer
- `vite` (5.0+) - Fast build tool and dev server

**Routing & Navigation:**
- `react-router-dom` (6.20+) - Client-side routing
- `react-router-hash-link` (2.4+) - Scroll to hash links

**State Management:**
- `redux` (5.0+) - State container
- `@reduxjs/toolkit` (2.6+) - Redux with less boilerplate

**Styling:**
- `tailwindcss` (3.4+) - Utility-first CSS framework
- `@tailwindcss/forms` (0.5+) - Form styling plugin
- `@tailwindcss/typography` (0.5+) - Typography plugin
- `autoprefixer` (10.4+) - CSS vendor prefixing
- `postcss` (8.4+) - CSS processor
- `tailwindcss-animate` (1.0+) - Animation utilities
- `clsx` (2.1+) - Conditional className utility
- `tailwind-merge` (3.3+) - Merge Tailwind classes

**UI Components:**
- `@radix-ui/react-slot` (1.2+) - Component composition
- `lucide-react` (0.484+) - Icon library
- `framer-motion` (10.16+) - Animation library
- `sonner` (2.0+) - Toast notifications
- `class-variance-authority` (0.7+) - Component variants

**HTTP & API:**
- `axios` (1.8+) - HTTP client for API requests
- `socket.io-client` (4.8+) - WebSocket client for real-time

**Internationalization:**
- `i18next` (25.7+) - i18n framework
- `react-i18next` (16.5+) - React bindings for i18n

**Forms & Validation:**
- `react-hook-form` (7.55+) - Form management
- Lightweight, performant form handling

**Data Visualization:**
- `recharts` (2.15+) - Chart library
- `d3` (7.9+) - Data visualization primitives

**Utilities:**
- `date-fns` (4.1+) - Date utility library
- `fuse.js` (7.1+) - Fuzzy search
- `react-helmet` (6.1+) - Document head manager

**Payment Integration:**
- `@stripe/react-stripe-js` (5.4+) - Stripe React components
- `@stripe/stripe-js` (8.6+) - Stripe.js loader

**Development Tools:**
- `@vitejs/plugin-react` (4.3+) - Vite React plugin
- `vite-tsconfig-paths` (3.6+) - TypeScript path mapping

**Installation time:** Typically 2-4 minutes depending on internet speed.

### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Copy from example (if exists) or create new
cp .env.example .env
# Or create manually
```

**Edit the `.env` file:**

```bash
# ============================================
# API CONFIGURATION
# ============================================
# Backend API base URL - must include /api suffix
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api

# IMPORTANT NOTES:
# - Both variables should have same value (historical reasons for duplication)
# - Must end with /api to match backend route prefix
# - Must start with VITE_ prefix (Vite requirement for exposure to client)

# ============================================
# DEVELOPMENT SCENARIOS
# ============================================

# 1. Local Development (Computer Only)
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api

# 2. Mobile Testing (Same WiFi Network)
# Replace YOUR_LOCAL_IP with your computer's IP address
# Windows: Run 'ipconfig' and find IPv4 Address
# Mac/Linux: Run 'ifconfig' or 'ip addr'
# Example: 192.168.1.100
VITE_API_BASE_URL=http://192.168.1.100:5000/api
VITE_API_URL=http://192.168.1.100:5000/api

# 3. Production (Deployed Backend)
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_API_URL=https://your-backend-domain.com/api

# ============================================
# STRIPE PAYMENT (OPTIONAL)
# ============================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
# Get from: https://dashboard.stripe.com/test/apikeys
# Use test key (pk_test_) for development
# Use live key (pk_live_) for production
# Required only if using Stripe payment method
```

> **Important for Mobile Testing:**
> 
> To test the app on your mobile device (scan QR codes, place orders):
> 
> 1. **Find your computer's local IP:**
>    - Windows: Open Command Prompt → `ipconfig` → Look for "IPv4 Address"
>    - Mac: System Preferences → Network → Look for IP address
>    - Linux: Terminal → `ip addr` or `hostname -I`
> 
> 2. **Update BOTH backend and frontend .env files:**
>    ```bash
>    # Backend .env
>    FRONTEND_URL=http://192.168.1.100:5173
>    QR_BASE_URL=http://192.168.1.100:5173
>    
>    # Frontend .env
>    VITE_API_BASE_URL=http://192.168.1.100:5000/api
>    VITE_API_URL=http://192.168.1.100:5000/api
>    ```
> 
> 3. **Ensure:**
>    - Both devices on same WiFi network
>    - Firewall allows connections (temporarily disable to test)
>    - Backend and frontend servers are running
> 
> 4. **Access on mobile:**
>    - Open browser: `http://192.168.1.100:5173`
>    - Or scan QR code from Admin → Tables page

> **Environment Variable Prefix:**
> 
> Vite requires environment variables to start with `VITE_` to be exposed to client-side code. Without this prefix, variables won't be accessible in the browser.

### 4. Understanding Frontend Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base components (Button, Card, Input)
│   │   ├── layout/          # Layout components (Header, Sidebar, Footer)
│   │   ├── ErrorBoundary.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ScrollToTop.jsx
│   │
│   ├── contexts/            # React Context providers
│   │   ├── CartContext.jsx       # Shopping cart state
│   │   ├── CustomerAuthContext.jsx  # Customer authentication
│   │   ├── LanguageContext.jsx   # i18n language switching
│   │   ├── CurrencyContext.jsx   # Currency formatting
│   │   └── ThemeContext.jsx      # Theme (light/dark)
│   │
│   ├── pages/               # Page components organized by role
│   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── dashboard/
│   │   │   ├── menu/        # Categories, items, modifiers
│   │   │   ├── tables/
│   │   │   ├── orders/
│   │   │   ├── users/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── waiter/          # Waiter dashboard
│   │   │   └── index.jsx    # Order management
│   │   │
│   │   ├── kitchen/         # Kitchen display
│   │   │   └── dashboard/
│   │   │
│   │   ├── customer/        # Customer-facing pages
│   │   │   ├── Onboarding.jsx
│   │   │   ├── QREntry.jsx
│   │   │   ├── menu-browse/
│   │   │   ├── shopping-cart/
│   │   │   ├── order-status-tracking/
│   │   │   ├── payment/
│   │   │   └── profile/
│   │   │
│   │   └── auth/            # Authentication pages
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       └── VerifyEmail.jsx
│   │
│   ├── layouts/             # Page layout templates
│   │   ├── AdminLayout.jsx       # Admin dashboard layout
│   │   ├── CustomerLayout.jsx    # Customer pages layout
│   │   ├── KitchenLayout.jsx     # Kitchen display layout
│   │   └── SuperAdminLayout.jsx  # Super admin layout
│   │
│   ├── services/            # API service modules
│   │   ├── api.js           # Axios instance with interceptors
│   │   ├── authService.js   # Authentication APIs
│   │   ├── menuService.js   # Menu management APIs
│   │   ├── orderService.js  # Order management APIs
│   │   ├── tableService.js  # Table management APIs
│   │   ├── paymentService.js
│   │   ├── reportService.js
│   │   └── ...
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   └── validators.js
│   │
│   ├── styles/              # Global styles
│   │   └── index.css        # Tailwind directives
│   │
│   ├── App.jsx              # Root component
│   ├── Routes.jsx           # Route configuration
│   └── index.jsx            # Entry point
│
├── public/                  # Static assets
│   ├── favicon.ico
│   └── images/
│
├── index.html               # HTML template
├── vite.config.mjs          # Vite configuration
├── tailwind.config.cjs      # Tailwind CSS config
├── postcss.config.cjs       # PostCSS config
├── jsconfig.json            # JavaScript config (path aliases)
├── .env                     # Environment variables (create this)
├── .env.example             # Environment template
└── package.json             # Dependencies
```

**Key Configuration Files:**

**vite.config.mjs** - Vite build configuration:
- React plugin setup
- Path aliases (`@/` → `./src/`)
- Dev server settings (host, port, open)
- Build output settings

**tailwind.config.cjs** - Tailwind CSS configuration:
- Content paths for purging unused CSS
- Theme customization (colors, fonts)
- Plugins (forms, typography, animations)

**jsconfig.json** - JavaScript configuration:
- Path alias resolution
- IDE autocomplete support

---

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Project Name**: smart-restaurant (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to you (e.g., Southeast Asia)
4. Click "Create new project" and wait for provisioning (~2 minutes)

### 2. Get Database Connection Strings

Once your project is ready:

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Copy the following:

**Connection Pooling (for DATABASE_URL):**
- Mode: Transaction
- Copy the connection string
- It will look like: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
- Add query parameters: `?pgbouncer=true&statement_cache_size=0`

**Direct Connection (for DIRECT_URL):**
- Mode: Session
- Copy the connection string
- It will look like: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

3. Replace `[PASSWORD]` with your actual database password (URL-encoded)
4. Paste these into your `backend/.env` file

### 3. Enable Required Extensions (Optional)

In Supabase Dashboard:
1. Go to **Database** → **Extensions**
2. Enable the following if needed:
   - `pg_stat_statements` (performance monitoring)
   - `uuid-ossp` (UUID generation)

---

## Seed Data

After setting up the database, populate it with sample data for testing and development:

### 1. Run Seed Script

```bash
cd backend
npm run seed
```

Or run directly:

```bash
node prisma/seed.js
```

**What the seed script does:**
1. **Clears existing data** (⚠️ Deletes all current records)
2. **Creates restaurant** with full details
3. **Creates users** with hashed passwords
4. **Creates tables** with QR codes
5. **Creates menu structure** (categories → items → modifiers)
6. **Creates sample orders** for testing

**Seed execution time:** Typically 10-30 seconds depending on data volume.

### 2. What Gets Created

#### Restaurant
- **Name:** Café Poirot
- **Type:** Vietnamese-French Fusion
- **Address:** 123 Nguyen Hue, District 1, Ho Chi Minh City
- **Opening Hours:** 8:00 AM - 10:00 PM (weekdays), extended on weekends

#### Users & Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `superadmin@system.com` | `password123` | System-wide access, manage all restaurants |
| **Admin** | `admin@cafepoirot.com` | `password123` | Full restaurant management, reports, settings |
| **Waiter** | `waiter@cafepoirot.com` | `password123` | Order management, table assignment |
| **Kitchen Staff** | `chef@cafepoirot.com` | `password123` | Order preparation, status updates |
| **Customer 1** | `customer1@gmail.com` | `password123` | Browse menu, place orders, reviews |
| **Customer 2** | `customer2@gmail.com` | `password123` | Browse menu, place orders, reviews |

#### Tables (15 tables)

| Table ID | Capacity | Location | QR Code | Status |
|----------|----------|----------|---------|--------|
| T01-T05 | 2 people | Window Side | ✅ Generated | Available |
| T06-T10 | 4 people | Main Hall | ✅ Generated | Available |
| T11-T13 | 6 people | Garden Area | ✅ Generated | Available |
| T14-T15 | 8 people | Private Room | ✅ Generated | Available |

**QR Code Access:**
- Each table has unique QR code data
- Format: `{restaurantId}/{tableId}`
- Access via Admin → Tables to view/download QR codes

#### Menu Structure

**6 Categories:**
1. **Appetizers** - Starters and small plates
2. **Soups & Salads** - Fresh and healthy options
3. **Main Courses** - Rice, noodles, and signature dishes
4. **Seafood** - Fresh seafood specialties
5. **Beverages** - Hot and cold drinks
6. **Desserts** - Sweet endings

**20+ Menu Items** including:
- Vietnamese Classics: Phở, Bánh Mì, Gỏi Cuốn
- Fusion Dishes: French-Vietnamese combinations
- Beverages: Coffee, Tea, Smoothies, Cocktails
- Desserts: Chè, Tiramisu, Panna Cotta

**Each menu item has:**
- Name (English & Vietnamese)
- Description
- Price (in VND)
- Image URL
- Availability status
- Nutritional information (calories, allergens)
- Preparation time estimate

**Modifier Groups** (Customizations):

1. **Spiciness Level**
   - Not Spicy (Free)
   - Mild (+0 VND)
   - Medium (+0 VND)
   - Hot (+0 VND)
   - Extra Hot (+5,000 VND)

2. **Add Sides**
   - Extra Rice (+10,000 VND)
   - Spring Rolls (+15,000 VND)
   - Fried Egg (+8,000 VND)
   - Extra Vegetables (+8,000 VND)

3. **Drink Size**
   - Small (Free)
   - Medium (+10,000 VND)
   - Large (+20,000 VND)

4. **Coffee Customization**
   - Black Coffee (Free)
   - With Milk (+5,000 VND)
   - Extra Shot (+10,000 VND)
   - Ice/Hot (Free)

#### Sample Orders (For Testing)

The seed creates 3-5 sample orders in different states:
- **SUBMITTED:** Waiting for waiter to accept
- **RECEIVED:** Accepted by waiter, sent to kitchen
- **PREPARING:** Being prepared in kitchen
- **READY:** Ready for serving
- **SERVED:** Delivered to customer
- **COMPLETED:** Customer finished, bill generated
- **CANCELLED:** Cancelled orders

**Order details include:**
- Order items with quantities
- Customizations/modifiers selected
- Order timestamps
- Staff assignments
- Payment status

### 3. Verify Seed Success

Check if seed was successful:

**Option 1: Prisma Studio**
```bash
npx prisma studio
```
Open http://localhost:5555 and browse tables

**Option 2: Check via API** (after starting backend)
```bash
# Get restaurant
curl http://localhost:5000/api/restaurants

# Get menu items
curl http://localhost:5000/api/menu/{restaurantId}/items
```

**Option 3: Login to Admin Dashboard**
```
URL: http://localhost:5173/admin/login
Email: admin@cafepoirot.com
Password: password123
```

### 4. Re-seeding (Reset Data)

If you need to reset and re-seed:

```bash
# Option 1: Run seed again (clears old data automatically)
npm run seed

# Option 2: Reset database completely
npx prisma migrate reset
# This will: 
# 1. Drop database
# 2. Create database
# 3. Run migrations
# 4. Run seed automatically
```

> **⚠️ Important Notes:**
> - All passwords are `password123` by default
> - **Change these passwords before production deployment!**
> - Seed script deletes all existing data
> - In production, use proper user registration instead of seeding
> - Sample orders are for testing reports and analytics

### 5. Customizing Seed Data

To modify seed data, edit `backend/prisma/seed.js`:

```javascript
// Example: Add more menu items
const menuItems = await prisma.menuItem.createMany({
  data: [
    {
      name: "Your Custom Dish",
      price: 150000,
      // ... other fields
    }
  ]
});

// Example: Add more users
const user = await prisma.user.create({
  data: {
    email: "youruser@example.com",
    password: await bcrypt.hash("password123", 10),
    // ... other fields
  }
});
```

After editing, run:
```bash
npm run seed
```

---

## Running the Application

### Development Mode (Recommended)

Run both backend and frontend servers simultaneously for full functionality.

### 1. Start Backend Server

Open a terminal in the backend directory:

```bash
cd backend
npm run dev
```

**What happens:**
- **Nodemon** watches for file changes and auto-restarts
- Server starts on `http://localhost:5000` (or configured PORT)
- Swagger API docs available at `http://localhost:5000/api-docs`
- Prometheus metrics at `http://localhost:5000/metrics`
- WebSocket server starts for real-time communication

**Expected console output:**
```
🌍 Environment: development
📦 Loading environment variables...
✅ Database connected successfully
🚀 Server running on port 5000 in development mode
📑 Swagger Docs available at http://localhost:5000/api-docs
🔌 Socket.IO server initialized
```

**Available API endpoints:**
- `GET /` - API status and version
- `GET /api-docs` - Swagger UI documentation
- `GET /metrics` - Prometheus metrics
- `POST /api/auth/*` - Authentication endpoints
- `GET /api/menu/*` - Menu management
- `GET /api/orders/*` - Order management
- `GET /api/tables/*` - Table management
- `POST /api/payments/*` - Payment processing

**Alternative: Production Mode**
```bash
npm start
# Uses node instead of nodemon (no auto-restart)
# Better performance, but requires manual restart on changes
```

**Logs to monitor:**
- Request logs: Method, URL, status code, response time
- Database queries: Prisma query logs (if enabled)
- Socket connections: Client connect/disconnect events
- Errors: Stack traces in development mode

### 2. Start Frontend Development Server

Open a **new terminal** window (keep backend running):

```bash
cd frontend
npm run dev
```

**What happens:**
- **Vite dev server** starts with hot module replacement (HMR)
- Frontend available at `http://localhost:5173`
- Also accessible via network IP for mobile testing
- Fast refresh on file changes (instant updates)
- Opens default browser automatically

**Expected console output:**
```
VITE v5.0.0  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h to show help
```

**Vite features:**
- ⚡ Lightning fast HMR (< 100ms updates)
- 📦 Optimized dependency pre-bundling
- 🔧 Built-in TypeScript support
- 🎨 CSS preprocessing (PostCSS, Tailwind)

**Alternative commands:**
```bash
# Build for production
npm run build
# Output: dist/ folder with optimized static files

# Preview production build
npm run preview
# Serves the dist/ folder to test production build locally
```

### 3. Access the Application

#### For Staff (Admin, Waiter, Kitchen)

**Admin Dashboard:**
```
URL: http://localhost:5173/admin/login
Email: admin@cafepoirot.com
Password: password123
```

**Features available:**
- 📊 Dashboard with statistics
- 🍽️ Menu Management (Categories, Items, Modifiers)
- 🪑 Table Management (Create, Edit, QR codes)
- 📦 Order Management (View, Update status)
- 👥 User Management (Staff accounts)
- 📈 Reports & Analytics
- ⚙️ Settings

**Waiter Dashboard:**
```
URL: http://localhost:5173/waiter/login
Email: waiter@cafepoirot.com
Password: password123
```

**Features available:**
- 📋 Active orders list
- ✅ Accept new orders
- 🔄 Update order status
- 📄 Generate bills
- 🔔 Real-time notifications

**Kitchen Display:**
```
URL: http://localhost:5173/kitchen/login
Email: chef@cafepoirot.com
Password: password123
```

**Features available:**
- 👨‍🍳 Order queue display
- ⏱️ Preparation timers
- ✅ Mark items as ready
- 🔄 Update cooking status
- 🔔 Real-time order updates

#### For Customers

**Method 1: QR Code (Recommended)**

1. Login as admin: `http://localhost:5173/admin/login`
2. Navigate to **Tables** page
3. Find any table (e.g., T01)
4. Click "View QR Code" or "Download QR"
5. Scan with mobile camera or QR scanner app
6. Opens customer ordering interface

**QR Code URL format:**
```
http://localhost:5173/qr/{restaurantId}/{tableId}
```

**Method 2: Direct URL**

```
http://localhost:5173/qr/{restaurantId}/{tableId}
```

Replace `{restaurantId}` and `{tableId}` with actual IDs from database.

**Method 3: Customer Registration**

```
URL: http://localhost:5173/register
```
New customers can create accounts.

**Customer Features:**
- 🍽️ Browse menu by category
- 🔍 Search and filter items
- 🛒 Add to cart with modifiers
- 🌐 Switch language (EN/VI)
- 📦 Track order status
- 💳 Pay via Stripe/MoMo
- ⭐ Leave reviews

### 4. API Documentation (Swagger)

Access interactive API documentation:

```
URL: http://localhost:5000/api-docs
```

**Swagger UI features:**
- 📖 Complete API reference
- 🧪 Try out endpoints directly
- 🔑 JWT authentication testing
- 📝 Request/response examples
- 📊 Schema definitions

**Testing with Swagger:**
1. Expand any endpoint
2. Click "Try it out"
3. Fill in parameters
4. Click "Execute"
5. View response

**Authenticating in Swagger:**
1. Login via `/api/auth/login` endpoint
2. Copy the JWT token from response
3. Click "Authorize" button (top right)
4. Paste token: `Bearer {your-token}`
5. Now you can test protected endpoints

### 5. Development Workflow

**Typical development flow:**

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Leave running...

# Terminal 2: Frontend  
cd frontend
npm run dev
# Leave running...

# Terminal 3: Database (optional)
cd backend
npx prisma studio
# Visual database editor at localhost:5555
```

**File watching:**
- Backend: Nodemon auto-restarts on `.js` file changes
- Frontend: Vite hot-reloads on any file change (React, CSS, etc.)
- Database: Re-run `npx prisma generate` after schema changes

**Common development tasks:**

```bash
# View real-time logs
# Just watch the terminals - all logs stream automatically

# Test API endpoint
curl http://localhost:5000/api/restaurants

# Check database
npx prisma studio

# View all routes
# Backend: Check server.js for app.use() statements
# Frontend: Check Routes.jsx
```

### 6. Testing Real-Time Features

**Order flow testing:**

1. **Customer side** (Mobile/Browser):
   - Scan QR → Browse menu → Add items → Submit order

2. **Waiter dashboard** (Browser):
   - Receives instant notification
   - Can see new order in list
   - Accepts order

3. **Kitchen display** (Browser):
   - Receives order automatically
   - Updates preparation status
   - Marks items ready

4. **Customer sees real-time updates**:
   - Order accepted notification
   - Preparing status
   - Ready notification

**Watch Socket.IO events in browser console:**
```javascript
// Open browser DevTools → Console
// You'll see WebSocket events:
Socket connected: abc123xyz
Joined restaurant: restaurant-uuid-here
New order received: { orderId: "...", ... }
```

### 7. Stopping the Servers

**Backend:**
```bash
# Press Ctrl + C in backend terminal
# Graceful shutdown will:
# - Close database connections
# - Close server
# - Exit process

🛑 Shutting down gracefully...
✅ Server closed
```

**Frontend:**
```bash
# Press Ctrl + C in frontend terminal
# Vite dev server stops immediately
```

### 8. Production Build

When ready to deploy:

**Backend:**
```bash
# No build needed - Node.js runs directly
# Just ensure NODE_ENV=production in .env
```

**Frontend:**
```bash
cd frontend
npm run build

# Output: dist/ folder
# Contains optimized static files:
# - Minified JavaScript
# - Optimized CSS
# - Compressed assets
# - Source maps (for debugging)

# Deploy dist/ folder to:
# - Vercel (recommended)
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting
```

**Preview production build locally:**
```bash
npm run preview
# Serves production build at http://localhost:4173
```

---

## Troubleshooting

### Backend Issues

#### ❌ Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

**Option 1: Change port in .env**
```bash
# Edit backend/.env
PORT=5001
```

**Option 2: Kill process using port (Windows)**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Option 3: Kill process (Mac/Linux)**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

#### ❌ Database Connection Failed

**Error:**
```
Error: P1001: Can't reach database server
```

**Possible Causes & Solutions:**

**1. Supabase Project Paused**
```bash
# Solution:
# - Login to supabase.com
# - Go to your project
# - Click "Restore project" if paused
# - Free tier projects pause after 1 week of inactivity
```

**2. Wrong Connection String**
```bash
# Verify DATABASE_URL in .env
# Should match pattern:
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&statement_cache_size=0

# Check:
# - Project reference is correct
# - Password is URL-encoded
# - Region matches your project
# - Port is 6543 (pooler) or 5432 (direct)
```

**3. Network/Firewall Issues**
```bash
# Test connection
npx prisma db pull

# If fails, check:
# - Internet connection
# - Corporate firewall/VPN
# - Antivirus blocking connections
```

**4. IP Not Whitelisted**
```bash
# Supabase allows all IPs by default
# If using custom settings:
# - Go to Supabase → Settings → Database → Connection pooling
# - Check IP restrictions
```

#### ❌ Prisma Client Not Generated

**Error:**
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd backend
npx prisma generate
```

**Permanent fix:**
```bash
# Add to backend/package.json scripts:
"postinstall": "prisma generate"

# Now npm install will auto-generate Prisma Client
```

#### ❌ Migration Errors

**Error:**
```
Error: Migration failed to apply
```

**Solutions:**

**Option 1: Reset database (Development Only)**
```bash
# ⚠️ WARNING: Deletes all data
npx prisma migrate reset

# Follow prompts:
# 1. Confirms deletion
# 2. Re-runs all migrations
# 3. Runs seed automatically
```

**Option 2: Use db push instead**
```bash
# Skip migrations, just sync schema
npx prisma db push

# When to use:
# - Rapid prototyping
# - Development only
# - Schema changes are experimental
```

**Option 3: Fix migration manually**
```bash
# 1. Check migration status
npx prisma migrate status

# 2. Mark failed migration as rolled back
npx prisma migrate resolve --rolled-back "MIGRATION_NAME"

# 3. Try again
npx prisma migrate dev
```

#### ❌ Environment Variables Not Loaded

**Error:**
```
Error: process.env.JWT_SECRET is undefined
```

**Solutions:**

**1. Check .env file exists**
```bash
cd backend
ls -la .env
# or Windows:
dir .env
```

**2. Verify dotenv is loaded in server.js**
```javascript
// Should be at top of server.js
require('dotenv').config();
```

**3. Check variable names**
```bash
# Variables must match exactly (case-sensitive)
JWT_SECRET=abc123  # ✅ Correct
jwt_secret=abc123  # ❌ Wrong
```

**4. Restart server after .env changes**
```bash
# Nodemon should auto-restart
# If not, manually restart:
# Ctrl + C, then npm run dev
```

#### ❌ CORS Errors

**Error (in browser console):**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

**1. Check FRONTEND_URL in backend/.env**
```bash
# Must match frontend URL exactly
FRONTEND_URL=http://localhost:5173

# For multiple origins:
FRONTEND_URL=http://localhost:5173,http://192.168.1.100:5173
```

**2. Verify CORS middleware in server.js**
```javascript
// Should have:
app.use(cors({
  origin: true, // Allow all origins (dev)
  // OR
  origin: process.env.FRONTEND_URL.split(','),
  credentials: true
}));
```

**3. Check request headers**
```javascript
// In frontend/src/services/api.js
// Should have:
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

#### ❌ File Upload Errors

**Error:**
```
Error: ENOENT: no such file or directory, open 'uploads/...'
```

**Solutions:**

**1. Create uploads directory**
```bash
cd backend
mkdir -p uploads/avatars uploads/logos
```

**2. Check file permissions**
```bash
# Linux/Mac:
chmod 755 uploads

# Windows: Ensure folder isn't read-only
```

**3. Verify multer configuration**
```javascript
// Check middleware has correct path
dest: process.env.UPLOAD_PATH || './uploads'
```

#### ❌ JWT Token Errors

**Error:**
```
Error: jwt malformed
Error: invalid signature
```

**Solutions:**

**1. Check JWT_SECRET matches everywhere**
```bash
# Same secret for signing and verifying
# Never change JWT_SECRET in production (invalidates all tokens)
```

**2. Token format**
```bash
# Should be: Bearer {token}
# NOT just: {token}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**3. Clear old tokens**
```javascript
// In browser console:
localStorage.clear();
// Then login again
```

#### ❌ Socket.IO Connection Failed

**Error (browser console):**
```
WebSocket connection failed
```

**Solutions:**

**1. Check backend server is running**
```bash
# Backend must be running for WebSocket
curl http://localhost:5000
```

**2. Verify Socket.IO CORS**
```javascript
// In server.js
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL.split(','),
    credentials: true
  }
});
```

**3. Check firewall**
```bash
# Ensure ports not blocked
# Default: 5000 (HTTP + WebSocket)
```

### Frontend Issues

#### ❌ Port Already in Use

**Error:**
```
Port 5173 is in use, trying another port...
```

**Solution:**
Vite automatically uses next available port (5174, 5175, etc.)

**Or specify port in vite.config.mjs:**
```javascript
server: {
  port: 3000,
  strictPort: true, // Fail if port taken
}
```

#### ❌ API Calls Failing

**Error (browser console):**
```
Failed to fetch
Network Error
```

**Solutions:**

**1. Check VITE_API_BASE_URL**
```bash
# In frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api

# Must start with VITE_ prefix
# Must include /api suffix
```

**2. Verify backend is running**
```bash
# Test backend:
curl http://localhost:5000/api/restaurants

# Or open in browser:
http://localhost:5000
```

**3. Check network tab in DevTools**
```
F12 → Network → Find failed request
- Status code (404, 500, etc.)
- Response body
- Request headers
```

**4. CORS issues**
See Backend CORS Errors section above

#### ❌ Images Not Loading

**Error:**
```
GET http://localhost:5000/uploads/image.jpg 404
```

**Solutions:**

**1. Check uploads folder exists**
```bash
cd backend
ls -la uploads/
```

**2. Verify static file serving**
```javascript
// In backend/server.js
app.use('/uploads', express.static('uploads'));
```

**3. Check image paths in database**
```bash
# Should be relative paths:
/uploads/avatars/user.jpg  # ✅ Correct
uploads/avatars/user.jpg   # ❌ Missing leading /
```

**4. CORS headers for images**
```javascript
// In server.js
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static('uploads'));
```

#### ❌ React Router Not Working

**Error:**
```
Cannot GET /admin/dashboard
(after page refresh)
```

**Solution:**

**In vite.config.mjs (Development):**
Already configured - Vite handles this automatically

**In Production (Vercel):**
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**In Production (Netlify):**
```bash
# Create public/_redirects
/*    /index.html   200
```

#### ❌ Environment Variables Undefined

**Error:**
```
Cannot read property 'VITE_API_BASE_URL' of undefined
```

**Solutions:**

**1. Restart dev server after .env changes**
```bash
# Ctrl + C
npm run dev
```

**2. Check variable prefix**
```bash
# Must start with VITE_
VITE_API_BASE_URL=...  # ✅ Works
API_BASE_URL=...       # ❌ Not exposed to client
```

**3. Check import.meta.env syntax**
```javascript
// Correct:
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Wrong:
const apiUrl = process.env.VITE_API_BASE_URL; // Node.js only
```

#### ❌ Tailwind Styles Not Applied

**Error:**
Styles not showing, or only basic HTML styling

**Solutions:**

**1. Check tailwind.config.cjs content paths**
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

**2. Verify postcss.config.cjs**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**3. Check index.css has Tailwind directives**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**4. Clear cache and rebuild**
```bash
rm -rf node_modules/.vite
npm run dev
```

### Supabase Issues

#### ❌ Too Many Connections

**Error:**
```
Error: P1001: Too many connections
```

**Solutions:**

**1. Use connection pooling**
```bash
# In .env, use pooler port 6543
DATABASE_URL="...pooler.supabase.com:6543..."
```

**2. Check Prisma connection**
```javascript
// Use singleton pattern (already implemented)
// Don't create multiple PrismaClient instances
```

**3. Upgrade Supabase plan**
```
Free tier: 60 connections
Pro tier: 200+ connections
```

#### ❌ Slow Queries

**Error:**
Queries taking > 1 second

**Solutions:**

**1. Add indexes**
```prisma
// In schema.prisma
@@index([restaurantId])
@@index([email])
@@index([createdAt])
```

**2. Use select to limit fields**
```javascript
// Don't fetch everything:
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    fullName: true
  }
});
```

**3. Enable Prisma query logging**
```javascript
// In database.js
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

**4. Check in Supabase Dashboard**
```
Supabase → Database → Query Performance
- View slow queries
- Analyze execution plans
```

### Mobile Testing Issues

#### ❌ Cannot Access from Mobile

**Error:**
Mobile device can't open `http://localhost:5173`

**Solutions:**

**1. Use local IP instead of localhost**
```bash
# Find your IP:
# Windows:
ipconfig
# Look for IPv4 Address: 192.168.x.x

# Mac/Linux:
ifconfig
# or
hostname -I

# Update both .env files:
# backend/.env
FRONTEND_URL=http://192.168.1.100:5173

# frontend/.env  
VITE_API_BASE_URL=http://192.168.1.100:5000/api
```

**2. Ensure same WiFi network**
```
Both devices must be on same network
- Same WiFi name
- Not using VPN
- Not using mobile data
```

**3. Disable firewall temporarily**
```bash
# Windows: Control Panel → Firewall → Turn off temporarily
# Mac: System Preferences → Security → Firewall → Off
# Test, then re-enable firewall
```

**4. Check Vite server.host setting**
```javascript
// vite.config.mjs
server: {
  host: true, // ✅ Listen on all interfaces
  // OR
  host: '0.0.0.0', // ✅ Same thing
}
```

**5. Verify backend listens on all interfaces**
```javascript
// server.js
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### ❌ QR Code Not Working

**Error:**
Scan QR but nothing happens

**Solutions:**

**1. Check QR_BASE_URL**
```bash
# Must point to accessible frontend URL
QR_BASE_URL=http://192.168.1.100:5173  # Mobile testing
QR_BASE_URL=https://your-domain.com    # Production
```

**2. Regenerate QR codes after URL change**
```bash
# After changing QR_BASE_URL:
# Login to Admin → Tables → Regenerate all QR codes
```

**3. Test QR URL manually**
```bash
# Decode QR code data, should be:
http://your-frontend/qr/{restaurantId}/{tableId}

# Try opening URL directly in mobile browser
```

### Performance Issues

#### ❌ Slow Backend Response

**Solutions:**

**1. Enable request logging to find bottlenecks**
```javascript
// Already enabled via Morgan in server.js
// Check console for slow endpoints
```

**2. Optimize database queries**
```javascript
// Use include carefully:
const orders = await prisma.order.findMany({
  where: { restaurantId },
  include: {
    orderItems: {
      include: {
        menuItem: true // Only if needed
      }
    }
  }
});
```

**3. Add caching (Future improvement)**
```javascript
// Consider Redis for:
// - Menu items (change infrequently)
// - Restaurant info
// - User sessions
```

#### ❌ Slow Frontend Load

**Solutions:**

**1. Check bundle size**
```bash
npm run build
# Check dist/ folder size
# Should be < 1MB for optimal performance
```

**2. Code splitting**
```javascript
// Already implemented via React Router
// Each page loads separately
```

**3. Image optimization**
```bash
# Compress images before uploading
# Use WebP format
# Lazy load images
```

### Development Tips

**Clear everything and start fresh:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev

# Frontend
cd frontend
rm -rf node_modules package-lock.json .vite
npm install
npm run dev
```

**Check what's using ports:**
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Mac/Linux  
lsof -i :5000
lsof -i :5173
```

**View all environment variables:**
```bash
# Backend
cd backend
node -e "require('dotenv').config(); console.log(process.env)"

# Frontend (browser console)
console.log(import.meta.env)
```

---

## Next Steps

After successful setup:

1. **Explore the Admin Dashboard** - Create categories, menu items, tables
2. **Test Customer Flow** - Scan QR code → Order → Track status
3. **Test Waiter Flow** - Accept orders → Update status → Generate bills
4. **Test Kitchen Flow** - View orders → Update preparation status

For detailed API documentation, see [APIs.md](../02-api/APIs.md)

For database schema details, see [DATABASE_STRUCTURE.md](../03-architecture/DATABASE_STRUCTURE.md)

For system architecture, see [ARCHITECTURE.md](../03-architecture/ARCHITECTURE.md)
