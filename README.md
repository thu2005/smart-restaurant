# 🍽️ Smart Restaurant - QR-Based Ordering System

A modern, full-stack restaurant management and ordering system featuring QR code-based table ordering, real-time kitchen display, and comprehensive admin controls.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue.svg)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Demo](#-demo)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🛎️ Customer Experience
- **QR Code Ordering**: Scan table QR codes to instantly access the menu
- **Smart Menu Browsing**: Category filters, search, dietary preferences, and fuzzy search
- **Real-time Order Tracking**: Live updates on order status with WebSocket integration
- **Multiple Payment Methods**: Cash, Card, MoMo, and Stripe integration
- **Multi-language Support**: English and Vietnamese (i18n)
- **Guest & Authenticated Ordering**: Order as guest or create an account for order history

### 👨‍🍳 Kitchen Management
- **Kitchen Display System (KDS)**: Real-time order queue with drag-and-drop status updates
- **Order Prioritization**: Visual indicators for new orders and preparation times
- **Item-level Tracking**: Track individual menu items through preparation stages
- **Batch Processing**: Smart preparation time estimation based on kitchen capacity

### 👔 Waiter Dashboard
- **Table Management**: Monitor all tables and their current orders
- **Order Status Updates**: Mark orders as served, create bills, apply discounts
- **Bill Generation**: Automated billing with tax calculation and payment processing
- **Real-time Notifications**: Instant alerts for new orders and status changes

### 🔧 Admin Panel
- **Menu Management**: Full CRUD operations for categories, items, and modifiers
- **User Management**: Role-based access control (Super Admin, Admin, Waiter, Kitchen, Customer)
- **Table Management**: QR code generation and table configuration
- **Order Analytics**: Comprehensive reporting and analytics dashboard
- **Metabase Integration**: Advanced business intelligence and data visualization

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Account activation via Resend email service
- **Password Reset**: Forgot password flow with secure token-based reset
- **Google OAuth**: Social login integration
- **Role-based Authorization**: Granular permission control

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2 with Vite
- **Routing**: React Router v6
- **State Management**: Redux Toolkit, Context API
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom component library with Radix UI primitives
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form
- **Internationalization**: i18next
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast notifications)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (ioredis)
- **Real-time**: Socket.IO
- **Authentication**: Passport.js (JWT, Google OAuth)
- **Email**: Resend API
- **File Upload**: Cloudinary
- **Payment**: Stripe, MoMo, VNPay
- **API Documentation**: Swagger/OpenAPI
- **Monitoring**: Prometheus metrics

### DevOps & Infrastructure
- **Deployment**: Render (Backend), Vercel (Frontend)
- **Database Hosting**: Neon (PostgreSQL)
- **CDN**: Cloudinary
- **Email Service**: Resend
- **Version Control**: Git & GitHub

## 🏗️ Architecture

The application follows a modern microservices-inspired architecture with clear separation of concerns:

```
smart-restaurant/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── contexts/      # React Context providers
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── public/        # Static assets
│
├── backend/           # Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Prisma schema
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Custom middleware
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   └── prisma/        # Database schema & migrations
│
└── docs/              # Comprehensive documentation
    ├── 01-product/        # Product specifications
    ├── 02-api/            # API documentation
    ├── 03-architecture/   # System architecture
    ├── 04-dev/            # Development guides
    └── ...                # Additional documentation
```

For detailed architecture documentation, see [docs/03-architecture/ARCHITECTURE.md](docs/03-architecture/ARCHITECTURE.md).

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 15
- Redis (optional, for caching)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-restaurant.git
   cd smart-restaurant
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database (optional)
   npm run seed
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5002
   - API Documentation: http://localhost:5002/api-docs

### Environment Variables

#### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5002

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smart_restaurant
DIRECT_URL=postgresql://user:password@localhost:5432/smart_restaurant

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateways
STRIPE_SECRET_KEY=your-stripe-key
MOMO_PARTNER_CODE=your-momo-code
# ... (see .env.example for full list)
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5002/api
VITE_SOCKET_URL=http://localhost:5002
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Product Documentation](docs/01-product/)** - Feature specifications and user stories
- **[API Documentation](docs/02-api/)** - REST API endpoints and WebSocket events
- **[Architecture](docs/03-architecture/)** - System design and technical architecture
- **[Development Guide](docs/04-dev/)** - Setup instructions and coding standards
- **[Infrastructure](docs/05-infra/)** - Deployment and DevOps guides
- **[QA & Testing](docs/06-qa/)** - Testing strategies and test cases
- **[Operations](docs/07-ops/)** - Monitoring and maintenance
- **[Security](docs/08-security/)** - Security policies and best practices
- **[UX Design](docs/09-ux/)** - UI/UX guidelines and design system
- **[User Guides](docs/10-user/)** - End-user documentation

## 🎬 Demo

### Customer Flow
<!-- GIF placeholder: Customer scanning QR code and browsing menu -->
![Customer Ordering Flow](docs/demos/customer-flow.gif)

### Kitchen Display System
<!-- GIF placeholder: Kitchen staff managing orders -->
![Kitchen Display](docs/demos/kitchen-display.gif)

### Waiter Dashboard
<!-- GIF placeholder: Waiter managing tables and orders -->
![Waiter Dashboard](docs/demos/waiter-dashboard.gif)

### Admin Panel
<!-- GIF placeholder: Admin managing menu and users -->
![Admin Panel](docs/demos/admin-panel.gif)

## 📖 API Documentation

Interactive API documentation is available via Swagger UI:

- **Development**: http://localhost:5002/api-docs
- **Production**: https://your-api-domain.com/api-docs

Key API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/menu/items` - Get menu items
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

For detailed API documentation, see [docs/02-api/](docs/02-api/).

## 🚢 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install && npx prisma generate`
4. Set start command: `cd backend && npm start`
5. Add environment variables from `.env`

### Frontend (Vercel)
1. Import project from GitHub
2. Set root directory to `frontend`
3. Framework preset: Vite
4. Add environment variables from `.env`

### Database (Neon)
1. Create a PostgreSQL database on Neon
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `npx prisma migrate deploy`

For detailed deployment instructions, see [docs/05-infra/DEPLOYMENT.md](docs/05-infra/DEPLOYMENT.md).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by modern restaurant management systems
- Built with love for the food service industry

## 📞 Support

For support, email support@smartrestaurant.com or join our Slack channel.

---

**Note**: This is an educational project developed as part of a Web Application Development course. It demonstrates modern full-stack development practices and real-world application architecture.
