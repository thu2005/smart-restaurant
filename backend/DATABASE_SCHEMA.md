# Database Schema Documentation

## Overview

PostgreSQL database with Prisma ORM for Smart Restaurant QR ordering system.

## Schema Design Decisions

### Multi-Tenant Architecture
- **Super Admin** → Creates/manages Restaurant (Admin) accounts
- **Admin** → Manages one restaurant, creates Waiter/Kitchen staff
- **Customer** → Can register or order as Guest
- Data isolation via `restaurantId` foreign key in all tenant-specific tables

### Order Flow Strategy
Based on mockup analysis from `/docs/WAD final project/mockups/`:

1. **Multiple Orders per Session**
   - Customer can place multiple orders (Order #1, Order #2, ...) during their table visit
   - Each "Place Order" button click = 1 new Order entity
   - All orders linked to same Table until payment
   
2. **Waiter Acceptance Required**
   - Every order must be accepted by Waiter before going to Kitchen
   - Status flow: `SUBMITTED` → (Waiter Accept) → `RECEIVED` → `PREPARING` → `READY` → `SERVED`
   
3. **Session-Based Payment**
   - Customer clicks "Request Bill" → Order status: `PAYMENT_PENDING`
   - Payment covers ALL orders in current table session
   - One Payment entity can reference multiple Orders (via session/table grouping logic)
   
4. **Guest vs Registered Customer**
   - Guest: `customerId = null`, optional `customerName` + `customerPhone`
   - Registered: `customerId` links to User table, tracks order history

## Entity Relationship

```
Restaurant (1) ──────────── (N) User (Admin, Waiter, Kitchen)
    │
    ├── (1:N) Category ──── (1:N) MenuItem
    │
    ├── (1:N) Table ──────── (1:N) Order
    │                             │
    │                             ├── (1:N) OrderItem
    │                             │
    │                             └── (1:1) Payment
    │
    └── (1:N) Payment

User (Customer) (1) ───── (N) Order (optional for guest orders)
User (Waiter) (1) ────── (N) Order (acceptedBy field)
```

## Key Tables

### User
- Unified table for all roles: `SUPER_ADMIN`, `ADMIN`, `WAITER`, `KITCHEN`, `CUSTOMER`
- `restaurantId` is `NULL` for SUPER_ADMIN and CUSTOMER
- Password hashed with bcrypt
- Email verification flag for customer registration

### Restaurant
- One Admin manages one Restaurant (single-tenant per Admin)
- `openingHours` stored as JSON: `{monday: {open: "08:00", close: "22:00"}, ...}`
- Soft delete via `isActive` flag

### Table
- `qrCode`: Unique token for QR generation (UUID or signed token)
- `status`: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`
- Status changes to `OCCUPIED` when first order submitted
- Status returns to `AVAILABLE` after payment completed

### MenuItem
- Belongs to Category and Restaurant
- `stockStatus`: "available", "low-stock", "out-of-stock"
- `dietary` array: `["vegetarian", "gluten-free"]`
- Price stored as `Decimal(10,2)`

### Order
- **Status transitions**:
  - `SUBMITTED` → Waiter notification
  - `RECEIVED` → Kitchen starts (`acceptedAt` timestamp)
  - `PREPARING` → Items cooking
  - `READY` → Notification to customer
  - `SERVED` → Waiter delivered
  - `PAYMENT_PENDING` → Customer requested bill
  - `COMPLETED` → Payment done
  - `REJECTED`/`CANCELLED` → Rejected by waiter or cancelled

- `orderNumber`: Human-readable ID (e.g., "ORD-0051")
- Timestamps for each stage (for KPI tracking)
- `specialInstructions`: Order-level notes
- `rejectionReason`: If waiter rejects

### OrderItem
- Links Order to MenuItem with quantity
- `modifiers`: String array `["Extra Cheese", "Thin Crust", "No Onions"]`
  - No pricing logic for modifiers (MVP simplification)
  - Modifiers are text-only customizations
- `itemStatus`: "queued", "cooking", "ready" (for kitchen tracking)
- `unitPrice`: Captures price at order time (price history)

### Payment
- One payment per order initially (1:1 relationship)
- For session billing, logic handles grouping multiple orders by table
- `method`: `ZALOPAY`, `MOMO`, `VNPAY`, `STRIPE`, `CASH`, `CARD_AT_COUNTER`
- `status`: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`
- `gatewayResponse`: JSON field for payment gateway data
- Includes `tax` (10%) and `tip` (optional)

## Indexes

Performance optimization indexes added:
- `User`: `email`, `restaurantId + role`
- `Table`: `qrCode`, `restaurantId + tableNumber`
- `MenuItem`: `restaurantId + categoryId + isAvailable`
- `Order`: `tableId + status`, `restaurantId + status`
- `Payment`: `restaurantId + status`

## Business Rules

1. **QR Code Security**
   - Each table has unique `qrCode` token
   - Token can be regenerated (invalidates old QR)
   
2. **Order Timing KPIs**
   - Timer starts at `acceptedAt` (when waiter accepts)
   - Target: `readyAt - acceptedAt` < menu item `prepTime`
   
3. **Stock Management**
   - When order submitted, can check `MenuItem.stockStatus`
   - Admin can mark items unavailable in real-time
   
4. **Payment Flow**
   - Customer must request bill before paying
   - Payment amount = Σ(all orders in session) + tax + tip
   - After payment completed, all related orders → `COMPLETED`
   - Table status → `AVAILABLE`

## Migration Commands

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database (DEV ONLY)
npx prisma migrate reset

# Apply migrations (PROD)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (DB GUI)
npx prisma studio
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/smart_restaurant"
```

## Next Steps

1. ✅ Schema designed and migrated
2. ✅ Prisma Client integrated into `database.js`
3. ⏳ Implement User authentication (JWT + Passport)
4. ⏳ Create Restaurant/Admin CRUD
5. ⏳ Implement Menu management
6. ⏳ Build Order flow with WebSocket notifications
7. ⏳ Integrate payment gateways (Stripe/ZaloPay/MoMo)

## Notes

- **Modifiers**: Currently simple string arrays. Can be extended to MenuModifier table if pricing needed.
- **Session Management**: Table session logic handled at service layer, not DB constraint.
- **Real-time**: WebSocket/Socket.IO for order notifications (pending implementation).
- **File Storage**: `MenuItem.image` URLs - consider AWS S3/Cloudinary for production.
