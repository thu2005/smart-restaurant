# API Documentation - Smart Restaurant QR Ordering System

## Table of Contents
- [Base Information](#base-information)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Restaurant Management](#restaurant-management)
- [Table Management](#table-management)
- [Menu Management](#menu-management)
- [Cart Management](#cart-management)
- [Order Management](#order-management)
- [Kitchen Management](#kitchen-management)
- [Payment Management](#payment-management)
- [Report & Analytics](#report--analytics)
- [Review Management](#review-management)

---

## Base Information

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Common Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### User Roles
- `SUPER_ADMIN` - System administrator
- `ADMIN` - Restaurant owner/manager
- `WAITER` - Waiter staff
- `KITCHEN` - Kitchen staff
- `CUSTOMER` - Customer

---

## Authentication

### Register New User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "CUSTOMER",
  "phone": "+84 90 123 4567"
}
```

**Validation Rules:**
- Email: Valid email format, required
- Password: Min 8 characters, must include uppercase, lowercase, number, and special character
- Full Name: Min 2 characters, letters and spaces only
- Role: Must be one of: CUSTOMER, WAITER, KITCHEN, ADMIN

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER",
      "emailVerified": false
    },
    "token": "jwt_token_here"
  }
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER",
      "restaurantId": "uuid or null"
    },
    "token": "jwt_token_here"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "CUSTOMER",
    "phone": "+84 90 123 4567",
    "avatar": "url_to_avatar",
    "isActive": true,
    "emailVerified": true
  }
}
```

---

### Update Profile
**PUT** `/auth/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "phone": "+84 90 999 8888"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Jane Doe",
    "phone": "+84 90 999 8888"
  }
}
```

---

### Change Password
**PUT** `/auth/password`

Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### Upload/Update Avatar
**POST** `/auth/avatar` or **PUT** `/auth/avatar`

Upload or update user avatar image.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `avatar`: Image file (max 5MB, jpg/png)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avatar": "http://localhost:5000/uploads/avatars/avatar-uuid-timestamp.jpg"
  }
}
```

---

### Google OAuth
**GET** `/auth/google`

Initiate Google OAuth login flow.

**GET** `/auth/google/callback`

Google OAuth callback endpoint.

---

### Email Verification
**GET** `/auth/verify-email/:token`

Verify email address using token sent to email.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

---

### Reset Password
**POST** `/auth/reset-password/:token`

Reset password using token from email.

**Request Body:**
```json
{
  "password": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## User Management

*(Admin/Super Admin only)*

### Get All Users
**GET** `/users`

**Auth:** ADMIN, SUPER_ADMIN

**Query Parameters:**
- `restaurantId` (optional): Filter by restaurant
- `role` (optional): Filter by role
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "waiter@example.com",
      "fullName": "John Waiter",
      "role": "WAITER",
      "isActive": true,
      "restaurantId": "uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Create User (Staff)
**POST** `/users`

**Auth:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "email": "staff@example.com",
  "password": "SecurePass123!",
  "fullName": "New Staff",
  "role": "WAITER",
  "restaurantId": "uuid",
  "phone": "+84 90 123 4567"
}
```

---

### Update User
**PUT** `/users/:id`

**Auth:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "role": "KITCHEN",
  "isActive": true
}
```

---

### Delete User
**DELETE** `/users/:id`

**Auth:** ADMIN, SUPER_ADMIN

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Restaurant Management

### Get Restaurants
**GET** `/restaurants`

**Auth:** SUPER_ADMIN

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Café Poirot",
      "description": "Fine dining experience",
      "address": "123 Street, City",
      "phone": "+84 28 3823 4567",
      "email": "contact@cafe.com",
      "timezone": "Asia/Ho_Chi_Minh",
      "currency": "VND",
      "isActive": true
    }
  ]
}
```

---

### Create Restaurant
**POST** `/restaurants`

**Auth:** SUPER_ADMIN

**Request Body:**
```json
{
  "name": "New Restaurant",
  "description": "Restaurant description",
  "address": "123 Street",
  "phone": "+84 28 1234 5678",
  "email": "contact@restaurant.com",
  "timezone": "Asia/Ho_Chi_Minh",
  "currency": "VND"
}
```

---

### Update Restaurant
**PUT** `/restaurants/:id`

**Auth:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "phone": "+84 28 9999 8888"
}
```

---

## Table Management

### Get All Tables
**GET** `/tables`

**Auth:** ADMIN, WAITER

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `status` (optional): Filter by status (AVAILABLE, OCCUPIED, RESERVED, CLEANING)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tableNumber": "T01",
      "capacity": 4,
      "location": "Ground Floor",
      "status": "AVAILABLE",
      "qrCode": "unique_qr_token",
      "qrCodeUrl": "url_to_qr_image",
      "isActive": true
    }
  ]
}
```

---

### Create Table
**POST** `/tables`

**Auth:** ADMIN

**Request Body:**
```json
{
  "tableNumber": "T15",
  "capacity": 6,
  "location": "First Floor",
  "restaurantId": "uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tableNumber": "T15",
    "qrCode": "generated_unique_token",
    "qrCodeUrl": "http://localhost:5000/uploads/qr/table-uuid.png"
  }
}
```

---

### Update Table
**PUT** `/tables/:id`

**Auth:** ADMIN

**Request Body:**
```json
{
  "capacity": 8,
  "location": "VIP Room",
  "status": "RESERVED"
}
```

---

### Delete Table
**DELETE** `/tables/:id`

**Auth:** ADMIN

---

### Generate QR Code
**POST** `/tables/:id/qr`

**Auth:** ADMIN

Generate new QR code for table.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "qrCode": "new_unique_token",
    "qrCodeUrl": "http://localhost:5000/uploads/qr/table-uuid.png"
  }
}
```

