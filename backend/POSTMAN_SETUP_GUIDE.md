# 🚀 Smart Restaurant - Postman Collection Setup Guide

Follow these steps to manually build a robust Postman Collection for this API.

## ⚙️ 1. Setup Environment
First, create an Environment in Postman to store variables.

1.  Click **Environments** -> **Create New Environment**.
2.  Name it `Smart Restaurant Local`.
3.  Add the following variables:

| Variable | Initial Value | Current Value |
| :--- | :--- | :--- |
| `baseUrl` | `http://localhost:5000/api` | `http://localhost:5000/api` |
| `token` | *(leave blank)* | *(leave blank)* |
| `restaurantId` | *(leave blank)* | *(leave blank)* |
| `categoryId` | *(leave blank)* | *(leave blank)* |
| `tableId` | *(leave blank)* | *(leave blank)* |
| `orderId` | *(leave blank)* | *(leave blank)* |

---

## 📂 2. Create Collection Structure
Create a new Collection named **"Smart Restaurant API"**.
Create folders inside it:
1.  **Auth**
2.  **Restaurants**
3.  **Tables**
4.  **Menu**
5.  **Orders**
6.  **Payments**

---

## 📝 3. Add Requests

### 🔐 Folder: Auth

**1. Register (Super Admin)**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/auth/register`
*   **Body** (Raw JSON):
    ```json
    {
      "email": "admin@test.com",
      "password": "password123",
      "fullName": "Super Admin",
      "role": "SUPER_ADMIN"
    }
    ```
*   **Tests** (Tab):
    ```javascript
    // Auto-save token
    if (pm.response.code === 201) {
        pm.environment.set("token", pm.response.json().token);
    }
    ```

**2. Login**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/auth/login`
*   **Body** (Raw JSON):
    ```json
    {
      "email": "admin@test.com",
      "password": "password123"
    }
    ```
*   **Tests** (Tab):
    ```javascript
    if (pm.response.code === 200) {
        pm.environment.set("token", pm.response.json().token);
    }
    ```

**3. Get Me**
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/auth/me`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`

---

### 🏪 Folder: Restaurants

**1. Create Restaurant**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/restaurants`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
*   **Body** (Raw JSON):
    ```json
    {
      "name": "Pizza Paradise",
      "address": "123 Dough St",
      "phone": "555-0199"
    }
    ```
*   **Tests**:
    ```javascript
    if (pm.response.code === 201) {
        pm.environment.set("restaurantId", pm.response.json().data.id);
    }
    ```

**2. Get All Restaurants**
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/restaurants`

**3. Get Restaurant by ID**
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/restaurants/{{restaurantId}}`

**4. Update Restaurant**
*   **Method**: `PUT`
*   **URL**: `{{baseUrl}}/restaurants/{{restaurantId}}`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
*   **Body** (Raw JSON):
    ```json
    {
      "name": "Pizza Paradise Updated",
      "address": "456 New St",
      "phone": "555-9999"
    }
    ```

**5. Delete Restaurant**
*   **Method**: `DELETE`
*   **URL**: `{{baseUrl}}/restaurants/{{restaurantId}}`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`

---

### 🪑 Folder: Tables

**1. Create Table**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/tables`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
*   **Body** (Raw JSON):
    ```json
    {
      "restaurantId": "{{restaurantId}}",
      "tableNumber": "T-01",
      "capacity": 4,
      "location": "Window Seat"
    }
    ```
*   **Tests**:
    ```javascript
    if (pm.response.code === 201) {
        pm.environment.set("tableId", pm.response.json().data.id);
    }
    ```

**2. Get Tables**
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/tables/{{restaurantId}}`

**3. Delete Table**
*   **Method**: `DELETE`
*   **URL**: `{{baseUrl}}/tables/{{tableId}}`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`

**4. Generate QR for Table**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/tables/{{tableId}}/qr/generate`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`

**5. Download Single QR**
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/tables/{{tableId}}/qr/download?format=pdf`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
*   **Note**: Save response to a file to view the PDF.

**6. Download All QR (PDF)**
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/tables/qr/download-all?format=pdf&layout=grid&restaurantId={{restaurantId}}`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
**7. Regenerate All QRs**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/tables/qr/regenerate-all`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
*   **Body** (Raw JSON):
    ```json
    {
      "restaurantId": "{{restaurantId}}"
    }
    ```

---

### 🍔 Folder: Menu

**1. Create Category**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/menu/categories`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
*   **Body** (Raw JSON):
    ```json
    {
      "restaurantId": "{{restaurantId}}",
      "name": "Main Courses"
    }
    ```
*   **Tests**:
    ```javascript
    if (pm.response.code === 201) {
        pm.environment.set("categoryId", pm.response.json().data.id);
    }
    ```

**2. Create Item**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/menu/items`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
*   **Body** (Raw JSON):
    ```json
    {
      "restaurantId": "{{restaurantId}}",
      "categoryId": "{{categoryId}}",
      "name": "Pepperoni Pizza",
      "price": 120000
    }
    ```

**3. Get Menu**
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/menu/{{restaurantId}}/categories`

---

### 🛒 Folder: Orders

**1. Create Order**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/orders`
*   **Body** (Raw JSON):
    ```json
    {
      "restaurantId": "{{restaurantId}}",
      "tableId": "{{tableId}}",
      "items": [
        {
          "menuItemId": "<PASTE_MENU_ITEM_ID_HERE>",
          "quantity": 2
        }
      ]
    }
    ```
*   **Note**: Copy the `menuItemId` from the response of "Create Item" or "Get Menu".
*   **Tests**:
    ```javascript
    if (pm.response.code === 201) {
        pm.environment.set("orderId", pm.response.json().data.id);
    }
    ```

**2. Get Orders (Kitchen/Staff)**
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/orders?restaurantId={{restaurantId}}&status=SUBMITTED`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`

**3. Update Status**
*   **Method**: `PATCH`
*   **URL**: `{{baseUrl}}/orders/{{orderId}}/status`
*   **Auth**: Type `Bearer Token` -> Token: `{{token}}`
*   **Body** (Raw JSON):
    ```json
    {
      "status": "RECEIVED"
    }
    ```

---

### 💳 Folder: Payments

**1. Pay Order**
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/payments`
*   **Body** (Raw JSON):
    ```json
    {
      "orderId": "{{orderId}}",
      "restaurantId": "{{restaurantId}}",
      "amount": 240000,
      "method": "CASH"
    }
    ```
