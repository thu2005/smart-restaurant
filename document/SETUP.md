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

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase Account** ([Sign up at supabase.com](https://supabase.com))

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
- Express.js (web framework)
- Prisma (ORM for database)
- Passport.js (authentication)
- Socket.IO (real-time communication)
- JWT (JSON Web Tokens)
- And other dependencies

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory by copying the example:

```bash
cp .env.example .env
```

**Edit the `.env` file and configure the following variables:**

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# PostgreSQL Configuration (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&statement_cache_size=0"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d

# QR Code Base URL (Frontend URL for customer ordering)
QR_BASE_URL=http://localhost:5173/api

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Stripe (Payment Gateway) - Optional
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# Resend API (Alternative email service)
RESEND_API_KEY=re_your_resend_api_key
```

> **Security Note**: Never commit the `.env` file to version control. It contains sensitive credentials.

### 4. Database Setup with Supabase

See [Supabase Configuration](#supabase-configuration) section below.

### 5. Push Database Schema

After configuring the database connection, push the Prisma schema to create all tables:

```bash
npx prisma db push
```

This command will:
- Read `prisma/schema.prisma`
- Create all tables, relations, indexes in your Supabase PostgreSQL database
- Generate Prisma Client

Alternatively, you can use migrations:

```bash
npx prisma migrate dev --name init
```

### 6. Generate Prisma Client

```bash
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

This will install:
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- React Router DOM (routing)
- Axios (HTTP client)
- i18next (internationalization)
- Socket.IO Client
- Redux Toolkit (state management)
- And other UI libraries

### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Copy the existing .env or create new
```

**Edit the `.env` file:**

```bash
# API Configuration
# For local development, use localhost or your computer's local IP
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api

# For production, use your deployed backend URL
# VITE_API_URL=https://your-backend-domain.com/api
# VITE_API_BASE_URL=https://your-backend-domain.com/api
```

> **Note for Mobile Testing**: If you want to test on your mobile device using QR codes, replace `localhost` with your computer's local IP address (e.g., `192.168.1.100`). Both frontend and backend `.env` files should use the same IP.

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

After setting up the database, populate it with sample data:

### 1. Run Seed Script

```bash
cd backend
npm run seed
```

Or directly:

```bash
node prisma/seed.js
```

### What Gets Created:

**Restaurant:**
- 1 restaurant: "Café Poirot"

**Users:**
- 1 Super Admin: `superadmin@system.com` / `password123`
- 1 Admin: `admin@cafepoirot.com` / `password123`
- 1 Waiter: `waiter@cafepoirot.com` / `password123`
- 1 Kitchen Staff: `chef@cafepoirot.com` / `password123`
- 2 Customers: `customer1@gmail.com`, `customer2@gmail.com` / `password123`

**Tables:**
- 15 tables (T01 to T15) with varying capacities and locations

**Menu:**
- 6 categories (Appetizers, Soups & Salads, Main Courses, Seafood, Beverages, Desserts)
- 15+ menu items with images, nutritional info, modifiers
- Modifier groups (Spiciness Level, Add Sides, Size)

**Sample Orders:**
- Several completed orders with different statuses
- Order history for testing reports

> **Security Note**: Change all default passwords before deploying to production!

---

## Running the Application

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:5000`

You should see:
```
🚀 Server running on port 5000 in development mode
📑 Swagger Docs available at http://localhost:5000/api-docs
```

### 2. Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:5173`

You should see:
```
VITE v5.0.0  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### 3. Access the Application

**Admin Dashboard:**
- URL: `http://localhost:5173/admin/login`
- Email: `admin@cafepoirot.com`
- Password: `password123`

**Waiter Dashboard:**
- URL: `http://localhost:5173/waiter/login`
- Email: `waiter@cafepoirot.com`
- Password: `password123`

**Kitchen Dashboard:**
- URL: `http://localhost:5173/kitchen/login`
- Email: `chef@cafepoirot.com`
- Password: `password123`

**Customer Ordering:**
- Generate QR code from Admin → Tables
- Scan QR code or click the link
- Browse menu and place order

### 4. API Documentation

Visit Swagger UI for API documentation:
- **URL**: `http://localhost:5000/api-docs`

---

## Troubleshooting

### Backend Issues

**❌ Port 5000 already in use**
```bash
# Change PORT in backend/.env
PORT=5001
```

**❌ Database connection failed**
- Verify Supabase project is active
- Check DATABASE_URL and DIRECT_URL are correct
- Ensure your IP is not blocked by Supabase firewall
- Test connection: `npx prisma db pull`

**❌ Prisma Client not generated**
```bash
npx prisma generate
```

**❌ Migration errors**
```bash
# Reset database (⚠️ DEVELOPMENT ONLY - deletes all data)
npx prisma migrate reset

# Or push schema without migration
npx prisma db push
```

### Frontend Issues

**❌ Port 5173 already in use**
```bash
# Vite will automatically use next available port (5174, 5175, etc.)
# Or specify in vite.config.js
```

**❌ API calls failing (CORS errors)**
- Verify `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Check `VITE_API_URL` in `frontend/.env` points to correct backend

**❌ Images not loading**
- Ensure backend `uploads` folder exists
- Check file permissions
- Verify image URLs in database are accessible

### Supabase Issues

**❌ Too many connections**
- Use connection pooling (DATABASE_URL with pooler)
- Reduce concurrent requests
- Check for connection leaks in code

**❌ Slow queries**
- Check indexes in Prisma schema
- Use Supabase SQL Editor to analyze queries
- Enable query logging: `?log=query`

### Mobile Testing Issues

**❌ Cannot access from mobile device**
- Ensure both devices on same WiFi network
- Use local IP instead of `localhost` in .env files
- Disable firewall temporarily to test
- Check router allows device-to-device communication

Example:
```bash
# Backend .env
FRONTEND_URL=http://192.168.1.100:5173

# Frontend .env
VITE_API_URL=http://192.168.1.100:5000/api
```

---

## Next Steps

After successful setup:

1. **Explore the Admin Dashboard** - Create categories, menu items, tables
2. **Test Customer Flow** - Scan QR code → Order → Track status
3. **Test Waiter Flow** - Accept orders → Update status → Generate bills
4. **Test Kitchen Flow** - View orders → Update preparation status

For detailed API documentation, see [API.md](./API.md)

For database schema details, see [DATABASE.md](./DATABASE.md)

For system architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)
