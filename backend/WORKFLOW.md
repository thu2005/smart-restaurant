# Backend Development Workflow

This document outlines the standardized **3-Layer Architecture** for implementing features.

## Architecture Overview

```
Request → Routes → Controllers → Services → Models → Database
                      ↓              ↓
                  Validation    Business Logic
```

**Layers:**
1. **Routes** - API endpoints and middleware
2. **Controllers** - Request/response handling
3. **Services** - Business logic (core layer)
4. **Models** - Database schema and queries

## Feature Implementation Checklist

Follow this sequence for every new feature:

### 1. Define the Model (if needed)

**Location:** `src/models/`

**Steps:**
1. Create a new file: `{entity}.model.js` (e.g., `menu.model.js`)
2. Define the Mongoose schema
3. Add indexes for frequently queried fields
4. Add instance methods if needed
5. Add static methods for complex queries

**Example:**
```javascript
// src/models/menu.model.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

// Add index for search
menuItemSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
```

### 2. Create the Service

**Location:** `src/services/`

**Steps:**
1. Create: `{entity}.service.js`
2. Implement business logic functions
3. Handle data validation and transformation
4. Interact with models

**Example:**
```javascript
// src/services/menu.service.js
const MenuItem = require('../models/menu.model');

class MenuService {
  async getAllMenuItems(filters = {}) {
    const { category, minPrice, maxPrice, search } = filters;
    const query = { isAvailable: true };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    return await MenuItem.find(query).sort({ createdAt: -1 });
  }

  async createMenuItem(data) {
    // Business logic: check for duplicates, validate price, etc.
    const existing = await MenuItem.findOne({ name: data.name });
    if (existing) {
      throw new Error('Menu item with this name already exists');
    }

    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    return await MenuItem.create(data);
  }

  async updateMenuItemAvailability(id, isAvailable) {
    const item = await MenuItem.findById(id);
    if (!item) {
      throw new Error('Menu item not found');
    }

    item.isAvailable = isAvailable;
    return await item.save();
  }
}

module.exports = new MenuService();
```

### 3. Create the Controller

**Location:** `src/controllers/`

**Steps:**
1. Create: `{entity}.controller.js`
2. Import corresponding service
3. Handle HTTP request/response only
4. Extract params/query/body
5. Call service methods
6. Return formatted responses

**Responsibilities:**
- ✅ Parse request data
- ✅ Call service methods
- ✅ Format responses
- ❌ NO business logic here!
- ❌ NO direct database calls!

**Response Format:**
```javascript
// Success
res.status(200).json({
  success: true,
  data: result,
  message: 'Operation successful' // optional
});

// Error
res.status(400).json({
  success: false,
  message: 'Error description'
});
```

**Example:**
```javascript
// src/controllers/menu.controller.js
const menuService = require('../services/menu.service');

exports.getAllMenuItems = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search
    };

    const items = await menuService.getAllMenuItems(filters);
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const item = await menuService.createMenuItem(req.body);
    
    res.status(201).json({
      success: true,
      data: item,
      message: 'Menu item created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

### 4. Define Routes

**Location:** `src/routes/`

**Steps:**
1. Create: `{entity}.routes.js`
2. Import controller methods
3. Apply middleware (auth, validation)
4. Define HTTP methods and paths

**Example:**
```javascript
// src/routes/menu.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const menuController = require('../controllers/menu.controller');

// Public routes
router.get('/', menuController.getAllMenuItems);
router.get('/:id', menuController.getMenuItemById);

// Protected routes (Admin only)
router.post('/', 
  protect, 
  authorize('admin', 'super_admin'), 
  menuController.createMenuItem
);

router.put('/:id', 
  protect, 
  authorize('admin', 'super_admin'), 
  menuController.updateMenuItem
);

