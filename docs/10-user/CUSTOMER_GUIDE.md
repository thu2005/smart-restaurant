#  Customer Guide - Café Poirot

## Welcome to Café Poirot!

This guide will help you navigate our smart restaurant ordering system and make the most of your dining experience.

---

## Getting Started

### 1. Accessing the Menu

**Option A: Scan QR Code at Your Table**
- Each table has a unique QR code
- Open your phone's camera app
- Point it at the QR code
- Tap the notification to open the menu
- You'll be automatically assigned to your table

**Option B: Direct URL**
- Visit: `http://localhost:5173/customer/menu`
- Select your table number manually

### 2. First-Time Setup

No account registration required! You can:
- Browse the menu anonymously
- Place orders as a guest
- Optionally create an account to:
  - Save your favorite items
  - View order history
  - Leave reviews
  - Get personalized recommendations

---

## Browsing the Menu

### Menu Navigation

**Categories:**
- Appetizers 
- Main Courses 
- Desserts 
- Beverages 
- Specials 

**View Options:**
- **Grid View**: Visual cards with photos
- **List View**: Compact list with details
- **Search**: Find items by name or ingredients

### Menu Item Details

Each item shows:
- **Photo**: High-quality image of the dish
- **Name & Description**: What you're ordering
- **Price**: In VND (Vietnamese Dong)
- **Dietary Information**: 
  - Vegetarian
  - Contains Nuts
  - Spicy Level
  - Cold/Hot
- **Availability**: "Available" or "Out of Stock"
- **Rating**: Customer reviews (1-5 stars)
- **Preparation Time**: Estimated cooking time

### Filtering & Sorting

**Filter by:**
- Category
- Dietary preferences (Vegetarian, Vegan, etc.)
- Price range
- Spice level

**Sort by:**
- Price (Low to High / High to Low)
- Popularity (Most Ordered)
- Rating (Highest Rated)
- Newest Items

---

## Placing Your Order

### Step 1: Add Items to Cart

1. **Click on a menu item** to view details
2. **Customize your order:**
   - Select size (if available)
   - Choose modifiers:
     - Extra toppings
     - Sauce preferences
     - Cooking preference (e.g., Medium Rare)
   - Add special instructions (e.g., "No onions, please")
3. **Select quantity**
4. **Click "Add to Cart"** 

### Step 2: Review Your Cart

**Cart shows:**
- All selected items
- Customizations for each item
- Individual prices
- Subtotal

**Actions:**
- Modify quantity (+ / -)
- Remove items ( icon)
- Edit customizations (icon)
- Clear entire cart

### Step 3: Submit Your Order

1. **Review your order details:**
   - Table number
   - All items and customizations
   - Total price (including tax)
   
2. **Add optional notes:**
   - "Please serve appetizers first"
   - "Celebrating a birthday"
   - Allergy information

3. **Click "Submit Order"**

4. **Confirmation:**
   - Order number (e.g., ORD-001)
   - Estimated preparation time
   - Current status

---

## Tracking Your Order

### Order Status Flow

```
SUBMITTED → RECEIVED → PREPARING → READY → SERVED
```

**Status Meanings:**

| Status | Icon | What It Means |
|--------|------|---------------|
| **SUBMITTED** | | Order sent, waiting for waiter confirmation |
| **RECEIVED** | | Waiter accepted, sent to kitchen |
| **PREPARING** |  Chef is cooking your food |
| **READY** | | Food is ready, waiter will serve soon |
| **SERVED** |  | Enjoy your meal! |

### Real-Time Updates

- Your order status updates automatically (via WebSocket)
- You'll see notifications when status changes
- No need to refresh the page

### View Order Details

**From the Orders Page:**
1. Click on your order number
2. See detailed breakdown:
   - Each item's status
   - Individual item preparation time
   - Special instructions
   - Total price

---

## Payment Methods

### When to Pay

- Payment is typically made **after your meal**
- Waiter will inform you when ready to pay
- You can request the bill anytime

### Available Payment Methods

#### 1. **Cash**
- Pay directly to your waiter
- No online processing needed

#### 2. **Stripe (Card)** 
- Secure online payment
- Supports Visa, Mastercard, Amex
- **How to pay:**
  1. Waiter sends payment link
  2. Enter card details
  3. Complete 3D Secure verification
  4. Instant confirmation

#### 3. **MoMo** 
- Popular Vietnamese e-wallet
- **How to pay:**
  1. Scan QR code provided
  2. Confirm in MoMo app
  3. Enter PIN
  4. Payment complete

#### 4. **VNPay** 
- Bank transfer via VNPay
- **How to pay:**
  1. Select your bank
  2. Enter banking credentials
  3. Authorize payment
  4. Receive confirmation

### Payment Process

1. **Request Bill:**
   - Flag down your waiter, or
   - Click "Request Bill" in app

2. **Review Bill:**
   - Subtotal (all items)
   - Tax (10%)
   - Optional tip
   - Total amount

3. **Choose Payment Method**

