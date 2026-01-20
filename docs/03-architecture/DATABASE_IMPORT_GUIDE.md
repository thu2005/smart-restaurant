# Database Import Guide

## Table of Contents
- [Overview](#overview)
- [Quick Setup](#quick-reference)
- [Database Schema](#database-schema)
- [Seeding Database](#seeding-database)
- [Importing Production Data](#importing-production-data)
- [Data Migration](#data-migration)
- [Backup and Restore](#backup-and-restore)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Smart Restaurant system uses **PostgreSQL** as the primary database, managed via **Prisma ORM**. This guide covers data seeding, import/export procedures, and database management best practices.

**Technology Stack:**
- Database: PostgreSQL 14+ (hosted on Supabase)
- ORM: Prisma 5.8+
- Seed Script: Node.js script with sample data

---

## Database Schema

### Schema Overview

The database consists of **16 tables** organized into logical domains:

**Core Entities:**
- `Restaurant` - Restaurant information
- `User` - Users with role-based access (SUPER_ADMIN, ADMIN, WAITER, KITCHEN, CUSTOMER)
- `Table` - Restaurant tables with QR codes
- `Category` - Menu categories
- `MenuItem` - Menu items with photos and modifiers
- `ModifierGroup` - Modifier groups (e.g., "Size", "Toppings")
- `ModifierOption` - Individual modifier options

**Order Management:**
- `Cart` - Customer shopping carts
- `CartItem` - Items in cart
- `Order` - Customer orders
- `OrderItem` - Individual items in an order
- `Bill` - Generated bills for orders
- `Payment` - Payment records

**Additional:**
- `Review` - Customer reviews
- `MenuItemPhoto` - Menu item images
- `MenuItemModifierGroup` - Many-to-many relation

### Schema Location

**File**: `backend/prisma/schema.prisma` (493 lines)

### Viewing Schema

```bash
cd backend
npx prisma studio
```

This opens Prisma Studio on `http://localhost:5555` for visual database exploration.

---

## Seeding Database

### Seed Script Overview

**Location**: `backend/prisma/seed.js` (1407 lines)

**What it creates:**
- 1 Restaurant (Café Poirot)
- 5 Users (Super Admin, Admin, Waiter, Kitchen Staff, 1 Customer)
- 8 Categories (Appetizers, Main Course, Desserts, Beverages, etc.)
- 50+ Menu Items with photos and descriptions
- 10+ Modifier Groups with options
- 12 Tables with generated QR codes
- Sample orders, bills, and payments
- Customer reviews

### Running the Seed

**Command:**
```bash
cd backend
npm run seed
```

**Expected Output:**
```
🌱 Starting comprehensive seed...
🗑️  Clearing old data...
🏪 Creating Restaurant...
👥 Creating Users...
🍽️  Creating Categories...
📋 Creating Menu Items...
🔧 Creating Modifiers...
🪑 Creating Tables...
📦 Creating Sample Orders...
💰 Creating Sample Bills...
💳 Creating Sample Payments...
⭐ Creating Sample Reviews...
Seed completed successfully!
```

**Duration**: ~10-15 seconds

### Seed Script Details

The seed script performs operations in this order to maintain referential integrity:

1. **Cleanup** (Delete all existing data in reverse dependency order)
   ```javascript
   await prisma.review.deleteMany();
   await prisma.payment.deleteMany();
   await prisma.orderItem.deleteMany();
   await prisma.order.deleteMany();
   // ... (continues for all tables)
   ```

2. **Create Restaurant**
   ```javascript
   const restaurant = await prisma.restaurant.create({
     data: {
       name: "Café Poirot",
       address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
       timezone: "Asia/Ho_Chi_Minh",
       currency: "VND",
       openingHours: { /* ... */ }
     }
   });
   ```

3. **Create Users** with bcrypt-hashed passwords
   ```javascript
   const hashedPassword = await bcrypt.hash("password123", 10);
   ```

4. **Create Categories** (Appetizers, Main Course, Desserts, etc.)

5. **Create Menu Items** (50+ items with Vietnamese and international cuisine)

6. **Create Modifiers** (Size, Spice Level, Toppings, etc.)

7. **Create Tables** (12 tables with QR codes)

8. **Create Sample Data** (Orders, Bills, Payments, Reviews)

### Customizing Seed Data

**Edit the seed file:**
```bash
code backend/prisma/seed.js
```

**Example: Add a new restaurant**
```javascript
const restaurant2 = await prisma.restaurant.create({
  data: {
    name: "Pho 24",
    address: "456 Le Loi, District 1, HCMC",
    timezone: "Asia/Ho_Chi_Minh",
    currency: "VND",
    openingHours: {
      monday: { open: "06:00", close: "22:00" },
      // ... (other days)
    }
  }
});
```

**Run custom seed:**
```bash
npm run seed
```

---

## Importing Production Data

### Method 1: SQL Dump (PostgreSQL)

**Export from Supabase:**

1. Navigate to Supabase Dashboard → Database → Backups
2. Download SQL dump file
3. Or use `pg_dump` command:

```bash
pg_dump -h <supabase-host> \
  -U postgres \
  -d postgres \
  -F c \
  -b \
  -v \
  -f backup.dump
```

**Import to Local Database:**

```bash
psql -h localhost -U postgres -d smart_restaurant < backup.sql
```

**Or restore from dump:**
```bash
pg_restore -h localhost \
  -U postgres \
  -d smart_restaurant \
  -v backup.dump
```

### Method 2: Prisma Export/Import (JSON)

**Export data to JSON:**

Create a script `backend/scripts/export-data.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportData() {
  const data = {
    restaurants: await prisma.restaurant.findMany({ include: { users: true } }),
    categories: await prisma.category.findMany(),
    menuItems: await prisma.menuItem.findMany(),
    orders: await prisma.order.findMany({ include: { items: true } }),
    // ... (add other tables)
  };
  
  fs.writeFileSync('export.json', JSON.stringify(data, null, 2));
  console.log('Data exported to export.json');
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run export:**
```bash
node backend/scripts/export-data.js
```

**Import data from JSON:**

Create `backend/scripts/import-data.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function importData() {
  const data = JSON.parse(fs.readFileSync('export.json', 'utf8'));
  
  // Import restaurants
  for (const restaurant of data.restaurants) {
    await prisma.restaurant.create({ data: restaurant });
  }
  
  // Import categories
  for (const category of data.categories) {
    await prisma.category.create({ data: category });
  }
  
  // ... (continue for other tables)
  
  console.log('Data imported successfully');
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run import:**
```bash
node backend/scripts/import-data.js
```

### Method 3: CSV Import

**Export to CSV:**

```sql
-- Connect to database
psql -h <supabase-host> -U postgres -d postgres

-- Export restaurants to CSV
\copy (SELECT * FROM "Restaurant") TO 'restaurants.csv' WITH CSV HEADER;

-- Export menu items to CSV
\copy (SELECT * FROM "MenuItem") TO 'menu_items.csv' WITH CSV HEADER;
```

**Import from CSV:**

```sql
-- Import restaurants
\copy "Restaurant" FROM 'restaurants.csv' WITH CSV HEADER;

-- Import menu items
\copy "MenuItem" FROM 'menu_items.csv' WITH CSV HEADER;
```

---

## Data Migration

### Prisma Migrations

**Create a new migration:**

1. Edit `backend/prisma/schema.prisma`
2. Run migration command:

```bash
cd backend
npx prisma migrate dev --name add_new_field
```

This will:
- Generate SQL migration file in `prisma/migrations/`
- Apply migration to database
- Regenerate Prisma Client

**Example migration files:**
- `prisma/migrations/20240115_init/migration.sql` - Initial schema
- `prisma/migrations/20240120_add_item_status/migration.sql` - Add itemStatus field

### Deploy Migrations to Production

**Command:**
```bash
cd backend
npx prisma migrate deploy
```

This applies all pending migrations to production database.

**In CI/CD pipeline (render.yaml):**
```yaml
buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
```

### Rollback Migrations

Prisma doesn't have built-in rollback. To rollback:

**Option 1: Restore database backup**
```bash
pg_restore -h localhost -U postgres -d smart_restaurant backup.dump
```

**Option 2: Manual SQL rollback**

Create a reverse migration file and run:
```sql
-- Example: Remove a column
ALTER TABLE "MenuItem" DROP COLUMN "newField";
```

---

## Backup and Restore

### Automated Backups (Supabase)

**Supabase provides:**
- Automatic daily backups (retained for 7 days on free tier)
- Point-in-time recovery (paid plans)
- Manual backup download

**Access backups:**
1. Go to Supabase Dashboard
2. Navigate to Database → Backups
3. Download backup file

### Manual Backups

**Create backup:**

```bash
# Full database backup
pg_dump -h <supabase-host> \
  -U postgres \
  -d postgres \
  -F c \
  -f "backup_$(date +%Y%m%d_%H%M%S).dump"

# Schema only
pg_dump -h <supabase-host> -U postgres -d postgres --schema-only > schema.sql

# Data only
pg_dump -h <supabase-host> -U postgres -d postgres --data-only > data.sql
```

**Restore from backup:**

```bash
pg_restore -h localhost \
  -U postgres \
  -d smart_restaurant \
  -c \
  -v backup_20260120_120000.dump
```

**Flags explained:**
- `-c` : Clean (drop) database objects before recreating
- `-v` : Verbose mode
- `-F c` : Format custom (compressed)

### Backup Before Seeding

**Recommended workflow:**

```bash
# 1. Backup current database
pg_dump -h localhost -U postgres -d smart_restaurant -F c -f backup_before_seed.dump

# 2. Run seed
npm run seed

# 3. If something goes wrong, restore backup
pg_restore -h localhost -U postgres -d smart_restaurant -c backup_before_seed.dump
```

---

## Troubleshooting

### Issue 1: Seed Fails with Foreign Key Constraint Error

**Error:**
```
Error: Foreign key constraint failed on the field: `restaurantId`
```

**Solution:**
- Ensure cleanup order is correct (delete child records before parents)
- Check seed script order (create parents before children)
- Verify database is empty before seeding:

```bash
npx prisma migrate reset --force
npm run seed
```

### Issue 2: Prisma Client Out of Sync

**Error:**
```
Error: The Prisma Client is not in sync with the schema
```

**Solution:**
```bash
npx prisma generate
```

### Issue 3: Migration Fails

**Error:**
```
Error: Migration failed to apply
```

**Solution:**
1. Check migration SQL for syntax errors
2. Verify database connection
3. Check for conflicting data:

```bash
# Reset migrations and database
npx prisma migrate reset --force

# Re-apply migrations
npx prisma migrate deploy
```

### Issue 4: Cannot Connect to Database

**Error:**
```
Error: Can't reach database server at `<host>`
```

**Solution:**
1. Verify `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]/postgres?pgbouncer=true"
   ```

2. Check Supabase connection pooler settings

3. Test connection:
   ```bash
   psql "postgresql://postgres:[password]@[host]/postgres"
   ```

### Issue 5: Seed Data Already Exists

**Error:**
```
Unique constraint failed on the constraint: `User_email_key`
```

**Solution:**

**Option 1: Clear database first**
```bash
npx prisma migrate reset --force
npm run seed
```

**Option 2: Modify seed script to skip existing records**
```javascript
const existingUser = await prisma.user.findUnique({
  where: { email: 'admin@cafepoirot.com' }
});

if (!existingUser) {
  await prisma.user.create({ /* ... */ });
}
```

### Issue 6: QR Codes Not Generating in Seed

**Error:**
```
QR code generation failed
```

**Solution:**
- Ensure `qrcode` package is installed:
  ```bash
  npm install qrcode
  ```

- Check `QR_BASE_URL` in `.env`:
  ```env
  QR_BASE_URL=http://localhost:5173
  ```

### Issue 7: Images Not Loading After Import

**Issue**: Menu item images return 404

**Solution:**
1. Ensure `uploads/` folder exists with correct structure:
   ```
   backend/uploads/
   ├── avatars/
   ├── logos/
   └── menu-items/
   ```

2. Copy uploaded files to server:
   ```bash
   scp -r uploads/ user@server:/var/www/smart-restaurant/backend/
   ```

3. Verify image paths in database match server file structure

---

## Best Practices

### Before Seeding Production

**Always:**
1. Create full database backup
2. Test seed on staging environment first
3. Review seed data for sensitive information
4. Notify team of maintenance window
5. Have rollback plan ready

**Never:**
1. Seed production with test data
2. Seed without backup
3. Use weak passwords in production seed
4. Include real customer data in seed scripts

### Data Import Checklist

- [ ] Database backup created
- [ ] Migration files reviewed
- [ ] Foreign key dependencies verified
- [ ] Unique constraints checked
- [ ] Test import on staging
- [ ] Rollback plan documented
- [ ] Team notified
- [ ] Post-import verification completed

### Seed Data Security

**For production seeds:**
- Use environment variables for sensitive data
- Generate strong random passwords
- Don't commit real API keys to seed scripts
- Use secure QR base URLs (HTTPS)

**Example:**
```javascript
const adminPassword = process.env.ADMIN_PASSWORD || await bcrypt.hash('SecurePassword!123', 10);
```

---

## Quick Reference

### Common Commands

```bash
# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (DEV ONLY!)
npx prisma migrate reset --force

# Seed database
npm run seed

# Format schema file
npx prisma format
```

### Seed Script Sections

| Section | Line Range | Description |
|---------|------------|-------------|
| Cleanup | 1-25 | Delete all existing data |
| Restaurant | 26-50 | Create restaurant |
| Users | 51-120 | Create users with roles |
| Categories | 121-180 | Create menu categories |
| Menu Items | 181-900 | Create 50+ menu items |
| Modifiers | 901-1100 | Create modifier groups/options |
| Tables | 1101-1200 | Create tables with QR codes |
| Sample Data | 1201-1407 | Orders, bills, payments, reviews |

---

## Resources

**Prisma Documentation:**
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio)

**PostgreSQL Documentation:**
- [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [pg_restore](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [COPY command](https://www.postgresql.org/docs/current/sql-copy.html)

**Supabase:**
- [Supabase Backups](https://supabase.com/docs/guides/platform/backups)
- [Database Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)


