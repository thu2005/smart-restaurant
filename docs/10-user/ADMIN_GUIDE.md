# Admin User Guide - Smart Restaurant System

> **Role**: Administrator / Restaurant Manager  
> **Version**: 1.0  
> **Last Updated**: 2026-01-19

---

## 📚 Table of Contents
1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
   - [Logging In](#logging-in)
   - [Navigation Overview](#navigation-overview)
3. [Dashboard & Analytics](#3-dashboard--analytics)
   - [Real-Time Metrics](#real-time-metrics)
   - [Live Activity Feed](#live-activity-feed)
4. [Table Management & QR Codes](#4-table-management--qr-codes)
   - [Adding Tables](#adding-tables)
   - [generating QR Codes](#generating-qr-codes)
   - [Printing & Downloading](#printing--downloading)
5. [Menu Management](#5-menu-management)
   - [creating Categories](#creating-categories)
   - [Adding Menu Items](#adding-menu-items)
   - [Configuring Modifiers](#configuring-modifiers)
6. [Staff Management](#6-staff-management)
   - [Creating Staff Accounts](#creating-staff-accounts)
   - [Roles & Permissions](#roles--permissions)
7. [Restaurant Settings](#7-restaurant-settings)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Introduction
Welcome to the **Smart Restaurant Admin Portal**. This systematic guide helps restaurant managers configure and monitor their digital ordering system. As an Admin, you have full control over the menu, staff, tables, and financial reporting.

---

## 2. Getting Started

### Logging In
Access the admin portal via your web browser (Desktop or Tablet recommended).
1.  Navigate to `/admin/login`.
2.  Enter your **Email** and **Password**.
3.  Click **Login**.

> **Note**: If you forget your password, use the "Forgot Password?" link to reset it via email.

### Navigation Overview
The Sidebar (left panel) provides access to all major modules:
-   **Dashboard**: Live overview of your restaurant.
-   **Menu**: Manage food & drinks.
-   **Tables**: Manage physical layout and QR codes.
-   **Users**: Manage staff (Waiters/Kitchen).
-   **Orders**: View order history.
-   **Reports**: Financial analytics.
-   **Settings**: Configure restaurant profile.

---

## 3. Dashboard & Analytics
The Dashboard is your command center. It auto-refreshes every 30 seconds and receives real-time updates.

### Real-Time Metrics
At the top of the screen, you will see key performance indicators (KPIs):
-   **Today's Revenue**: Total sales for the current day (with % change vs yesterday).
-   **Current Orders**: Number of active orders currently in the kitchen/dining room.
-   **Table Occupancy**: Live count of occupied tables (e.g., 12/20).
-   **Avg Order Value**: Average amount spent per order.

### Live Activity Feed
The visible **Recent Activity** panel logs important events as they happen:
-   New Order Placed
-   Order Completed
-   Payment Received
-   Alerts (e.g., "Item out of stock")

---

## 4. Table Management & QR Codes
*Navigate to: **Tables** in the sidebar.*

This section allows you to digitize your floor plan.

### Adding Tables
1.  Click the **+ Add Table** button.
2.  **Table Number**: Enter a unique identifier (e.g., "T-01", "Patio-1").
3.  **Capacity**: Number of seats.
4.  **Location**: Optional grouping (e.g., "Main Hall", "First Floor").
5.  Click **Save**.

### Generating QR Codes
QR codes are unique to each table. When a customer scans one, the system identifies exactly where they are sitting.

*   **Single Table**: Click the **QR Icon** on a specific table card to view/regenerate its code.
*   **Regenerate All**: Use the **Regenerate All** button to invalidate *all* old codes and create new ones (Warning: Old printed codes will stop working).

### Printing & Downloading
You can export QR codes for professional printing:
*   **Download ZIP**: Downloads individual PNG images for all tables.
*   **Download PDF**: Generates a printable PDF with Table Numbers and QRs formatted for stickers/stands.
*   **Print Preview**: Opens a browser print dialog to print directly to a connected printer.

---

## 5. Menu Management
*Navigate to: **Menu** in the sidebar.*

### Creating Categories
Organize your menu into sections (e.g., Appetizers, Mains, Drinks).
1.  Go to **Menu > Categories**.
2.  Click **Add Category**.
3.  Enter **Name** and **Description**.
4.  **Display Order**: Determines the sequence in the customer app (1 shows first).

### Adding Menu Items
1.  Go to **Menu > Items**.
2.  Click **Add Item**.
3.  Fill in details:
    *   **Name & Price**: Mandatory.
    *   **Category**: Assign to a category.
    *   **Photos**: Upload high-quality images (Square aspect ratio recommended).
    *   **Stock Status**: Set to "Available", "Low Stock", or "Out of Stock".

### Configuring Modifiers
Modifiers allow customers to customize orders (e.g., "Extra Cheese", "No Onions", "Steak Doneness").
1.  Go to **Menu > Modifiers**.
2.  Create a **Modifier Group** (e.g., "Pizza Size").
    *   **Selection Type**: "Single" (Radio button) or "Multiple" (Checkboxes).
    *   **Required**: Yes/No.
3.  Add **Options** to the group (e.g., "Small", "Medium +$2", "Large +$4").
4.  Link the Group to specific Menu Items.

---

## 6. Staff Management
*Navigate to: **Users** in the sidebar.*

### Creating Staff Accounts
1.  Click **Create User**.
2.  **Role**: Select one of the following:
    *   **WAITER**: Can manage orders, tables, and payments. Cannot edit menu/settings.
    *   **KITCHEN**: Can only view KDS (Kitchen Display System) and update preparation status.
    *   **ADMIN**: Full access (Careful when assigning this).
3.  Enter **Name**, **Email**, and **Initial Password**.
4.  Click **Create**.

### Roles & Permissions
| Feature | Admin | Waiter | Kitchen |
| :--- | :---: | :---: | :---: |
| Dashboard | ✅ | ✅ | ❌ |
| Edit Menu | ✅ | ❌ | ❌ |
| Manage Tables | ✅ | ✅ | ❌ |
| View KDS | ✅ | ❌ | ✅ |
| Financial Reports | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ |

---

## 7. Restaurant Settings
*Navigate to: **Settings**.*

*   **General**: Configure language (English/Vietnamese) and Theme (Light/Dark).
*   **Restaurant Profile**: Update Restaurant Name, Address, Phone, and **Logo**. This info appears on the customer's digital menu and printed receipts.
*   **Account**: Update your own password or profile picture.

---

## 8. Troubleshooting

### "QR Code Not Working"
*   **Cause**: The table might have been deleted, or the QR code was regenerated.
*   **Fix**: Reprint the QR code for that specific table from the Admin > Tables page.

### "Menu Item Not Showing"
*   **Cause**: Item status might be "Hidden" or "Out of Stock".
*   **Fix**: Check the item status in Menu Management. Also, ensure it is assigned to an active Category.

### "Real-time Updates Stopped"
*   **Cause**: Internet connection issues or WebSocket disconnection.
*   **Fix**: Refresh the page. Ensure the "Live" indicator in the Dashboard is blinking.

---
*For technical support, please contact the system maintenance team.*
