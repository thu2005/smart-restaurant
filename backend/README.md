# Smart Restaurant - Backend API

RESTful API for Smart Restaurant QR Ordering System built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB 7.0
- **Authentication:** JWT + Passport.js
- **Real-time:** Socket.IO
- **Payment:** Stripe API

## Prerequisites

- Node.js >= 18.x
- Docker & Docker Compose
- MongoDB (via Docker)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update values if needed (MongoDB port, JWT secret, etc.)

### 3. Start MongoDB Container

```bash
docker-compose up -d
```

This will start:
- MongoDB on port `27018`
- Mongo Express (Web UI) on `http://localhost:8081`

### 4. Run Development Server

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

### Via Mongo Express (Web UI)
- URL: `http://localhost:8081`
- No authentication required (development only)

### Via MongoDB Client
```bash
mongosh "mongodb://admin:admin123@localhost:27018/smart_restaurant?authSource=admin"
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, jwt, etc.)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware (auth, validation)
│   ├── services/        # Business logic (payment, socket.io)
│   └── utils/           # Helper functions
├── uploads/             # Uploaded files (images)
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment template
├── docker-compose.yml   # MongoDB container config
├── server.js            # Entry point
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

If port 5001 or 27018 is occupied:

**Backend:**
```bash
# Change PORT in .env
PORT=5002
```

**MongoDB:**
```bash
# Edit docker-compose.yml ports section
ports:
  - "27019:27017"
  
# Update MONGODB_URI in .env
MONGODB_URI=mongodb://admin:admin123@localhost:27019/...
```

### MongoDB Connection Failed

Check if container is running:
```bash
docker ps
```

Restart container:
```bash
docker-compose restart
```

### Cannot Access Mongo Express

Ensure MongoDB container is healthy:
```bash
docker-compose logs mongodb
```

## Development Workflow

See [WORKFLOW.md](./WORKFLOW.md) for feature implementation guidelines.

## API Documentation

Coming soon: Swagger/OpenAPI docs will be available at `/api-docs`
