# Project Structure Documentation

## Table of Contents
- [Overview](#overview)
- [Root Directory](#root-directory)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [Documentation Structure](#documentation-structure)
- [Key Files Explained](#key-files-explained)
- [Naming Conventions](#naming-conventions)
- [File Organization Principles](#file-organization-principles)

---

## Overview

The Smart Restaurant project follows a **monorepo structure** with separate frontend and backend applications, shared documentation, and deployment configurations.

**Project Type**: Full-stack web application (Monorepo)  

**High-Level Structure:**
```
smart-restaurant/
├── backend/           # Node.js + Express API server
├── frontend/          # React + Vite SPA
├── docs/              # Project documentation (17 folders)
├── render.yaml        # Backend deployment config (Render)
├── vercel.json        # Frontend deployment config (Vercel)
└── DEPLOYMENT.md      # Deployment overview
```

---

## Root Directory

```
smart-restaurant/
├── .git/                      # Git version control
├── .gitignore                 # Files to ignore in Git
├── README.md                  # Project overview and setup instructions
├── DEPLOYMENT.md              # High-level deployment guide
├── render.yaml                # Render platform configuration (backend)
├── vercel.json                # Vercel platform configuration (frontend)
├── backend/                   # Backend API application (Node.js)
├── frontend/                  # Frontend web application (React)
└── docs/                      # Project documentation (Markdown files)
```

### Key Root Files

**render.yaml** (Backend Deployment)
- Defines Render service configuration
- Build and start commands
- Environment variables
- Region and instance type

**vercel.json** (Frontend Deployment)
- Defines Vercel build configuration
- SPA routing setup (rewrites)
- Build and output directories

**DEPLOYMENT.md**
- Overview of deployment strategy
- Links to platform-specific guides
- Environment setup instructions

---

## Backend Structure

```
backend/
├── .env                       # Environment variables (not in Git)
├── .env.example               # Template for environment variables
├── .gitignore                 # Backend-specific Git ignore
├── package.json               # Dependencies and scripts
├── package-lock.json          # Lockfile for dependencies
├── eslint.config.js           # ESLint configuration
├── server.js                  # Express app entry point (230 lines)
├── test-momo.js               # MoMo payment testing script
├── docker-compose.yml         # Docker setup (local PostgreSQL)
├── README.md                  # Backend-specific setup guide
├── BACKEND_TESTING.md         # Testing documentation
├── DATABASE_SCHEMA.md         # Database schema documentation
├── WORKFLOW.md                # Development workflow guide
├── prisma/
│   ├── schema.prisma          # Prisma database schema (493 lines)
│   ├── seed.js                # Database seed script (1407 lines)
│   └── migrations/            # Database migration history
│       ├── 20240115_init/
│       ├── 20240120_add_item_status/
│       └── migration_lock.toml
├── src/
│   ├── config/                # Configuration files
│   │   ├── database.js        # Prisma client setup
│   │   └── passport.js        # Auth strategies (JWT, Google)
│   ├── controllers/           # Request handlers (business logic entry)
│   │   ├── auth.controller.js
│   │   ├── restaurant.controller.js
│   │   ├── user.controller.js
│   │   ├── table.controller.js
│   │   ├── menu.controller.js
│   │   ├── category.controller.js
│   │   ├── modifier.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── kitchen.controller.js
│   │   ├── bill.controller.js
│   │   ├── payment.controller.js
│   │   ├── report.controller.js
│   │   └── review.controller.js
│   ├── services/              # Business logic layer
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   ├── report.service.js
│   │   └── email.service.js
│   ├── middlewares/           # Express middleware
│   │   ├── auth.middleware.js       # JWT authentication
│   │   ├── validate.middleware.js   # Request validation
│   │   ├── upload.middleware.js     # File upload (multer)
│   │   └── errorHandler.middleware.js
│   ├── routes/                # API route definitions
│   │   ├── auth.routes.js
│   │   ├── restaurant.routes.js
│   │   ├── user.routes.js
│   │   ├── table.routes.js
│   │   ├── menu.routes.js
│   │   ├── category.routes.js
│   │   ├── modifier.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── kitchen.routes.js
│   │   ├── bill.routes.js
│   │   ├── payment.routes.js
│   │   ├── report.routes.js
│   │   └── review.routes.js
│   └── utils/                 # Helper functions
│       ├── qrcode.util.js           # QR code generation
│       ├── email.util.js            # Email templates
│       ├── pdf.util.js              # PDF generation
│       └── validation.util.js       # Custom validators
└── uploads/                   # File storage (not in Git)
    ├── avatars/               # User profile photos
    ├── logos/                 # Restaurant logos
    └── menu-items/            # Menu item photos
```

### Backend File Responsibilities

**server.js** (230 lines)
- Express app initialization
- Middleware configuration (CORS, Helmet, Morgan)
- Prometheus metrics setup
- Socket.IO configuration
- Route registration
- Error handling
- Server startup

**prisma/schema.prisma** (493 lines)
- Database schema definition (16 models)
- Enums (UserRole, TableStatus, OrderStatus, PaymentMethod, PaymentStatus)
- Relations (foreign keys)
- Indexes and constraints

**prisma/seed.js** (1407 lines)
- Database cleanup
- Create sample restaurant
- Create users (Super Admin, Admin, Waiter, Kitchen, Customer)
- Create 8 categories
- Create 50+ menu items
- Create modifier groups and options
- Create 12 tables with QR codes
- Create sample orders, bills, payments, reviews

**src/controllers/** (13 files)
- Handle HTTP requests
- Input validation
- Call service layer
- Format responses
- Emit Socket.IO events

**src/services/** (4 files)
- Business logic implementation
- Database queries (Prisma)
- External API calls (Stripe, MoMo, VNPay)
- Data transformation

**src/middlewares/** (4 files)
- **auth.middleware.js**: Verify JWT, attach user to req.user
- **validate.middleware.js**: Express-validator schemas
- **upload.middleware.js**: Multer file upload config
- **errorHandler.middleware.js**: Global error handler

**src/routes/** (13 files)
- Define API endpoints
- Apply middleware (auth, validation)
- Map to controller functions

**src/utils/** (4 files)
- Reusable helper functions
- QR code generation (qrcode library)
- Email templates (HTML)
- PDF generation (pdfkit)

---

## Frontend Structure

```
frontend/
├── .env                       # Environment variables (not in Git)
├── .env.example               # Template for environment variables
├── .gitignore                 # Frontend-specific Git ignore
├── package.json               # Dependencies and scripts
├── package-lock.json          # Lockfile for dependencies
├── eslint.config.js           # ESLint configuration
├── vite.config.mjs            # Vite configuration
├── tailwind.config.cjs        # TailwindCSS configuration
├── postcss.config.cjs         # PostCSS configuration
├── jsconfig.json              # JavaScript project config (path aliases)
├── index.html                 # HTML entry point
├── vercel.json                # Vercel deployment config (frontend-specific)
├── public/                    # Static assets (served as-is)
│   ├── favicon.ico
│   ├── logo.png
│   └── images/
└── src/
    ├── index.jsx              # React app entry point
    ├── App.jsx                # Root component
    ├── Routes.jsx             # Route definitions
    ├── components/            # Reusable UI components
    │   ├── common/            # Generic components
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Loading.jsx
    │   │   ├── ErrorBoundary.jsx
    │   │   └── ...
    │   ├── layout/            # Layout components
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── ...
    │   ├── menu/              # Menu-specific components
    │   │   ├── MenuItem.jsx
    │   │   ├── CategoryFilter.jsx
    │   │   ├── MenuGrid.jsx
    │   │   └── ...
    │   ├── cart/              # Cart components
    │   │   ├── CartItem.jsx
    │   │   ├── CartSummary.jsx
    │   │   └── ...
    │   ├── order/             # Order components
    │   │   ├── OrderCard.jsx
    │   │   ├── OrderStatus.jsx
    │   │   └── ...
    │   └── dashboard/         # Admin/Staff dashboard components
    │       ├── DashboardCard.jsx
    │       ├── RevenueChart.jsx
    │       ├── OrderTable.jsx
    │       └── ...
    ├── pages/                 # Page-level components (routes)
    │   ├── Home.jsx
    │   ├── Menu.jsx
    │   ├── Cart.jsx
    │   ├── Checkout.jsx
    │   ├── Orders.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Dashboard/
    │   │   ├── DashboardLayout.jsx
    │   │   ├── OrderManagement.jsx
    │   │   ├── KitchenDisplay.jsx
    │   │   ├── MenuManagement.jsx
    │   │   ├── TableManagement.jsx
    │   │   ├── Reports.jsx
    │   │   └── Settings.jsx
    │   └── Payment/
    │       ├── StripeCheckout.jsx
    │       ├── MoMoPayment.jsx
    │       ├── PaymentSuccess.jsx
    │       └── PaymentCancel.jsx
    ├── layouts/               # Page layout wrappers
    │   ├── MainLayout.jsx
    │   ├── DashboardLayout.jsx
    │   └── AuthLayout.jsx
    ├── contexts/              # React Context providers
    │   ├── AuthContext.jsx
    │   ├── CartContext.jsx
    │   └── SocketContext.jsx
    ├── services/              # API service functions
    │   ├── api.js             # Axios instance + interceptors
    │   ├── authService.js
    │   ├── restaurantService.js
    │   ├── menuService.js
    │   ├── orderService.js
    │   ├── cartService.js
    │   ├── paymentService.js
    │   ├── reportService.js
    │   └── socketService.js   # Socket.IO client
    ├── utils/                 # Helper functions
    │   ├── formatters.js      # Date, currency formatters
    │   ├── validators.js      # Form validation
    │   ├── constants.js       # App constants
    │   └── storage.js         # LocalStorage helpers
    ├── i18n/                  # Internationalization
    │   ├── i18n.js            # i18next configuration
    │   └── locales/
    │       ├── en.json        # English translations
    │       └── vi.json        # Vietnamese translations
    └── styles/                # Global styles
        ├── index.css          # Global CSS + Tailwind imports
        └── custom.css         # Custom styles
```

### Frontend File Responsibilities

**index.jsx**
- React app entry point
- ReactDOM.render()
- StrictMode wrapper
- Global providers (Redux, i18n, Router)

**App.jsx**
- Root component
- Global contexts (Auth, Socket)
- Toast notifications setup
- Route definitions

**Routes.jsx**
- React Router configuration
- Public routes (/, /menu, /login)
- Protected routes (/dashboard/*)
- Role-based route guards

**components/common/**
- Generic reusable components
- Button, Input, Modal, Loading, ErrorBoundary
- Used across multiple pages

**components/layout/**
- Layout components (Header, Footer, Sidebar)
- Navigation menus
- User profile dropdown

**components/{domain}/**
- Domain-specific components
- menu/, cart/, order/, dashboard/
- Encapsulate business logic

**pages/**
- Top-level page components
- Correspond to routes
- Compose smaller components

**layouts/**
- Page layout wrappers
- MainLayout (Header + Content + Footer)
- DashboardLayout (Sidebar + Content)
- AuthLayout (Centered form)

**contexts/**
- React Context providers
- AuthContext (user, login, logout)
- CartContext (cart items, add, remove)
- SocketContext (Socket.IO connection)

**services/**
- API service layer
- Axios HTTP calls
- Error handling
- Request/response transformation

**utils/**
- Helper functions
- Formatters (date, currency, phone)
- Validators (email, password)
- Constants (API URLs, roles, statuses)

**i18n/**
- Internationalization setup
- i18next configuration
- Translation files (en.json, vi.json)

---

## Documentation Structure

```
docs/
├── ORDERED_FOLDERS.md         # Documentation index
├── 01-product/                # Product requirements
│   ├── README.md
│   ├── 01-ONE_PAGER.md
│   ├── 02-SRS.md              # Software Requirements Specification
│   ├── 03-SRS_CHANGELOG.md
│   ├── 04-MVP_SCOPE.md
│   ├── 05-EPICS.md
│   ├── 06-USER_STORIES.md
│   ├── 06b-USER_STORIES_DETAILED.md
│   ├── 07-ACCEPTANCE_CRITERIA.md
│   ├── 08-METRICS_KPIS.md
│   ├── 09-ROADMAP.md
│   ├── 10-VISION_AND_OKRS.md
│   ├── 11-RELEASE_CRITERIA.md
│   ├── 12-ADR_INDEX.md        # Architectural Decision Records index
│   ├── 13-MEETINGS_README.md
│   ├── 14-TEMPLATES_USER_STORY.md
│   ├── 15-TEMPLATES_ACCEPTANCE_TEST.md
│   ├── 16-SPRINT_PLAN.md
│   ├── ADR/                   # Architecture Decision Records
│   ├── diagrams/              # Product diagrams
│   ├── MEETINGS/              # Meeting notes
│   ├── TEMPLATES/             # Document templates
│   └── 09-ux/                 # UX research (duplicate)
├── 02-api/                    # API documentation
│   ├── API.md                 # REST API reference
│   ├── OPENAPI.md             # OpenAPI/Swagger guide
│   └── openapi.yaml           # OpenAPI specification
├── 03-architecture/           # System architecture
│   ├── ARCHITECTURE.md        # Comprehensive architecture doc (1110 lines)
│   ├── ER_DIAGRAM.md          # Entity-Relationship diagram
│   └── TECH_STACK_AND_ARCHITECTURE.md  # Technology stack details
├── 04-dev/                    # Developer guides
│   ├── CONTRIBUTING.md        # How to contribute
│   ├── SETUP.md               # Local development setup (2095 lines)
│   └── DATABASE_IMPORT_GUIDE.md  # Database seeding and import
├── 05-infra/                  # Infrastructure & deployment
│   ├── CI.md                  # Continuous Integration
│   ├── DEPLOYMENT_RUNBOOK.md  # Deployment procedures
│   ├── DEPLOYMENT_GUIDE.md    # Platform-specific deployment
│   ├── MOMO_INTEGRATION.md    # MoMo payment integration
│   ├── PAYMENT_INTEGRATION.md # Payment gateway overview
│   ├── STRIPE_IMPLEMENTATION.md
│   ├── STRIPE_QUICK_START.md
│   └── STRIPE_SETUP.md
├── 06-qa/                     # Quality Assurance
│   ├── ACCEPTANCE_TESTS.md
│   ├── STRIPE_TESTING_CHECKLIST.md
│   └── TEST_STRATEGY.md
├── 07-ops/                    # Operations
│   ├── MONITORING.md
│   └── ONCALL_RUNBOOK.md
├── 08-security/               # Security
│   └── THREAT_MODEL.md
├── 09-ux/                     # User Experience
│   ├── ACCESSIBILITY.md
│   ├── PERSONAS.md
│   ├── USER_JOURNEYS.md
│   └── WIREFRAMES.md
├── 10-user/                   # User documentation
│   ├── ADMIN_GUIDE.md
│   ├── CUSTOMER_FAQ.md
│   └── STAFF_KDS_GUIDE.md     # Staff and Kitchen Display System guide
├── 11-analytics/              # Analytics
│   └── EVENT_SCHEMA.md        # Event tracking schema
├── 12-business/               # Business
│   ├── BILLING.md             # Billing model and pricing
│   └── MENU_STATUS.md
├── 13-releases/               # Releases
│   └── RELEASE_NOTES_TEMPLATE.md  # Release notes template
├── 14-risks/                  # Risks
│   ├── FEASIBILITY.md         # Feasibility analysis
│   └── RISK_LOG.md            # Risk tracking
├── 15-research/               # Research
│   └── MARKET_ANALYSIS.md
├── 16-legal/                  # Legal
│   └── TERMS.md
├── 17-maintenance/            # Maintenance
│   └── DEBT_REGISTER.md
├── 18-techdebt/               # Technical debt
│   └── ARCHIVAL.md
├── process/                   # Process documentation
│   ├── SPRINTS.md
│   └── WORKFLOW.md
└── WAD final project/         # Course project deliverables
    ├── PROJECT_DESCRIPTION.md
    ├── SELF_ASSESSMENT_REPORT.md
    ├── MOCKUPS.md
    ├── assignments/
    └── mockups/
```

### Documentation Categories

**Product Documentation (01-product/)**
- Requirements, user stories, acceptance criteria
- Roadmap and release planning
- Architecture Decision Records (ADR)

**Technical Documentation (02-05/)**
- API reference and OpenAPI specs
- System architecture and database design
- Developer setup and contribution guides
- Deployment and infrastructure

**Quality & Operations (06-08/)**
- Testing strategy and test cases
- Monitoring and on-call procedures
- Security threat model

**User Documentation (09-10/)**
- UX research (personas, user journeys)
- User guides (admin, customer, staff)
- Accessibility guidelines

**Business & Analytics (11-12/)**
- Event schema and KPIs
- Billing model and pricing
- Market analysis

**Project Management (13-18/)**
- Release notes and templates
- Risk management and feasibility
- Technical debt tracking
- Legal and compliance

---

## Key Files Explained

### Backend Key Files

**server.js** (230 lines)
```javascript
// Entry point for Express app
// Sets up middleware, routes, Socket.IO
// Configures Prometheus metrics
// Starts HTTP server on port 5001
```

**prisma/schema.prisma** (493 lines)
```prisma
// Database schema definition
// Defines 16 models (Restaurant, User, Order, etc.)
// Enums for roles, statuses, payment methods
// Relations with foreign keys
```

**prisma/seed.js** (1407 lines)
```javascript
// Seeds database with sample data
// Creates 1 restaurant, 5 users, 8 categories
// Creates 50+ menu items with modifiers
// Creates 12 tables with QR codes
```

**src/controllers/order.controller.js** (~300 lines)
```javascript
// Handles order-related requests
// createOrder, getOrders, updateOrderStatus
// Emits Socket.IO events (new_order, order_status_update)
// Calls order.service.js for business logic
```

**src/services/order.service.js** (~200 lines)
```javascript
// Business logic for orders
// Database queries via Prisma
// Order validation
// Status transitions
```

**src/middlewares/auth.middleware.js** (~100 lines)
```javascript
// JWT authentication middleware
// passport.authenticate('jwt')
// Attaches user to req.user
// Role-based authorization (authorize(...roles))
```

### Frontend Key Files

**src/index.jsx** (~50 lines)
```javascript
// React app entry point
// Renders <App /> into #root
// Wraps with StrictMode, Redux Provider, Router
```

**src/App.jsx** (~150 lines)
```javascript
// Root component
// Sets up global contexts (Auth, Socket)
// Renders <Routes />
// Toast notifications (Sonner)
```

**src/Routes.jsx** (~200 lines)
```javascript
// Route definitions
// Public routes (/, /menu, /login)
// Protected routes (/dashboard/*)
// Role-based guards (requireRole)
```

**src/services/api.js** (~100 lines)
```javascript
// Axios instance configuration
// Base URL from env (VITE_API_URL)
// Request interceptor (add JWT token)
// Response interceptor (handle errors)
```

**src/services/socketService.js** (~80 lines)
```javascript
// Socket.IO client setup
// Connect to backend WebSocket
// Listen for events (new_order, order_status_update)
// Join restaurant room
```

**src/components/common/Button.jsx** (~50 lines)
```javascript
// Reusable button component
// Props: variant (primary, secondary, danger)
// TailwindCSS styling with class-variance-authority
```

**src/pages/Dashboard/OrderManagement.jsx** (~400 lines)
```javascript
// Admin/Waiter order management page
// Displays order list with filters
// Real-time updates via Socket.IO
// Order status updates (accept, reject, complete)
```

---

## Naming Conventions

### File Naming

**Backend (Node.js)**
- Controllers: `*.controller.js` (e.g., `order.controller.js`)
- Services: `*.service.js` (e.g., `payment.service.js`)
- Routes: `*.routes.js` (e.g., `auth.routes.js`)
- Middleware: `*.middleware.js` (e.g., `auth.middleware.js`)
- Utils: `*.util.js` (e.g., `qrcode.util.js`)
- Config: `*.js` (e.g., `database.js`, `passport.js`)

**Frontend (React)**
- Components: `PascalCase.jsx` (e.g., `MenuItem.jsx`, `CartItem.jsx`)
- Pages: `PascalCase.jsx` (e.g., `Dashboard.jsx`, `Menu.jsx`)
- Services: `camelCase.js` (e.g., `authService.js`, `orderService.js`)
- Utils: `camelCase.js` (e.g., `formatters.js`, `validators.js`)
- Styles: `kebab-case.css` (e.g., `index.css`, `custom.css`)

**Documentation**
- Uppercase with underscores: `ALL_CAPS.md` (e.g., `SETUP.md`, `API.md`)
- Folders: `kebab-case/` (e.g., `01-product/`, `user-guides/`)

### Variable Naming

**JavaScript/React**
- Variables: `camelCase` (e.g., `userId`, `orderTotal`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `MAX_FILE_SIZE`)
- Components: `PascalCase` (e.g., `MenuItem`, `CartSummary`)
- Functions: `camelCase` (e.g., `handleSubmit`, `fetchOrders`)
- React Hooks: `use` prefix (e.g., `useAuth`, `useCart`)

**Prisma/Database**
- Models: `PascalCase` (e.g., `Restaurant`, `MenuItem`, `OrderItem`)
- Fields: `camelCase` (e.g., `userId`, `createdAt`, `isActive`)
- Enums: `UPPER_CASE` (e.g., `UserRole.ADMIN`, `OrderStatus.PENDING`)

---

## File Organization Principles

### Backend Principles

1. **Separation of Concerns**
   - Controllers: HTTP request/response handling
   - Services: Business logic and database queries
   - Routes: Endpoint definitions
   - Middleware: Cross-cutting concerns (auth, validation)

2. **Layered Architecture**
   ```
   Routes → Middleware → Controllers → Services → Prisma → Database
   ```

3. **Feature-Based Modules**
   - Each feature has controller, service, routes
   - Example: Order feature = order.controller.js + order.service.js + order.routes.js

4. **Shared Utilities**
   - Common functions in `src/utils/`
   - Email, PDF, QR code generation
   - Reusable across features

### Frontend Principles

1. **Component-Based Architecture**
   - Small, reusable components in `components/`
   - Page components compose smaller components
   - Domain-specific component folders (menu/, cart/, order/)

2. **Container/Presentational Pattern**
   - Smart components (pages/) - handle state and logic
   - Dumb components (components/) - receive props, render UI

3. **Service Layer**
   - API calls abstracted in `services/`
   - Pages/components call services, not Axios directly
   - Centralized error handling

4. **Context for Global State**
   - AuthContext: User authentication state
   - CartContext: Shopping cart state
   - SocketContext: WebSocket connection

5. **Folder-by-Feature**
   - Related components grouped by feature
   - Example: `components/cart/` contains CartItem, CartSummary, CartActions

---

## Folder Purpose Quick Reference

| Folder | Purpose | Example Files |
|--------|---------|---------------|
| `backend/src/controllers/` | HTTP request handlers | `order.controller.js` |
| `backend/src/services/` | Business logic | `payment.service.js` |
| `backend/src/routes/` | API endpoints | `auth.routes.js` |
| `backend/src/middlewares/` | Express middleware | `auth.middleware.js` |
| `backend/src/utils/` | Helper functions | `qrcode.util.js` |
| `backend/prisma/` | Database schema & migrations | `schema.prisma`, `seed.js` |
| `backend/uploads/` | Uploaded files | `avatars/`, `logos/` |
| `frontend/src/components/` | Reusable UI components | `Button.jsx`, `Modal.jsx` |
| `frontend/src/pages/` | Page components (routes) | `Menu.jsx`, `Dashboard.jsx` |
| `frontend/src/services/` | API service functions | `authService.js` |
| `frontend/src/contexts/` | React Context providers | `AuthContext.jsx` |
| `frontend/src/utils/` | Frontend helpers | `formatters.js` |
| `frontend/src/i18n/` | Translations | `en.json`, `vi.json` |
| `docs/01-product/` | Product requirements | `SRS.md`, `USER_STORIES.md` |
| `docs/03-architecture/` | Architecture docs | `ARCHITECTURE.md`, `ER_DIAGRAM.md` |
| `docs/04-dev/` | Developer guides | `SETUP.md`, `CONTRIBUTING.md` |
| `docs/05-infra/` | Deployment & infrastructure | `DEPLOYMENT_GUIDE.md` |
| `docs/10-user/` | User documentation | `ADMIN_GUIDE.md`, `STAFF_KDS_GUIDE.md` |

---

## Adding New Files

### Adding a Backend Endpoint

1. **Create controller** in `src/controllers/`
   ```javascript
   // src/controllers/feature.controller.js
   exports.getFeature = async (req, res) => { ... };
   ```

2. **Create service** (if needed) in `src/services/`
   ```javascript
   // src/services/feature.service.js
   exports.processFeature = async (data) => { ... };
   ```

3. **Create routes** in `src/routes/`
   ```javascript
   // src/routes/feature.routes.js
   router.get('/', featureController.getFeature);
   ```

4. **Register routes** in `server.js`
   ```javascript
   app.use('/api/feature', require('./src/routes/feature.routes'));
   ```

### Adding a Frontend Page

1. **Create page component** in `src/pages/`
   ```javascript
   // src/pages/NewPage.jsx
   export default function NewPage() { ... }
   ```

2. **Add route** in `src/Routes.jsx`
   ```javascript
   <Route path="/new-page" element={<NewPage />} />
   ```

3. **Add navigation link** in `components/layout/Header.jsx`
   ```javascript
   <Link to="/new-page">New Page</Link>
   ```

### Adding Documentation

1. **Choose appropriate folder** in `docs/`
   - Product docs → `01-product/`
   - Technical docs → `03-architecture/` or `04-dev/`
   - User docs → `10-user/`

2. **Create Markdown file**
   ```bash
   touch docs/04-dev/NEW_GUIDE.md
   ```

3. **Update index** (if applicable)
   - Add to `ORDERED_FOLDERS.md`
   - Link from related docs

---

## File Statistics

**Backend:**
- Total Files: ~150
- Controllers: 13 files (~3,000 LOC)
- Services: 4 files (~1,200 LOC)
- Routes: 13 files (~1,000 LOC)
- Middleware: 4 files (~400 LOC)
- Prisma Schema: 1 file (493 LOC)
- Seed Script: 1 file (1,407 LOC)

**Frontend:**
- Total Files: ~250
- Components: 90+ files (~8,000 LOC)
- Pages: 20+ files (~6,000 LOC)
- Services: 10 files (~1,500 LOC)
- Utils: 5 files (~500 LOC)

**Documentation:**
- Total Files: 80+
- Total Lines: ~50,000 LOC
- Folders: 18

---

## Best Practices

### File Organization

**Do:**
- Group related files together (feature folders)
- Keep files small (< 500 lines)
- Use descriptive file names
- Follow consistent naming conventions
- Separate concerns (controller vs. service)

**Don't:**
- Create deeply nested folders (max 3 levels)
- Mix concerns in one file (API + UI logic)
- Use generic names (`utils.js`, `helpers.js`)
- Duplicate code across files

### Code Organization

**Do:**
- One component per file (React)
- One model per file (Prisma)
- Export named functions
- Use barrel exports (`index.js`) for feature modules
- Keep imports organized (3rd-party, local, styles)

**Don't:**
- Default export everything (prefer named exports)
- Import from deep paths (`../../../../../../`)
- Mix business logic with presentation logic

---

## Quick Navigation

**Find a file by purpose:**

| I want to... | Go to... |
|-------------|----------|
| Add a new API endpoint | `backend/src/controllers/` + `routes/` |
| Modify database schema | `backend/prisma/schema.prisma` |
| Add a new React page | `frontend/src/pages/` |
| Create a reusable component | `frontend/src/components/common/` |
| Update API documentation | `docs/02-api/API.md` |
| Add a deployment step | `docs/05-infra/DEPLOYMENT_GUIDE.md` |
| Write user documentation | `docs/10-user/` |
| Configure environment variables | `backend/.env` or `frontend/.env` |
| Seed database | `backend/prisma/seed.js` |
| Setup project locally | `docs/04-dev/SETUP.md` |

---

## Resources

**Project Templates:**
- [React Project Structure](https://reactjs.org/docs/faq-structure.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

**Style Guides:**
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
