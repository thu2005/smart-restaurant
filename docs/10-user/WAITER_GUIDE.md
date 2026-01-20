# Waiter Guide - Smart Restaurant System

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Order Management](#order-management)
- [Table Management](#table-management)
- [Payment & Billing](#payment--billing)
- [Customer Service](#customer-service)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

As a waiter in the Smart Restaurant system, you are the primary point of contact between customers and the kitchen. Your role includes:

- **Accepting and managing customer orders**
- **Monitoring order status from kitchen**
- **Serving ready orders to tables**
- **Processing bills and payments**
- **Managing table status and assignments**
- **Providing excellent customer service**

###  Dashboard Access
- **Role**: WAITER
- **Permissions**: Accept/reject orders, manage tables, generate bills, update order status

---

## Getting Started

### 1. Logging In

1. Navigate to the login page
2. Enter your credentials:
   - **Email**: Your assigned staff email
   - **Password**: Your secure password (minimum 8 characters)
3. Click "Login" 
4. You'll be redirected to the Waiter Dashboard

### 2. Dashboard Overview

Your dashboard displays:

| Section | Description |
|---------|-------------|
| **My Orders** | All orders you've accepted and are responsible for |
| **My Tables** | Tables with active orders assigned to you |
| **Active Orders** | New orders awaiting acceptance (SUBMITTED status) |
| **Ready Orders** | Orders ready to be served (READY status) |
| **Bills** | Pending and paid bills for your tables |

### 3. Real-Time Notifications

The system uses **Socket.IO** for instant updates:
- **New Order**: Customer submits order
- **Kitchen Update**: Order status changes (PREPARING → READY)
- **Payment Request**: Customer requests bill
- **Payment Confirmed**: Payment completed

---

## Order Management

### Order Lifecycle

```
Customer Scans QR → Places Order (SUBMITTED)
    ↓
Waiter Accepts → Order Sent to Kitchen (RECEIVED)
    ↓
Kitchen Cooks → Updates Status (PREPARING)
    ↓
Kitchen Completes → Marks Ready (READY)
    ↓
Waiter Serves → Updates Status (SERVED)
    ↓
Customer Requests Bill (PAYMENT_PENDING)
    ↓
Payment Completed → Order Closed (COMPLETED)
```

### 1. Accepting New Orders

**When a new order arrives:**

1. **Notification appears** with order details:
   - Order ID (e.g., ORD-0051)
   - Table number
   - Customer name/phone (optional)
   - Items ordered with quantities
   - Modifiers and special instructions
   - Total amount

2. **Review the order carefully:**
   - Check if all items are available
   - Verify special instructions are clear
   - Confirm table is correct

3. **Accept or Reject:**

   **To Accept:**
   ```
   Click "Accept Order" button
   → Order status changes to RECEIVED
   → Kitchen receives notification
   → Order appears in "My Orders"
   ```

   **To Reject:**
   ```
   Click "Reject Order" button
   → Enter rejection reason (e.g., "Out of stock: Grilled Salmon")
   → Customer receives notification
   → Order status changes to REJECTED
   ```

**API Reference:**
```http
PATCH /api/orders/:id/status
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "status": "RECEIVED"
}
```

**Best Practice:**
- Accept orders within 2-3 minutes
- If rejecting, provide clear reason
- Inform customers in person if order is rejected

### 2. Viewing Your Orders

**Access your assigned orders:**

```http
GET /api/orders/waiter/my-orders
Authorization: Bearer <your-token>
Query Parameters:
  - status: (optional) RECEIVED, PREPARING, READY, SERVED
```

**Filter options:**
- **All**: Show all your orders
- **In Progress**: Orders being prepared (RECEIVED, PREPARING)
- **Ready**: Orders ready to serve
- **Completed**: Served and paid orders

**Order Details Include:**
- Order number and timestamp
- Table location
- Customer information
- Item list with modifiers
- Special instructions (highlighted)
- Current status and progress
- Kitchen notes (if any)

### 3. Viewing Your Tables

**See all tables with your active orders:**

```http
GET /api/orders/waiter/my-tables
Authorization: Bearer <your-token>
```

**Response shows:**
- Table number and location
- Number of guests (capacity)
- Active order ID
- Order status
- Total amount
- Time since order placed

**Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "table-uuid-123",
      "tableNumber": "T-05",
      "location": "Main Hall",
      "capacity": 4,
      "status": "OCCUPIED",
      "activeOrder": {
        "id": "order-uuid-456",
        "orderNumber": "ORD-0051",
        "status": "READY",
        "totalAmount": 450000,
        "createdAt": "2026-01-20T10:30:00Z"
      }
    }
  ]
}
```

### 4. Monitoring Order Progress

**Kitchen updates you'll receive:**

| Status | Meaning | Your Action |
|--------|---------|-------------|
| **RECEIVED** | Order accepted, sent to kitchen | Monitor progress |
| **PREPARING** | Kitchen is cooking | Inform customer of wait time |
| **READY** | Food is ready | Pick up and serve immediately |
| **SERVED** | You marked as served | Wait for bill request |

**Real-time updates:**
- WebSocket event: `order_status_updated`
- Dashboard auto-refreshes
- Mobile notifications (if enabled)

### 5. Serving Orders

**When kitchen marks order READY:**

1. **Verify order completeness:**
   - Check all items are present
   - Verify modifiers applied correctly
   - Ensure presentation is good
   - Check for special instructions

2. **Pick up from kitchen:**
   - Bring order to correct table
   - Confirm table number matches
   - Verify customer if uncertain

3. **Serve and update status:**
   ```
   Click "Mark as Served" button
   → Order status changes to SERVED
   → Customer can now request bill
   → Order moves to "Completed" section
   ```

**API Reference:**
```http
PATCH /api/orders/:orderId/status
Content-Type: application/json

{
  "status": "SERVED"
}
```

**Best Practice:**
- Serve hot food immediately when ready
- Ask if customer needs anything else
- Inform about special ingredients or allergens
- Clear empty dishes promptly

### 6. Adding Items to Existing Orders

**If customer wants to order more:**

```http
POST /api/orders/:orderId/items
Content-Type: application/json

{
  "items": [
    {
      "menuItemId": "menu-item-uuid",
      "quantity": 2,
      "modifiers": ["modifier-uuid-1"],
      "specialInstructions": "No ice"
    }
  ]
}
```

**Process:**
1. Customer requests additional items
2. You add items through system (or customer uses QR)
3. New items sent to kitchen
4. Kitchen prepares and notifies when ready
5. Serve additional items

**Note:** 
- Total bill updates automatically
- New items have separate order item status
- Customer can still add items until bill is generated

---

## Table Management

### Table Statuses

| Status | Meaning | Waiter Action |
|--------|---------|---------------|
| **AVAILABLE** | Table is clean and ready | Can seat new customers |
| **OCCUPIED** | Table has active order | Monitor and serve |
| **RESERVED** | Table is booked | Hold for reservation |
| **CLEANING** | Table needs cleaning | Clean and set AVAILABLE |

### Updating Table Status

**API Endpoint:**
```http
PATCH /api/tables/:tableId/status
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "status": "AVAILABLE"
}
```

**Common workflows:**

**1. Seating Customers:**
```
Check available tables → Seat customers → They scan QR → Place order
```

**2. After Customers Leave:**
```
Payment completed → Clear table → Update to CLEANING → Clean → Set AVAILABLE
```

**3. For Reservations:**
```
Set table to RESERVED → Customers arrive → Update to OCCUPIED → Normal flow
```

### Viewing Table Details

```http
GET /api/tables/details/:tableId
Authorization: Bearer <your-token>
```

**Information includes:**
- Table number and location
- Capacity
- QR code URL
- Current status
- Active order (if any)
- Reservation details (if any)

---

## Payment & Billing

### Bill Generation Process

**Customer can request bill:**
- Via QR code menu ("Request Bill" button)
- Or by asking waiter

### 1. Customer Requests Bill

**When customer clicks "Request Bill" in app:**
```
Order status changes to PAYMENT_PENDING
→ You receive notification
→ Bill is auto-generated
```

### 2. Generating Bill (Manual)

**If customer asks you directly:**

```http
POST /api/orders/:orderId/bill
Authorization: Bearer <your-token>
```

**This creates a bill with:**
- Itemized list of all orders
- Subtotal
- Tax (if applicable)
- Discount (if applied)
- Service charge (if applicable)
- **Total amount due**

### 3. Viewing Bill Details

```http
GET /api/orders/:orderId/bill
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid",
    "bill": {
      "subtotal": 400000,
      "discount": 20000,
      "tax": 40000,
      "serviceCharge": 0,
      "total": 420000,
      "items": [
        {
          "name": "Grilled Salmon",
          "quantity": 2,
          "unitPrice": 150000,
          "total": 300000,
          "modifiers": ["Extra Lemon"]
        }
      ]
    }
  }
}
```

### 4. Applying Discounts

**If authorized to apply discount:**

```http
POST /api/orders/:orderId/discount
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "amount": 50000,
  "reason": "Promotional discount"
}
```

**Types of discounts:**
- Fixed amount (e.g., 50,000 VND off)
- Percentage (calculated before submission)
- Promotional codes
- Manager approval required for large discounts

### 5. Processing Payment

**Payment methods supported:**

| Method | Process |
|--------|---------|
| **Cash** | Accept cash → Verify amount → Mark paid |
| **Stripe** | Customer pays via app → Auto-confirmed |
| **MoMo** | Customer pays via app → Auto-confirmed |

**For Cash Payments:**

```http
POST /api/payments
Content-Type: application/json

