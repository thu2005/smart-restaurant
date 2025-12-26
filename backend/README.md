# Smart Restaurant - Backend API

RESTful API for Smart Restaurant QR Ordering System built with Node.js, Express, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 16 + Prisma ORM
- **Authentication:** JWT + Passport.js
- **Real-time:** Socket.IO
- **Payment:** Stripe API

## Prerequisites

- Node.js >= 18.x
- Docker & Docker Compose
- PostgreSQL (via Docker)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update values if needed (PostgreSQL port, JWT secret, etc.)

### 3. Start PostgreSQL Container

```bash
docker compose up -d
```

This will start:
- PostgreSQL on port `5432`
- pgAdmin (Web UI) on `http://localhost:5050`
  - Email: `admin@admin.com`
  - Password: `admin`

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev
```

This creates all database tables from the Prisma schema.

### 5. Run Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5001`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm test` | Run tests (TBD) |
| `npx prisma studio` | Open Prisma Studio (Database GUI) |
| `npx prisma migrate dev` | Create and apply new migration |
| `npx prisma generate` | Generate Prisma Client |

## API Endpoints

### Base URL
```
http://localhost:5001/api
```

### Health Check
```
GET /
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

*(More routes will be added as development progresses)*

## Database Access

### Via Prisma Studio (Recommended)
```bash
npx prisma studio
```
Opens at `http://localhost:5555` - Best way to view/edit data during development

### Via pgAdmin (Web UI)
- URL: `http://localhost:5050`
- Login: `admin@admin.com` / `admin`
- Add server connection:
  - Host: `postgres` (or `localhost` if connecting from host machine)
  - Port: `5432`
  - Database: `smart_restaurant`
  - Username: `postgres`
  - Password: `postgres123`

### Via psql Client
```bash
psql postgresql://postgres:postgres123@localhost:5432/smart_restaurant
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema definition
│   └── migrations/      # Database migrations
├── src/
│   ├── config/          # Configuration files (database, jwt, etc.)
│   ├── models/          # (Not used - Prisma models in schema.prisma)
│   ├── routes/          # API routes
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware (auth, validation)
│   ├── services/        # Business logic (payment, socket.io)
│   └── utils/           # Helper functions
├── uploads/             # Uploaded files (images)
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment template
├── docker-compose.yml   # PostgreSQL container config
├── server.js            # Entry point
├── DATABASE_SCHEMA.md   # Database schema documentation
└── package.json
```

## User Roles

| Role | Description |
|------|-------------|
| `super_admin` | System admin - creates Admin accounts |
| `admin` | Restaurant owner - manages menu, tables, staff |
| `waiter` | Accepts orders, serves customers |
| `kitchen` | Views orders in KDS, updates preparation status |
| `customer` | Places orders via QR code |

## Troubleshooting

### Port Already in Use

If port 5001, 5432, or 5050 is occupied:

**Backend:**
```bash
# Change PORT in .env
PORT=5002
```

**PostgreSQL:**
```bash
# Edit docker-compose.yml ports section
ports:
  - "5433:5432"  # Change host port
  
# Update DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5433/smart_restaurant
```

### Database Connection Failed

Check if container is running:
```bash
docker ps
```

Restart containers:
```bash
docker compose restart
```

View PostgreSQL logs:
```bash
docker compose logs postgres
```

### Prisma Migration Issues

Reset database (⚠️ DEV ONLY - deletes all data):
```bash
npx prisma migrate reset
```

Push schema without migration (for prototyping):
```bash
npx prisma db push
```

### Cannot Access pgAdmin

Ensure containers are healthy:
```bash
docker compose ps
docker compose logs pgadmin
```

## Development Workflow

See [WORKFLOW.md](./WORKFLOW.md) for feature implementation guidelines.

## API Documentation

Coming soon: Swagger/OpenAPI docs will be available at `/api-docs`
