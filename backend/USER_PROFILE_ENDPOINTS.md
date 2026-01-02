# User Profile Management Endpoints

## Overview
Three new endpoints have been implemented for logged-in users (customers) to manage their profiles:

1. **Update Profile** - Update name and phone
2. **Update Avatar** - Upload profile photo
3. **Change Password** - Change password with old password verification

---

## 1. Update User Profile

**Endpoint:** `PUT /api/auth/profile`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `application/json`

### Request Body
```json
{
  "fullName": "John Doe",
  "phone": "+84123456789"
}
```

### Validation Rules
- `fullName`: Optional, minimum 2 characters, only letters and spaces
- `phone`: Optional, valid phone number format

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+84123456789",
    "role": "CUSTOMER",
    "avatar": "/uploads/avatars/avatar-user-id-123456.jpg",
    "restaurantId": null,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Postman Test
```
PUT http://localhost:5001/api/auth/profile
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body (raw JSON):
{
  "fullName": "John Updated",
  "phone": "0987654321"
}
```

---

## 2. Update User Avatar

**Endpoint:** `PUT /api/auth/avatar`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `multipart/form-data`

### Request Body
- **Form Data Key:** `avatar`
- **Value:** Image file (JPG, PNG, etc.)
- **Max Size:** 5MB

### Validation Rules
- File must be an image (MIME type starts with `image/`)
- Maximum file size: 5MB
- File is saved in `uploads/avatars/` directory

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+84123456789",
    "role": "CUSTOMER",
    "avatar": "/uploads/avatars/avatar-user-id-1735804923456.jpg",
    "restaurantId": null,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Postman Test
```
PUT http://localhost:5001/api/auth/avatar
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
Body (form-data):
  Key: avatar
  Type: File
  Value: [Select image file]
```

---

## 3. Change Password

**Endpoint:** `PUT /api/auth/password`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `application/json`

### Request Body
```json
{
  "oldPassword": "currentPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

### Validation Rules
- `oldPassword`: Required
- `newPassword`: Required, minimum 8 characters, must include:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Response (Error - 401)
```json
{
  "success": false,
  "message": "Invalid old password"
}
```

### Postman Test
```
PUT http://localhost:5001/api/auth/password
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body (raw JSON):
{
  "oldPassword": "password123",
  "newPassword": "NewPassword123!"
}
```

---

## Database Changes

### Migration Applied
- **Migration:** `20260102064123_add_user_avatar_field`
- **Change:** Added `avatar` column to `User` table (nullable TEXT field)

### Schema Update
```prisma
model User {
  // ... other fields
  avatar        String? // Profile photo URL
  // ... other fields
}
```

---

## File Upload Configuration

### Avatar Storage
- **Directory:** `backend/uploads/avatars/`
- **Filename Format:** `avatar-{userId}-{timestamp}.{ext}`
- **Allowed Types:** All image types (image/*)
- **Max Size:** 5MB

### Access Avatar Files
Avatars are served statically via:
```
GET http://localhost:5001/uploads/avatars/avatar-user-id-123456.jpg
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Full name must be at least 2 characters",
      "param": "fullName",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized"
}
```

or

```json
{
  "success": false,
  "message": "Invalid old password"
}
```

---

## Testing Workflow

1. **Login** to get JWT token:
   ```
   POST /api/auth/login
   {
     "email": "admin@cafepoirot.com",
     "password": "password123"
   }
   ```

2. **Update Profile**:
   ```
   PUT /api/auth/profile
   Authorization: Bearer {token}
   {
     "fullName": "New Name",
     "phone": "1234567890"
   }
   ```

3. **Upload Avatar**:
   ```
   PUT /api/auth/avatar
   Authorization: Bearer {token}
   [Upload image file]
   ```

4. **Change Password**:
   ```
   PUT /api/auth/password
   Authorization: Bearer {token}
   {
     "oldPassword": "password123",
     "newPassword": "NewPass123!"
   }
   ```

5. **Verify Changes**:
   ```
   GET /api/auth/me
   Authorization: Bearer {token}
   ```

---

## Notes

- All endpoints require authentication (JWT token in Authorization header)
- Input validation is performed on all endpoints
- Avatar files are stored locally in `uploads/avatars/` directory
- Password must meet complexity requirements
- Old password is verified before allowing password change
- Profile updates are partial - only send fields you want to update