{
  "orderId": "order-uuid",
  "method": "CASH",
  "amount": 420000,
  "status": "PAID"
}
```

**Process:**
1. Customer hands you cash
2. Count and verify amount
3. Give change if needed
4. Mark payment as PAID in system
5. Provide receipt (optional)

**For Digital Payments:**
- Customer completes payment in app
- Payment auto-confirmed via webhook
- You receive notification
- Order status changes to COMPLETED

### 6. Viewing Bills

**Filter bills by status:**

```http
GET /api/orders/bills?restaurantId=<id>&status=UNPAID
Authorization: Bearer <your-token>
```

**Status options:**
- **UNPAID**: Bills awaiting payment
- **PAID**: Completed payments

**Use this to:**
- Track outstanding payments
- Verify end-of-shift totals
- Reconcile cash collected

### 7. Printing Bills

```http
GET /api/orders/:orderId/bill/print
Authorization: Bearer <your-token>
```

**Returns PDF file with:**
- Restaurant name and logo
- Date and time
- Order number
- Table number
- Itemized list
- Total breakdown
- Payment method
- Thank you message

---

## Customer Service

### 1. Handling Special Requests

**Common requests:**
- **Dietary restrictions**: Check menu for allergens, inform kitchen
- **Food modifications**: Add special instructions when ordering
- **Extra condiments**: Note in order or bring separately
- **Split bills**: Not currently supported (payment is per order)

**Example special instruction:**
```json
{
  "items": [
    {
      "menuItemId": "item-uuid",
      "quantity": 1,
      "specialInstructions": "No onions, extra spicy, allergic to peanuts"
    }
  ]
}
```

### 2. Order Issues

**If customer complains:**

1. **Listen and acknowledge** the issue
2. **Check order details** in system
3. **Options:**
   - **Wrong item delivered**: Check kitchen, remake if needed
   - **Missing items**: Add to order, rush through kitchen
   - **Quality issue**: Offer replacement or removal from bill
   - **Long wait**: Check kitchen status, provide ETA

4. **Update order status** if needed
5. **Apply discount** if authorized
6. **Escalate to manager** for serious issues

### 3. Order Modifications

**Before kitchen starts (RECEIVED status):**
- Can modify items easily
- Update order in system
- Kitchen receives updated version

**During cooking (PREPARING status):**
- Contact kitchen immediately
- Check if change is possible
- Inform customer of options

**After cooking (READY/SERVED status):**
- Cannot modify
- Can add new items as separate order
- May need to remake if serious issue

### 4. Cancellations

**Customer wants to cancel order:**

**Before acceptance (SUBMITTED):**
```http
PATCH /api/orders/:orderId/status
Content-Type: application/json