4. **Complete Payment:**
   - Follow payment method instructions
   - Wait for confirmation
   - Receipt available for download

### Tips

- Tips are optional but appreciated
- Common tip amounts: 50,000 - 100,000 VND
- You can adjust tip amount before paying

---

## Leaving Reviews

### Why Review?

- Help other customers make informed choices
- Provide feedback to the restaurant
- Contribute to menu improvements

### How to Leave a Review

1. **After your meal**, navigate to "My Orders"
2. **Select a completed order**
3. **Click "Leave Review"** on individual items
4. **Rate your experience:**
   - 1 Star: Poor
   - 2 Stars: Below Average
   - 3 Stars: Average
   - 4 Stars: Good
   - 5 Stars: Excellent

5. **Write a comment (optional):**
   - What did you love?
   - What could be improved?
   - Specific feedback on taste, presentation, portion size

6. **Submit Review**

### Review Guidelines

**Do:**
- Be honest and constructive
- Mention specific aspects (taste, temperature, presentation)
- Consider context (busy times, special requests)

**Don't:**
- Use offensive language
- Include personal attacks
- Review items you didn't actually order

---

## Account Features (Optional)

### Creating an Account

**Benefits:**
- Save favorite items
- View order history
- Faster checkout
- Personalized recommendations
- Track loyalty points (if available)

**Sign Up:**
1. Click "Sign Up" in top-right corner
2. Enter:
   - Email address
   - Full name
   - Password (min. 8 characters)
   - Phone number (optional)
3. Verify email
4. Account created!

### Sign In Options

- **Email & Password**
- **Google Sign-In** (Quick & Easy)

### Account Management

**Profile Settings:**
- Update personal information
- Change password
- Set dietary preferences
- Manage notifications

**Order History:**
- View all past orders
- Reorder favorite meals (one click)
- Download receipts

**Favorites:**
- Save frequently ordered items
- Quick access to your favorites
- Get notified about specials

---

## 🍴 Common Scenarios

### Scenario 1: Dining with Friends

**Group Ordering:**
1. One person scans the QR code
2. Share the link with your group
3. Everyone adds their items
4. One person submits the combined order
5. Split payment at the end (discuss with waiter)

### Scenario 2: Food Allergies

**Important Steps:**
1. Check dietary information on each item
2. Add allergy notes in "Special Instructions"
3. Inform your waiter upon arrival
4. Kitchen will be notified of allergies

### Scenario 3: Modifying an Order

**Before Kitchen Starts (SUBMITTED/RECEIVED):**
- Inform your waiter immediately
- They can cancel or modify the order

**After Kitchen Starts (PREPARING):**
- Difficult to modify
- You may need to place an additional order
- Original order will still be prepared

### Scenario 4: Item Out of Stock

**If an item is unavailable:**
1. System shows "Out of Stock" badge
2. Cannot add to cart
3. Ask waiter for:
   - Expected availability time
   - Alternative recommendations

### Scenario 5: Long Wait Time

**What to do:**
1. Check order status in app
2. If status hasn't updated in 15+ minutes:
   - Flag your waiter
   - They can check with kitchen
3. Kitchen prioritizes based on:
   - Order time
   - Item complexity
   - Current workload

---

##  App Features

### Navigation Menu

**Main Sections:**
- **Home**: Menu overview
- **Menu**: Browse all items
- **Cart**: Current order items
- **My Orders**: Order history & tracking
- **Profile**: Account settings (if logged in)

### Notifications

**You'll receive notifications for:**
- Order status changes
- Special promotions
- Table service requests
- Payment confirmations

**Notification Settings:**
- Enable/disable in Profile
- Browser push notifications
- Email notifications (if account)

### Offline Mode

**Limited functionality:**
- View cached menu items
- Cannot place new orders
- Cannot track real-time status
- Reconnects automatically when online

---

## Tips for Best Experience

### Before Ordering

Check item availability before deciding
Read descriptions carefully (portion sizes, ingredients)
Check reviews for popular recommendations
Note preparation times for time-sensitive meals
Inform staff of dietary restrictions early

### During Your Meal

Track order status for estimated arrival time
Keep app open for real-time updates
Notify waiter of any issues immediately
Take photos for social media (tag us!)

### Payment Time

Review bill carefully before paying
Have payment method ready
Consider adding a tip for great service
Download receipt for expense tracking

---

## ❓ Frequently Asked Questions

### General Questions

**Q: Do I need to create an account?**
A: No! You can order as a guest. Accounts are optional for additional features.

**Q: Can I order for takeaway?**
A: Currently, our system is for dine-in only. Call us for takeaway orders.

**Q: How do I know my table number?**
A: It's printed on the QR code stand at your table, or ask your waiter.

**Q: Can I change my order after submitting?**
A: Only if the kitchen hasn't started preparing it. Inform your waiter ASAP.

### Menu Questions

**Q: Why can't I see prices?**
A: Ensure you're connected to the internet. Prices load with the menu.

**Q: What does "Out of Stock" mean?**
A: That item is temporarily unavailable. Ask waiter for alternatives.