---

## Menu Management

### Public Endpoints (No Auth Required)

#### Get All Categories (Public)
**GET** `/menu/:restaurantId/categories`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Main Courses",
      "description": "Our signature dishes",
      "displayOrder": 1,
      "isActive": true,
      "menuItems": [ /* array of menu items */ ]
    }
  ]
}
```

---

#### Get Menu Items (Public)
**GET** `/menu/:restaurantId/items`

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `search` (optional): Search by name
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `sortBy` (optional): Sort field (name, price, orderCount)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Grilled Salmon Steak",
      "description": "Premium Norwegian salmon...",
      "price": 245000,
      "image": "image_url",
      "categoryId": "uuid",
      "prepTime": 20,
      "isPopular": true,
      "isChefRecommended": true,
      "dietary": ["gluten-free"],
      "isAvailable": true,
      "stockStatus": "available",
      "orderCount": 189
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### Get Menu Item by ID
**GET** `/menu/:restaurantId/items/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Grilled Salmon Steak",
    "description": "Premium Norwegian salmon grilled to perfection...",
    "price": 245000,
    "image": "image_url",
    "prepTime": 20,
    "nutritionalInfo": {
      "calories": 520,
      "protein": "42g",
      "carbs": "28g",
      "fat": "26g"
    },
    "ingredients": ["Norwegian Salmon", "Asparagus", "Potatoes"],
    "allergens": ["Fish", "Dairy"],
    "modifierGroups": [
      {
        "id": "uuid",
        "name": "Add Sides",
        "selectionType": "multiple",
        "modifierType": "addon",
        "options": [
          {
            "id": "uuid",
            "name": "French Fries",
            "priceAdjustment": 25000
          }
        ]
      }
    ],
    "photos": [
      {
        "url": "photo_url_1",
        "isPrimary": true
      }
    ]
  }
}
```

---

#### Get Popular Items
**GET** `/menu/:restaurantId/items/popular`

**Query Parameters:**
- `limit` (default: 10): Number of items

---

#### Get Nutritional Info
**GET** `/menu/:restaurantId/items/:id/nutrition`

---

#### Get Related Items
**GET** `/menu/:restaurantId/items/:id/related`

---

### Admin Endpoints (Protected)

#### Create Category
**POST** `/menu/categories`

**Auth:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "name": "Desserts",
  "description": "Sweet endings",
  "restaurantId": "uuid",
  "displayOrder": 6,
  "isActive": true
}
```

---

#### Update Category
**PUT** `/menu/categories/:id`

**Auth:** ADMIN, SUPER_ADMIN

---

#### Create Menu Item
**POST** `/menu/items`