{
  "status": "CANCELLED",
  "rejectionReason": "Customer cancelled - changed plans"
}
```

**After acceptance:**
- Check with kitchen on progress
- If not started, can cancel
- If cooking, usually cannot cancel
- May charge cancellation fee

---

## Common Workflows

### Workflow 1: Normal Table Service

```
1. Customers arrive → Seat at table
2. They scan QR code → Browse menu
3. They place order → You receive notification
4. Accept order → Sent to kitchen
5. Monitor kitchen progress → Order marked READY
6. Pick up food → Serve to table → Mark SERVED
7. Customer enjoys meal
8. Customer requests bill → Generate bill
9. Customer pays (cash/digital) → Confirm payment
10. Customer leaves → Clear table → Set AVAILABLE
```

### Workflow 2: Express Takeout

```
1. Customer places order (walk-in or phone)
2. Enter order in system (set table as "Takeout")
3. Kitchen prepares → Mark READY
4. Package food
5. Customer picks up → Payment → COMPLETED
```

### Workflow 3: Adding Items Mid-Meal

```
1. Customer requests more items
2. Add items to existing order
3. Kitchen prepares new items
4. Serve when ready
5. Bill auto-updates with new items
```

### Workflow 4: Split Table Management

```
Note: Currently, each table has ONE order
- Multiple customers can add to same order
- Bill is per table, not per person
- For groups wanting separate bills:
  → Suggest using separate tables or
  → Collect cash from each person manually