**Q: How accurate are preparation times?**
A: They're estimates based on typical kitchen workload. May vary during peak hours.

**Q: Are photos of actual dishes?**
A: Yes! All photos are of the actual dishes we serve.

### Order Questions

**Q: I submitted my order but nothing happened?**
A: Check your internet connection. If issues persist, inform your waiter.

**Q: Can I cancel my order?**
A: Before it's accepted by kitchen (SUBMITTED status), yes. After that, no.

**Q: My order status hasn't updated in a while?**
A: This is unusual. Flag your waiter to check kitchen status.

**Q: Can I order from multiple categories?**
A: Yes! Mix and match appetizers, mains, desserts, and drinks freely.

### Payment Questions

**Q: When do I pay?**
A: After your meal, when you're ready to leave. Request the bill from your waiter.

**Q: Can we split the bill?**
A: Yes! Inform your waiter. They can split by:
   - Number of people (equal split)
   - Individual items ordered
   - Custom amounts

**Q: Is tipping required?**
A: No, but appreciated for good service. Typical tips: 10-15% of bill.

**Q: What if my payment fails?**
A: Try again or choose a different payment method. Waiter can assist.

**Q: Can I get a receipt?**
A: Yes! Digital receipt available immediately after payment. Print option available at counter.

### Technical Issues

**Q: The menu won't load?**
A: Check WiFi connection. Try refreshing the page. Inform staff if issue persists.

**Q: I can't add items to cart?**
A: Ensure items are "Available" (not out of stock). Try clearing browser cache.

**Q: The QR code doesn't work?**
A: Use a different QR scanner app or manually visit the URL provided.

**Q: App is running slowly?**
A: Close other browser tabs. WiFi might be congested during peak hours.

---

## 🆘 Need Help?

### Getting Assistance

**During Your Visit:**
1. **Flag your waiter** - They're here to help!
2. **Call restaurant**: `+84 28 3823 4567`
3. **Use "Request Help" button** in app (if available)

**After Your Visit:**
- **Email**: contact@cafepoirot.com
- **Social Media**: @CafePoirot
- **Feedback Form**: Available in app after payment

### Emergency Situations

**Food Safety Concerns:**
- Inform waiter immediately
- We take food safety very seriously
- Issue will be escalated to management

**Medical Emergencies:**
- Alert staff immediately
- We have first aid trained staff
- Emergency services will be contacted if needed

---

## 📞 Contact Information

**Café Poirot**
- **Address**: 123 Nguyen Hue, District 1, Ho Chi Minh City
- **Phone**: +84 28 3823 4567
- **Email**: contact@cafepoirot.com
- **Website**: www.cafepoirot.com

**Opening Hours:**
- Monday - Thursday: 8:00 AM - 10:00 PM
- Friday: 8:00 AM - 11:00 PM
- Saturday: 9:00 AM - 11:00 PM
- Sunday: 9:00 AM - 10:00 PM

**Social Media:**
- Facebook: @CafePoirot
- Instagram: @cafepoirot
- TikTok: @cafepoirot

---

## 🎁 Special Features

### Loyalty Program (Coming Soon!)

- Earn points with every order
- Redeem for discounts and free items
- Special birthday treats
- VIP member benefits

### Special Occasions

**Birthday Celebrations:**
- Inform staff when booking/arriving
- Complimentary dessert
- Birthday song & candles
- Special photo opportunity

**Anniversaries & Special Events:**
- Pre-order custom cakes
- Table decorations available
- Special menu recommendations

---

## 📝 Feedback & Suggestions

We value your input! Help us improve:

**How to Provide Feedback:**
1. Complete the post-meal survey
2. Leave reviews on menu items
3. Email suggestions to: feedback@cafepoirot.com
4. Fill out feedback forms at the counter

**What We Want to Hear:**
- Menu suggestions (new dishes you'd like)
- Service improvements
- Technical issues with the app
- General dining experience feedback

---

## 🌟 Thank You for Choosing Café Poirot!

We're committed to providing you with an exceptional dining experience. Our smart ordering system is designed to make your visit convenient and enjoyable, while our dedicated staff ensures you receive the best service possible.

**Bon Appétit!** 🍽️

---

*Last Updated: January 20, 2026*
*Version 1.0*

---

## Quick Reference Card

### Essential Actions

| What You Want | What To Do |
|---------------|------------|
| Start ordering | Scan QR code at your table |
| View menu | Browse categories or search |
| Add to cart | Click item → Customize → Add |
| Check order status | Go to "My Orders" → View order |
| Request bill | Flag waiter or click "Request Bill" |
| Pay | Choose payment method and follow steps |
| Leave review | My Orders → Select order → Rate items |
| Get help | Flag waiter or call restaurant |

### Emergency Contacts

- **Restaurant**: +84 28 3823 4567
- **Emergency Services**: 115
- **Police**: 113

---

*Enjoy your meal and have a wonderful dining experience at Café Poirot!* 🎉
