# Backend Testing Guide

This guide provides step-by-step instructions to test the Smart Restaurant API using **Postman** (or Thunder Client/VSCode).

**Base URL**: `http://localhost:5000/api`

---

## Phase 1: Authentication (The Foundation)

Before doing anything else, you need to create users.

### 1. Register a Super Admin
*   **Method**: `POST`
*   **URL**: `/auth/register`
*   **Body (JSON)**:
    ```json
    {
      "email": "admin@smartrestaurant.com",
      "password": "password123",
      "fullName": "Super Admin",
      "role": "SUPER_ADMIN"
    }
    ```
*   **Response**: Save the `token` from the response. You will need it!

### 2. Register a Customer (for testing orders)
*   **Method**: `POST`
*   **URL**: `/auth/register`
*   **Body (JSON)**:
    ```json
    {
      "email": "customer@gmail.com",
      "password": "password123",
      "fullName": "John Doe",
      "role": "CUSTOMER"
    }
    ```

---

## Phase 2: Restaurant Management (Admin Only)

**Auth Required**: Add Header `Authorization: Bearer <SUPER_ADMIN_TOKEN>`

### 3. Create a Restaurant
*   **Method**: `POST`
*   **URL**: `/restaurants`
*   **Body (JSON)**:
    ```json
    {
      "name": "Tasty Burger House",
      "address": "123 Food Street, HCM",
      "phone": "0901234567"
    }
    ```
*   **Response**: Copy the `id` from the response (e.g., `restaurant-uuid-123`). This is your **`restaurantId`**.

### 4. Create Tables for the Restaurant
*   **Method**: `POST`
*   **URL**: `/tables`
*   **Body (JSON)**:
    ```json
    {
      "restaurantId": "<YOUR_RESTAURANT_ID>",
      "tableNumber": "1",
      "capacity": 4,
      "location": "Main Hall"
    }
    ```
*   **Response**: Copy the `id` of this table. This is your **`tableId`**.

---

## Phase 3: Menu Management

**Auth Required**: Add Header `Authorization: Bearer <SUPER_ADMIN_TOKEN>`

### 5. Create a Category
*   **Method**: `POST`
*   **URL**: `/menu/categories`
*   **Body (JSON)**:
    ```json
    {
      "restaurantId": "<YOUR_RESTAURANT_ID>",
      "name": "Burgers"
    }
    ```
*   **Response**: Copy the `id`. This is your **`categoryId`**.

### 6. Create a Menu Item
*   **Method**: `POST`
*   **URL**: `/menu/items`
*   **Body (JSON)**:
    ```json
    {
      "restaurantId": "<YOUR_RESTAURANT_ID>",
      "categoryId": "<YOUR_CATEGORY_ID>",
      "name": "Cheese Burger",
      "price": 50000
    }
    ```
*   **Response**: Copy the `id`. This is your **`menuItemId`**.

---

## Phase 4: Ordering (The Core Flow)

**No Auth Required** (Guest/Customer) or use Customer Token.

### 7. Place an Order
*   **Method**: `POST`
*   **URL**: `/orders`
*   **Body (JSON)**:
    ```json
    {
      "restaurantId": "<YOUR_RESTAURANT_ID>",
      "tableId": "<YOUR_TABLE_ID>",
      "items": [
        {
          "menuItemId": "<YOUR_MENU_ITEM_ID>",
          "quantity": 2
        }
      ]
    }
    ```
*   **Response**: Save the `id` (Order ID) from `data.id`.

### 8. Staff Views Orders
**Auth Required**: Staff/Admin Token
*   **Method**: `GET`
*   **URL**: `/orders?restaurantId=<YOUR_RESTAURANT_ID>&status=SUBMITTED`

### 9. Staff Updates Order Status
**Auth Required**: Staff Token
*   **Method**: `PATCH`
*   **URL**: `/orders/<ORDER_ID>/status`
*   **Body (JSON)**:
    ```json
    {
      "status": "RECEIVED"
    }
    ```

---

## Phase 5: Payment

### 10. Pay for Order
*   **Method**: `POST`
*   **URL**: `/payments`
*   **Body (JSON)**:
    ```json
    {
      "orderId": "<YOUR_ORDER_ID>",
      "restaurantId": "<YOUR_RESTAURANT_ID>",
      "amount": 100000,
      "method": "CASH"
    }
    ```

---

## Debugging Tips

*   **Database Viewer**: Run `npx prisma studio` to see the actual data in your browser at `http://localhost:5555`.
*   **Logs**: detailed logs are printed in the terminal where you run `npm run dev`.