```

### Workflow 5: Handling Rush Hours

**During busy times:**
1. **Prioritize acceptance**: Accept all incoming orders quickly
2. **Monitor kitchen**: Watch for READY orders to serve promptly
3. **Batch tasks**: Clear multiple tables, process payments together
4. **Communicate**: Keep kitchen informed of dining room status
5. **Stay calm**: Follow system workflow, don't skip steps

---

## Troubleshooting

### Issue 1: Order Not Appearing

**Symptoms:**
- Customer says they ordered but you don't see it
- Notification didn't arrive

**Solutions:**
1. **Refresh dashboard** (F5 or reload)
2. **Check "All Orders"** filter (might be filtered out)
3. **Verify table number** with customer
4. **Check WebSocket connection** (icon in top right)
5. **Ask customer** to show their order confirmation screen

### Issue 2: Cannot Update Order Status

**Symptoms:**
- "Mark as Served" button doesn't work
- Error message appears

**Solutions:**
1. **Check internet connection**
2. **Verify order belongs to you** (only your accepted orders)
3. **Confirm current status** (can't serve order still PREPARING)
4. **Re-login** if session expired
5. **Contact admin** if persistent

### Issue 3: Payment Not Confirming

**Symptoms:**
- Customer paid but status still PAYMENT_PENDING
- Payment appears as failed

**Solutions:**
1. **Wait 30 seconds** for webhook confirmation
2. **Check payment method**:
   - MoMo/Stripe: Check customer's app for success
   - Cash: Manually mark as paid
3. **Refresh page**
4. **Contact admin** to check payment logs
5. **Accept alternate payment** if needed

### Issue 4: Bill Amount Wrong

**Symptoms:**
- Total doesn't match itemized list
- Discount not applied
- Tax calculation error

**Solutions:**
1. **Re-generate bill** (POST /api/orders/:id/bill)
2. **Verify all items** are listed correctly
3. **Check discount** was applied properly
4. **Recalculate manually** if needed
5. **Get manager approval** to adjust

### Issue 5: Table Shows Wrong Status

**Symptoms:**
- Table shows OCCUPIED but is empty
- Cannot change table status

**Solutions:**
1. **Check for active orders** on that table
2. **Complete pending payments** if order exists
3. **Update status manually** to CLEANING then AVAILABLE
4. **Contact admin** if table is "stuck"

### Issue 6: Not Receiving Notifications

**Symptoms:**
- No sound/popup for new orders
- Missing kitchen updates

**Solutions:**
1. **Check browser permissions** (allow notifications)
2. **Verify WebSocket connection** (look for 🟢 icon)
3. **Refresh page** to reconnect
4. **Check audio settings** (unmute browser)
5. **Try different browser** (Chrome recommended)

## Quick Reference

### API Endpoints Summary

| Action | Method | Endpoint |
|--------|--------|----------|
| Get my orders | GET | `/api/orders/waiter/my-orders` |
| Get my tables | GET | `/api/orders/waiter/my-tables` |
| Accept order | PATCH | `/api/orders/:id/status` |
| Serve order | PATCH | `/api/orders/:id/status` |
| Generate bill | POST | `/api/orders/:id/bill` |
| View bill | GET | `/api/orders/:id/bill` |
| Apply discount | POST | `/api/orders/:id/discount` |
| Update table | PATCH | `/api/tables/:id/status` |
| Process payment | POST | `/api/payments` |
| Add items | POST | `/api/orders/:orderId/items` |

### Order Status Flow

```
SUBMITTED (New order)
    ↓ [Accept]
RECEIVED (Sent to kitchen)
    ↓ [Kitchen starts]
PREPARING (Cooking)
    ↓ [Kitchen finishes]
READY (Ready to serve)
    ↓ [Serve to table]
SERVED (Food delivered)
    ↓ [Customer requests]
PAYMENT_PENDING (Bill generated)
    ↓ [Payment confirmed]
COMPLETED (Order closed)
```

---

## Support & Training

## Appendix

### Payment Method Details

**Stripe:**
- Credit/debit cards
- Digital wallets (Apple Pay, Google Pay)
- Instant confirmation via webhook

**MoMo:**
- Vietnamese e-wallet
- QR code or app-to-app
- Confirmation within seconds

**Cash:**
- Manual entry by waiter
- Require manager approval for large amounts
- Count carefully, provide change

### Restaurant Policies

**Check with your manager:**
- Maximum discount you can apply
- Handling of customer complaints
- Cash handling procedures
- Shift change procedures
- Uniform and appearance standards

---