**Auth:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "name": "New Dish",
  "description": "Delicious dish description",
  "price": 150000,
  "categoryId": "uuid",
  "restaurantId": "uuid",
  "prepTime": 15,
  "isPopular": false,
  "isChefRecommended": false,
  "dietary": ["vegetarian"],
  "nutritionalInfo": {
    "calories": 450,
    "protein": "25g",
    "carbs": "40g",
    "fat": "15g"
  },
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "allergens": ["Dairy"],
  "isAvailable": true,
  "stockStatus": "available"
}
```

---

#### Update Menu Item
**PUT** `/menu/items/:id`

**Auth:** ADMIN, SUPER_ADMIN

---

#### Delete Menu Item
**DELETE** `/menu/items/:id`

**Auth:** ADMIN, SUPER_ADMIN

---

#### Upload Menu Item Image
**POST** `/menu/items/:id/image`

**Auth:** ADMIN, SUPER_ADMIN

**Content-Type:** multipart/form-data

**Form Data:**
- `image`: Image file

---

#### Create Modifier Group
**POST** `/menu/modifiers`

**Auth:** ADMIN, SUPER_ADMIN

**Request Body:**
```json
{
  "name": "Spiciness Level",
  "selectionType": "single",
  "modifierType": "choice",
  "isRequired": true,
  "restaurantId": "uuid",
  "options": [
    { "name": "Mild", "priceAdjustment": 0 },
    { "name": "Hot", "priceAdjustment": 5000 }
  ]
}
```

---

## Cart Management

### Get Cart
**GET** `/carts/:tableId`

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `sessionId` (optional): Session identifier

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tableId": "uuid",
    "customerId": "uuid or null",
    "cartItems": [
      {
        "id": "uuid",
        "menuItemId": "uuid",
        "quantity": 2,
        "modifiers": ["modifier1_id", "modifier2_id"],
        "specialInstructions": "No onions",
        "menuItem": {
          "name": "Grilled Salmon",
          "price": 245000,
          "image": "url"
        }
      }
    ]
  }
}
```

---

### Add Item to Cart
**POST** `/carts/:tableId/items`

**Request Body:**
```json
{
  "menuItemId": "uuid",
  "quantity": 2,
  "modifiers": ["modifier_uuid_1", "modifier_uuid_2"],
  "specialInstructions": "Extra spicy",
  "restaurantId": "uuid",
  "sessionId": "optional_session_id"
}
```

---

### Update Cart Item
**PUT** `/carts/:tableId/items/:itemId`

**Request Body:**
```json
{
  "quantity": 3,
  "modifiers": ["modifier_uuid_1"],
  "specialInstructions": "No spice"
}
```

---

### Remove Item from Cart
**DELETE** `/carts/:tableId/items/:itemId`

---

### Clear Cart
**DELETE** `/carts/:tableId`

---

## Order Management

### Create Order (Customer)
**POST** `/orders`

**Request Body:**
```json
{
  "restaurantId": "uuid",
  "tableId": "uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "modifiers": ["modifier_id"],
      "specialInstructions": "No onions"
    }
  ],
  "customerName": "John Doe",
  "customerPhone": "+84 90 123 4567",
  "specialInstructions": "Please serve quickly"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-0051",
    "status": "SUBMITTED",
    "tableId": "uuid",
    "customerId": "uuid or null",
    "orderItems": [ /* items array */ ],
    "createdAt": "2024-01-18T12:00:00Z"
  }
}
```

---

### Get Orders (Staff)
**GET** `/orders`

**Auth:** ADMIN, WAITER, KITCHEN

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `status` (optional): Filter by status
- `page`, `limit`: Pagination

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-0051",
      "status": "SUBMITTED",
      "table": {
        "tableNumber": "T05",
        "location": "Ground Floor"
      },
      "orderItems": [ /* items */ ],
      "createdAt": "2024-01-18T12:00:00Z"
    }
  ]
}
```

---

### Get Active Order by Table
**GET** `/orders/active`

**Query Parameters:**
- `tableId` (required): Table ID
- `restaurantId` (required): Restaurant ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-0051",
    "status": "RECEIVED",
    /* full order details */
  }
}
```

---

### Get Order by ID
**GET** `/orders/:id`

**Auth:** Required (Customer can view own orders, Staff can view all)

---

### Update Order Status
**PATCH** `/orders/:id/status`

**Auth:** ADMIN, WAITER, KITCHEN

**Request Body:**
```json
{
  "status": "RECEIVED"
}
```

**Status Flow:**
```
SUBMITTED → RECEIVED → PREPARING → READY → SERVED → PAYMENT_PENDING → COMPLETED
           ↘ REJECTED
```

---

### Add Items to Order
**POST** `/orders/:orderId/items`

Add more items to existing order.

**Request Body:**
```json
{
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 1,
      "modifiers": [],
      "specialInstructions": ""
    }
  ]
}
```

---

### Create/Request Bill
**POST** `/orders/:id/bill`

Generate bill for order (changes status to PAYMENT_PENDING).

