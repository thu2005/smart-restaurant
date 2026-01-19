# API Documentation - Smart Restaurant QR Ordering System

Welcome to the comprehensive API documentation for the Smart Restaurant QR Ordering System. This document details every endpoint, parameter, request structure, and response format available in the backend system.

## 📚 Table of Contents

1. [General Information](#general-information)
   - [Base URL](#base-url)
   - [Authentication & Security](#authentication--security)
   - [Response Format](#response-format)
   - [Error Handling](#error-handling)
   - [Pagination](#pagination)
   - [Data Types & Validation](#data-types--validation)
2. [Authentication Module](#authentication-module)
3. [User Management Module](#user-management-module)
4. [Restaurant Management Module](#restaurant-management-module)
5. [Table Management & QR Codes](#table-management--qr-codes)
6. [Menu Management Module](#menu-management-module)
   - [Categories](#categories)
   - [Menu Items](#menu-items)
   - [Modifiers & Options](#modifiers--options)
   - [Photos & Nutrition](#photos--nutrition)
7. [Cart & Session Module](#cart--session-module)
8. [Order Management Module](#order-management-module)
   - [Order Lifecycle](#order-lifecycle)
   - [Billing & Discounts](#billing--discounts)
9. [Kitchen Display System (KDS)](#kitchen-display-system-kds)
10. [Payment Gateway Module](#payment-gateway-module)
11. [Reporting & Analytics](#reporting--analytics)
12. [Customer Reviews](#customer-reviews)

---

## General Information

### Base URL
All API requests should be prefixed with the api version path.
```text
Development: http://localhost:5001/api
Production:  https://your-domain.com/api
```

### Authentication & Security
The API uses **JWT (JSON Web Token)** for securing endpoints.
- **Token Type**: Bearer
- **Header Key**: `Authorization`
- **Header Value**: `Bearer <your_access_token>`

**User Roles & Permissions:**
| Role | Access Level | Description |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Level 0 | Full system access. Can manage restaurants and admins. |
| `ADMIN` | Level 1 | Restaurant owner. Manages menu, staff, and settings. |
| `WAITER` | Level 2 | Staff. Manages orders, tables, and payments. |
| `KITCHEN` | Level 3 | Kitchen Staff. View and update order statuses. |
| `CUSTOMER` | Level 4 | End-users. authenticated or guest via session. |

### Response Format
All responses strictly follow a unified JSON envelope structure.

**Successful Response (200/201):**
```json
{
  "success": true,
  "message": "Optional user-friendly message",
  "data": {
    // Response payload goes here
  },
  "pagination": { // Only present for list endpoints
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Status Codes:**
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `204 No Content`: Request succeeded but no data to return.

### Error Handling
Errors are returned with a consistent structure to aid debugging.

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "message": "Invalid credentials provided",
  "error": "UnauthorizedAccess", // Error code if available
  "stack": "..." // Only visible in NODE_ENV=development
}
```

- `400 Bad Request`: Validation failed or invalid input.
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Authenticated user lacks permission.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Server-side processing error.

---

## Authentication Module

### 1. Register New User
Create a new user account. This endpoint supports creating Customers, and also Staff roles (though Staff are usually created by Admins).

**Endpoint:** `POST /auth/register`
**Access:** Public

**Request Body Schema:**
| Field | Type | Required | Description | Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `email` | string | Yes | User's email address | Must be valid email format. |
| `password` | string | Yes | Account password | Min 8 chars. Must contain 1 lowercase, 1 uppercase, 1 number, 1 special char. |
| `fullName` | string | Yes | User's full name | Min 2 chars. Letters and spaces only. |
| `role` | string | Yes | User Role | Enum: `CUSTOMER`, `WAITER`, `KITCHEN`, `ADMIN` |
| `phone` | string | No | Phone number | Optional. |

**Example Request:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "fullName": "Alice Wonderland",
  "role": "CUSTOMER",
  "phone": "+1234567890"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "email": "customer@example.com",
      "fullName": "Alice Wonderland",
      "role": "CUSTOMER",
      "isEmailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

### 2. Login
Authenticate a user and retrieve an access token.

**Endpoint:** `POST /auth/login`
**Access:** Public

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | Registered email |
| `password` | string | Yes | Plain text password |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "customer@example.com",
      "fullName": "Alice Wonderland",
      "role": "CUSTOMER",
      "restaurantId": null // Populated if user is staff
    },
    "token": "eyJhbGciOiJI..."
  }
}
```

### 3. Get Current User Profile
Retrieve full details of the currently authenticated user.

**Endpoint:** `GET /auth/me`
**Access:** Protected (Any Role)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "staff@cafe.com",
    "fullName": "John Waiter",
    "role": "WAITER",
    "restaurantId": "rest-uuid",
    "avatar": "http://localhost:5001/uploads/avatars/avatar-123.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 4. Update Profile
Update personal information for the logged-in user.

**Endpoint:** `PUT /auth/profile`
**Access:** Protected (Any Role)

**Request Body:**
| Field | Type | Description | Validation |
| :--- | :--- | :--- | :--- |
| `fullName` | string | New full name | Min 2 chars, letters/spaces. |
| `phone` | string | New phone number | Valid phone format. |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "John Updated",
    "phone": "+987654321"
  }
}
```

### 5. Change Password
Securely update the user's password.

**Endpoint:** `PUT /auth/password`
**Access:** Protected (Any Role)

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `oldPassword` | string | Yes | Current active password |
| `newPassword` | string | Yes | New password (Validation rules apply) |

### 6. Upload Avatar
Upload a profile picture.

**Endpoint:** `POST /auth/avatar` (or `PUT /auth/avatar`)
**Access:** Protected
**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `avatar` | File | Yes | Image file (JPG/PNG). Max 5MB. |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avatar": "http://localhost:5001/uploads/avatars/avatar-userid-timestamp.jpg"
  }
}
```

### 7. Global Social Auth (Google)

**Initiate Login:**
`GET /auth/google`
Redirects the user to Google's permissions page.

**Callback:**
`GET /auth/google/callback`
Handles the response from Google. If successful, redirects to the frontend dashboard with `?token=...`. If failed, redirects to login page.

---

## User Management Module
*These endpoints are used by Administrators to manage their staff.*

### 1. Get All Users
Fetch a paginated list of users.

**Endpoint:** `GET /users`
**Access:** `ADMIN`, `SUPER_ADMIN`

**Query Parameters:**
| Param | Type | Description |
| :--- | :--- | :--- |
| `restaurantId` | UUID | Filter by restaurant (Implicit for ADMIN) |
| `role` | enum | Filter by role (`WAITER`, `KITCHEN`) |
| `isActive` | boolean | Filter by active status |
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20) |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "Staff Member",
      "role": "WAITER",
      "email": "waiter@rest.com",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 2. Create Staff User
Create a new account for a staff member.

**Endpoint:** `POST /users`
**Access:** `ADMIN`, `SUPER_ADMIN`

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | Staff email |
| `password` | string | Yes | Initial password |
| `fullName` | string | Yes | Staff name |
| `role` | string | Yes | `WAITER` or `KITCHEN` (Admin can create Admins) |
| `restaurantId` | string | Yes | ID of the restaurant they belong to |

### 3. Update User
Modify a user's details.

**Endpoint:** `PUT /users/:id`
**Access:** `ADMIN`, `SUPER_ADMIN`

**Request Body:**
Any combination of `fullName`, `role`, `email`, `phone`.

### 4. Toggle Active Status
Quickly activate or deactivate a user account (e.g., if a staff member quits).

**Endpoint:** `PATCH /users/:id/status`
**Access:** `ADMIN`, `SUPER_ADMIN`

**Request Body:**
```json
{
  "isActive": false
}
```

### 5. Delete User
Permanently remove a user account.

**Endpoint:** `DELETE /users/:id`
**Access:** `ADMIN`, `SUPER_ADMIN`

---

## Restaurant Management Module

### 1. Get All Restaurants
**Endpoint:** `GET /restaurants`
**Access:** Public (or restricted based on configuration)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "The Gourmet Kitchen",
      "address": "123 Food St",
      "logo": "http://.../logo.png",
      "phone": "+123444",
      "currency": "USD"
    }
  ]
}
```

### 2. Create Restaurant
**Endpoint:** `POST /restaurants`
**Access:** `SUPER_ADMIN`

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Restaurant Name |
| `address` | string | No | Physical Address |
| `phone` | string | No | Contact Phone |
| `description` | string | No | Short bio |
| `currency` | string | No | Default currency (e.g. 'USD', 'VND') |

### 3. Upload Logo
**Endpoint:** `POST /restaurants/:id/logo`
**Access:** `ADMIN`, `SUPER_ADMIN`
**Form Data:** `logo` (File).

---

## Table Management & QR Codes

### 1. Create Table
Add a physical table to the system.

**Endpoint:** `POST /tables`
**Access:** `ADMIN`

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `restaurantId` | UUID | Yes | Link to restaurant |
| `tableNumber` | string | Yes | e.g. "T-01", "Out-05" |
| `capacity` | int | No | Max seats |
| `location` | string | No | e.g. "Patio", "Main Hall" |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tableNumber": "T-01",
    "qrCode": "unique-token-string",
    "qrCodeUrl": "http://.../qr.png"
  }
}
```

### 2. Generate QR Code
Generate or re-generate the unique QR token for a table.

**Endpoint:** `POST /tables/:id/qr/generate`
**Access:** `ADMIN`

**Response:** Returns the new QR code string and URL.

### 3. Download QR Codes

**Single Table Download:**
`GET /tables/:id/qr/download`
- **Query Params:** `format` (`png` or `pdf`).

**Bulk Download (All Tables):**
`GET /tables/qr/download-all`
- **Query Params:**
  - `restaurantId`: Required.
  - `format`: `zip` (images) or `pdf` (document).
  - `layout`: `single` (1 per page) or `grid` (multiple per page) - *PDF only*.

### 4. Update Table Status
Manually update table status (rarely used as system updates automatically, but useful for 'Cleaning' status).

**Endpoint:** `PUT /tables/:id`
**Access:** `ADMIN`, `WAITER`

**Request Body:**
```json
{
  "status": "CLEANING" // AVAILABLE, OCCUPIED, RESERVED, CLEANING
}
```

---

## Menu Management Module
This is the core module for managing what customers can order.

### --- Categories ---

### 1. Create Category
**Endpoint:** `POST /menu/categories`
**Access:** `ADMIN`

**Request Body:**
```json
{
  "name": "Appetizers",
  "description": "Starters",
  "displayOrder": 1,
  "restaurantId": "uuid"
}
```

### 2. Get Categories (Public)
Fetch the menu structure.

**Endpoint:** `GET /menu/:restaurantId/categories`
**Access:** Public

**Response:** Returns categories array, each containing a `menuItems` array.

### --- Menu Items ---

### 1. Create Menu Item
**Endpoint:** `POST /menu/items`
**Access:** `ADMIN`

**Request Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Dish name (Max 80 chars) |
| `price` | number | Yes | Base price |
| `categoryId` | UUID | Yes | Parent category |
| `restaurantId` | UUID | Yes | Restaurant ID |
| `description` | string | No | Details about dish |
| `prepTime` | int | No | Minutes to prepare |
| `isPopular` | bool | No | Highlight as popular |
| `dietary` | array | No | `["vegan", "spicy"]` |
| `stockStatus` | enum | No | `in_stock`, `out_of_stock` |

### 2. Update Nutrition Info
**Endpoint:** `PUT /menu/items/:id/nutrition`
**Access:** `ADMIN`

**Request Body:**
```json
{
  "nutritionalInfo": {
    "calories": 500,
    "protein": "30g",
    "carbs": "45g",
    "fat": "20g"
  },
  "ingredients": ["Beef", "Salt", "Pepper"],
  "allergens": ["Gluten"]
}
```

### --- Modifiers & Options ---
Modifiersallow for customization (e.g., "Size", "Toppings").

### 1. Create Modifier Group
**Endpoint:** `POST /menu/modifier-groups`
**Access:** `ADMIN`

**Request Body:**
```json
{
  "name": "Pizza Size",
  "selectionType": "single", // single = radio, multiple = checkbox
  "isRequired": true,
  "minSelections": 1,
  "maxSelections": 1,
  "restaurantId": "uuid"
}
```

### 2. Attach Modifier to Item
Link a modifier group to a specific menu item.

**Endpoint:** `POST /menu/items/:id/modifier-groups`
**Access:** `ADMIN`

**Request Body:**
```json
{
  "groupIds": ["group-uuid-1", "group-uuid-2"]
}
```

### 3. Create Modifier Option
Add choices to a group (e.g., "Small", "Large").

**Endpoint:** `POST /menu/modifier-groups/:groupId/options`
**Access:** `ADMIN`

**Request Body:**
```json
{
  "name": "Large (+ $2.00)",
  "priceAdjustment": 2.00
}
```

---

## Cart & Session Module
Handles the temporary state of a customer's selection before ordering.

### 1. Initialize Cart (Session)
Call this when a user scans a QR code to establish a session.

**Endpoint:** `POST /carts/session`
**Access:** Public

**Request Body:**
```json
{
  "tableId": "uuid-from-qr",
  "restaurantId": "uuid",
  "sessionId": "existing-session-id-if-any"
}
```

**Response:** Returns a `cart` object.

### 2. Add Item to Cart
**Endpoint:** `POST /carts/:cartId/items`
**Access:** Public

**Request Body:**
```json
{
  "menuItemId": "uuid",
  "quantity": 2,
  "modifiers": [
    "option-uuid-1", // e.g. Large
    "option-uuid-2"  // e.g. Extra Cheese
  ],
  "specialInstructions": "No onions please"
}
```

### 3. Review Cart
**Endpoint:** `GET /carts/:cartId`
**Access:** Public
Returns full cart with calculated totals (subtotal, item totals).

### 4. Checkout (Convert to Order)
**Endpoint:** `POST /carts/:cartId/checkout`
**Access:** Public

**Request Body:**
```json
{
  "customerName": "Guest John", // Optional
  "customerPhone": "555-0123",  // Optional
  "specialInstructions": "Allergy to peanuts" // Order-level note
}
```

**Success Response (201 Created):**
Returns the newly created `Order` object. The cart is cleared/deleted.

---

## Order Management Module

### 1. Create Order (Direct)
Alternative to Cart Checkout. Used by waiters taking orders manually.

**Endpoint:** `POST /orders`
**Access:** `WAITER`, `ADMIN`

**Request Body:**
```json
{
  "restaurantId": "uuid",
  "tableId": "uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 1,
      "modifiers": [...]
    }
  ]
}
```

### 2. Get Active Order for Table
Check if a table currently has an open session/order.

**Endpoint:** `GET /orders/active`
**Query:** `?tableId=...&restaurantId=...`

### 3. Add Items to Order
Used for "add-on" orders (e.g., ordering dessert after main course).

**Endpoint:** `POST /orders/:orderId/items`
**Access:** Public/Waiter
Same body structure as adding items to cart.

### 4. Update Order Status
Transition the order through its lifecycle.

**Endpoint:** `PATCH /orders/:id/status`
**Access:** `WAITER`, `KITCHEN`, `ADMIN`

**Request Body:**
```json
{
  "status": "READY"
}
```

**Allowed Statuses:**
- `RECEIVED`: Initial state.
- `PREPARING`: Kitchen has started.
- `READY`: Food is cooked, waiting for waiter.
- `SERVED`: Food delivered to table.
- `COMPLETED`: Paid and closed.
- `CANCELLED`: Voided.

### 5. Update Item Status
Update status of individual items (e.g. Drink is ready, but Burger is cooking).

**Endpoint:** `PATCH /orders/:orderId/items/:itemId/status`
**Access:** `KITCHEN`, `WAITER`

**Request Body:**
```json
{
  "itemStatus": "cooking" // queued, cooking, ready, rejected
}
```

---

## Billing & Discounts

### 1. Request Bill
Customer signals they want to pay.

**Endpoint:** `POST /orders/:id/request-bill`
**Access:** Public
Sets order status to `PAYMENT_PENDING` (or similar logic) and notifies staff.

### 2. Generate Bill
Staff confirms bill generation.

**Endpoint:** `POST /orders/:id/bill`
**Access:** `WAITER`
Finalizes the calculations.

### 3. Get Bill Details
Fetch the final numbers.

**Endpoint:** `GET /orders/:id/bill`
**Response:**
```json
{
  "subtotal": 100.00,
  "tax": 8.00,
  "discount": 0.00,
  "total": 108.00,
  "items": [...]
}
```

### 4. Apply Discount
**Endpoint:** `POST /orders/:id/discount`
**Access:** `ADMIN` (usually restricted)

**Request Body:**
```json
{
  "amount": 10.50 // Fixed amount to deduct
}
```

---

## Kitchen Display System (KDS)

### 1. Get Kitchen Queue
Fetch all active orders that need kitchen attention.

**Endpoint:** `GET /api/kitchen/orders`
**Access:** `KITCHEN`, `ADMIN`

**Query Params:**
- `restaurantId`: Required.
- `status`: Filter, e.g. `RECEIVED` or `PREPARING`.

**Response:** List of orders with nested items details.

### 2. Kitchen Statistics
**Endpoint:** `GET /api/kitchen/stats`
**Access:** `KITCHEN`
Returns data like "Avg Prep Time", "Orders currently in queue".

---

## Payment Gateway Module

### 1. Initiate Payment
**Endpoint:** `POST /payments`
**Access:** Public

**Request Body:**
| Field | Type | Description |
| :--- | :--- | :--- |
| `orderId` | UUID | Order to pay for |
| `amount` | number | Amount to pay |
| `method` | enum | `STRIPE`, `MOMO`, `ZALOPAY`, `CASH`, `CARD_AT_COUNTER` |

### 2. Stripe Integration

**Create Intent:**
`POST /payments/stripe/create-intent`
Returns `clientSecret` for the frontend Stripe Elements.

**Confirm Payment:**
`POST /payments/stripe/confirm`
Verifies the payment with Stripe servers.

**Webhook:**
`POST /payments/webhook`
Listens for Stripe events (success/fail).

### 3. Momo Integration

**Callback:**
`POST /payments/momo/callback`
Endpoint for Momo IPN (Instant Payment Notification).

**Return URL:**
`GET /payments/momo/return`
Where the user is redirected after paying on Momo app.

---

## Reporting & Analytics
*Note: All reports require `ADMIN` or `SUPER_ADMIN` privileges.*

### 1. Revenue Report
**Endpoint:** `GET /reports/revenue`
**Query Params:** `startDate`, `endDate`, `restaurantId`.

**Response:**
```json
{
  "totalRevenue": 50000,
  "totalOrders": 150,
  "averageOrderValue": 333.33
}
```

### 2. Top Selling Items
**Endpoint:** `GET /reports/top-items`
Returns list of items sorted by quantity sold or revenue generated.

### 3. Performance Chart
**Endpoint:** `GET /reports/chart`
**Query Params:** `period` (`daily`, `weekly`, `monthly`).
Returns data points formatted for frontend charting libraries (e.g. Recharts).

### 4. Order Status Stats
**Endpoint:** `GET /reports/order-stats`
Breakdown of orders by status (e.g. how many cancelled vs completed).

### 5. Export PDF
**Endpoint:** `GET /reports/export-pdf`
Returns a binary PDF stream of the selected report.

---

## Customer Reviews

### 1. Get Reviews
**Endpoint:** `GET /reviews/:menuItemId`
**Access:** Public
Paginated list of reviews for a dish.

### 2. Post Review
**Endpoint:** `POST /reviews`
**Access:** Authenticated Users

**Request Body:**
```json
{
  "menuItemId": "uuid",
  "restaurantId": "uuid",
  "rating": 5, // 1-5
  "comment": "Absolutely delicious!"
}
```

---

## Data Models (Reference)

### Menu Item Object
```json
{
  "id": "uuid",
  "name": "String",
  "description": "String",
  "price": Number,
  "image": "URL",
  "isAvailable": Boolean,
  "modifiers": [ ... ],
  "nutritionalInfo": { ... }
}
```

### Order Object
```json
{
  "id": "uuid",
  "tableId": "uuid",
  "status": "RECEIVED",
  "items": [
    {
      "name": "Pizza",
      "quantity": 1,
      "price": 12.00,
      "modifiers": ["Large"]
    }
  ],
  "totalAmount": 12.00,
  "createdAt": "ISO Date"
}
```

---
*Documentation generated for Smart Restaurant System v1.0.0*