module.exports = router;
```

### 5. Add Middleware (if needed)

**Location:** `src/middleware/`

**Common Middleware:**
- `auth.middleware.js` - JWT authentication
- `validation.middleware.js` - Request validation
- `upload.middleware.js` - File uploads
- `error.middleware.js` - Error handling

**Example:**
```javascript
// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    next();
  };
};
```

### 6. Register Routes in Server

**Location:** `server.js`

Add the route to the main server file:

```javascript
// server.js
app.use('/api/menu', require('./src/routes/menu.routes'));
app.use('/api/orders', require('./src/routes/order.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));
```

### 7. Test with Postman/Thunder Client

**Test Cases:**
1. ✅ Happy path (valid data)
2. ✅ Invalid data (validation errors)
3. ✅ Authentication required
4. ✅ Authorization (role checks)
5. ✅ Not found (invalid IDs)

## Naming Conventions

### Files
- Models: `{entity}.model.js` (singular, lowercase)
- Services: `{entity}.service.js`
- Controllers: `{entity}.controller.js`
- Routes: `{entity}.routes.js`
- Middleware: `{purpose}.middleware.js`

### Functions
- Services: `verbNoun` (e.g., `getAllMenuItems`, `createOrder`)
- Controllers: `verbNoun` (e.g., `getAllMenuItems` - just calls service)
- Middleware: `descriptiveName` (e.g., `protect`, `validateRequest`)

### Variables
- camelCase for variables and functions
- PascalCase for Models

## API Response Standards

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Common Patterns

### 1. Pagination
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const items = await Model.find().skip(skip).limit(limit);
const total = await Model.countDocuments();

res.json({
  success: true,
  data: items,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
});
```

### 2. Search & Filter
```javascript
const { search, category, minPrice, maxPrice } = req.query;

const query = {};

if (search) {
  query.$text = { $search: search };
}
if (category) {
  query.category = category;
}
if (minPrice || maxPrice) {
  query.price = {};
  if (minPrice) query.price.$gte = Number(minPrice);
  if (maxPrice) query.price.$lte = Number(maxPrice);
}

const items = await Model.find(query);
```

### 3. Populate References
```javascript
const order = await Order.findById(id)
  .populate('customer', 'name email')
  .populate('items.menuItem', 'name price');
```

## Git Workflow

### Branch Naming
- Feature: `feat/menu-management`
- Bugfix: `fix/order-validation`
- Hotfix: `hotfix/payment-error`

### Commit Message Format
```
type(scope): description

feat(menu): add menu item creation endpoint
fix(auth): resolve JWT token expiration issue
docs(readme): update API documentation
```

## Testing Checklist

Before pushing code:

- [ ] Server starts without errors
- [ ] All routes respond correctly
- [ ] Authentication works
- [ ] Authorization is enforced
- [ ] Validation catches invalid data
- [ ] Database operations succeed
- [ ] Error handling is implemented
- [ ] Console has no warnings

## Example: Adding Order Feature

**1. Model** (`src/models/order.model.js`)
```javascript
const orderSchema = new mongoose.Schema({
  table: { type: String, required: true },
  items: [{ menuItem: ObjectId, quantity: Number }],
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'preparing', 'ready', 'served'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true }
}, { timestamps: true });
```

**2. Service** (`src/services/order.service.js`)
```javascript
class OrderService {
  async createOrder(orderData) {
    // Business logic: calculate total, validate items
    const total = orderData.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    return await Order.create({
      ...orderData,
      totalAmount: total
    });
  }

  async updateOrderStatus(id, status, userId) {
    // Business logic: validate status transition
    const order = await Order.findById(id);
    if (!order) throw new Error('Order not found');
    
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: ['preparing'],
      preparing: ['ready'],
      ready: ['served']
    };
    
    if (!validTransitions[order.status]?.includes(status)) {
      throw new Error('Invalid status transition');
    }
    
    order.status = status;
    return await order.save();
  }
}

module.exports = new OrderService();
```

**3. Controller** (`src/controllers/order.controller.js`)
```javascript
const orderService = require('../services/order.service');

exports.createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id, 
      req.body.status,
      req.user.id
    );
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
```

**4. Routes** (`src/routes/order.routes.js`)
```javascript
router.post('/', createOrder);
router.get('/', protect, authorize('admin', 'waiter'), getOrders);
router.patch('/:id/status', protect, updateOrderStatus);
```

**5. Register** (`server.js`)
```javascript
app.use('/api/orders', require('./src/routes/order.routes'));
```

**6. Test** with Postman ✅

---

**Follow this workflow for every new feature to maintain consistency!**