**Auth:** WAITER, ADMIN (or customer via `/orders/:id/request-bill`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "billId": "uuid",
    "billNumber": "BILL-1234",
    "orderId": "uuid",
    "subtotal": 500000,
    "tax": 50000,
    "discount": 0,
    "total": 550000
  }
}
```

---

### Get Bill Details
**GET** `/orders/:id/bill`

---

### Get Bill by Bill ID
**GET** `/orders/bill/:billId`

---

### Download Bill PDF
**GET** `/orders/:id/bill/pdf`

**Response:** PDF file stream

---

### Apply Discount
**POST** `/orders/:id/discount`

**Auth:** ADMIN, WAITER

**Request Body:**
```json
{
  "amount": 50000
}
```

---

### Get Waiter's Tables
**GET** `/orders/waiter/my-tables`

**Auth:** WAITER

Get tables assigned to logged-in waiter.

---

### Get Waiter's Orders
**GET** `/orders/waiter/my-orders`

**Auth:** WAITER

**Query Parameters:**
- `status` (optional): Filter by status

---

## Kitchen Management

### Get Kitchen Orders
**GET** `/kitchen/orders`

**Auth:** KITCHEN, ADMIN

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `status` (optional): Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-0051",
      "status": "PREPARING",
      "table": { "tableNumber": "T05" },
      "orderItems": [
        {
          "id": "uuid",
          "menuItem": { "name": "Grilled Salmon" },
          "quantity": 2,
          "itemStatus": "cooking",
          "specialInstructions": "Well done"
        }
      ]
    }
  ]
}
```

---

### Update Order Item Status (Kitchen)
**PATCH** `/orders/:orderId/items/:itemId/status`

**Auth:** KITCHEN, ADMIN

**Request Body:**
```json
{
  "itemStatus": "ready"
}
```

**Item Statuses:**
- `queued` - Waiting to be cooked
- `cooking` - Currently being prepared
- `ready` - Ready to serve

---

## Payment Management

### Create Payment
**POST** `/payments`

**Request Body:**
```json
{
  "orderId": "uuid",
  "method": "MOMO",
  "amount": 550000,
  "tip": 0
}
```

**Payment Methods:**
- `MOMO`
- `ZALOPAY`
- `VNPAY`
- `STRIPE`
- `CASH`
- `CARD_AT_COUNTER`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "method": "MOMO",
    "status": "PENDING",
    "amount": 550000,
    "total": 550000,
    "gatewayResponse": { /* payment gateway data */ }
  }
}
```

---

### Get Payment by Order ID
**GET** `/payments/order/:orderId`

---

## Report & Analytics

*(Admin only)*

### Get Dashboard Stats
**GET** `/reports/dashboard`

**Auth:** ADMIN

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `period` (optional): today, week, month, year

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15000000,
    "totalOrders": 245,
    "averageOrderValue": 61224,
    "topSellingItems": [ /* array */ ],
    "revenueByDay": [ /* array */ ]
  }
}
```

---

### Get Revenue Report
**GET** `/reports/revenue`

**Auth:** ADMIN

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `groupBy` (optional): day, week, month

---

### Get Popular Items
**GET** `/reports/popular-items`

**Auth:** ADMIN

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `limit` (default: 10): Number of items

---

### Get Order Statistics
**GET** `/reports/orders`

**Auth:** ADMIN

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `startDate`, `endDate`: Date range

---

## Review Management

### Create Review
**POST** `/reviews`

**Auth:** CUSTOMER

**Request Body:**
```json
{
  "menuItemId": "uuid",
  "rating": 5,
  "comment": "Excellent dish!"
}
```

---

### Get Reviews for Menu Item
**GET** `/reviews/item/:menuItemId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excellent!",
      "user": {
        "fullName": "John Doe"
      },
      "createdAt": "2024-01-18T12:00:00Z"
    }
  ],
  "averageRating": 4.8
}
```

---

## Notes for Extension

This API documentation template is structured to be easily extended. When adding new endpoints:

1. **Identify the Section** - Group related endpoints together
2. **Follow the Pattern:**
   ```markdown
   ### Endpoint Name
   **METHOD** `/path`
   
   Brief description.
   
   **Auth:** Required roles (if applicable)
   
   **Request Body/Query Parameters:**
   ```json
   { ... }
   ```
   
   **Response (Status Code):**
   ```json
   { ... }
   ```
   ```

3. **Include:**
   - HTTP method and path
   - Authentication requirements
   - Request parameters/body with examples
   - Response format with status codes
   - Error cases (if significant)

4. **Maintain Consistency:**
   - Use the same JSON formatting
   - Keep descriptions concise
   - Include all required fields

---

## Additional Resources

- **Swagger UI**: `http://localhost:5000/api-docs` - Interactive API documentation
- **Database Schema**: See [DATABASE.md](./DATABASE.md)
- **Setup Guide**: See [SETUP.md](./SETUP.md)
