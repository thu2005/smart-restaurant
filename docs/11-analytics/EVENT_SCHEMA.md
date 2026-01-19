# Analytics Event Schema & Instrumentation Plan

> **Last Updated**: January 19, 2026  
> **Purpose**: Define event taxonomy, KPIs, and instrumentation strategy  
> **Tools**: Prometheus, Metabase, Custom Analytics Service

## Table of Contents
- [Overview](#overview)
- [Event Taxonomy](#event-taxonomy)
- [Key Performance Indicators (KPIs)](#key-performance-indicators-kpis)
- [Event Schema](#event-schema)
- [Instrumentation Plan](#instrumentation-plan)
- [Metrics Collection](#metrics-collection)
- [Dashboard Configuration](#dashboard-configuration)

---

## Overview

The Smart Restaurant system tracks comprehensive analytics across the customer journey, operational efficiency, and business performance. This document defines the event schema, KPIs, and instrumentation approach.

**Analytics Stack:**
- **Prometheus**: System metrics (HTTP requests, response times, error rates)
- **Metabase**: Business intelligence and reporting dashboards
- **Custom Service**: Application-level event tracking
- **Socket.IO**: Real-time event streaming

**Data Storage:**
- PostgreSQL: Transactional data and analytics aggregations
- Prometheus: Time-series metrics (7-day retention)
- Metabase: BI queries on PostgreSQL

---

## Event Taxonomy

### Event Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Customer Journey** | Customer interactions and ordering flow | menu_viewed, item_added_to_cart, order_placed |
| **Order Lifecycle** | Order status transitions | order_submitted, order_accepted, order_served |
| **Payment** | Payment transactions | payment_initiated, payment_completed, payment_failed |
| **Menu Management** | Menu item interactions | item_updated, category_created, modifier_added |
| **Staff Operations** | Staff actions and workflow | order_accepted_by_waiter, bill_generated, table_cleaned |
| **System** | System health and performance | api_request, error_occurred, websocket_connected |

### Event Naming Convention

**Format:** `<object>_<action>_<context?>`

**Examples:**
- `order_created`
- `payment_completed`
- `menu_item_viewed`
- `cart_abandoned`
- `table_occupied`

---

## Key Performance Indicators (KPIs)

### Business KPIs

#### Revenue Metrics

| KPI | Definition | Calculation | Target |
|-----|------------|-------------|--------|
| **Total Revenue** | Total payments completed | SUM(payment.total) WHERE status = 'COMPLETED' | - |
| **Average Order Value (AOV)** | Average revenue per order | Total Revenue / Total Orders | 150,000 VND |
| **Revenue Per Table** | Revenue by table | SUM(payment.total) GROUP BY tableId | - |
| **Revenue Per Menu Item** | Revenue by item | SUM(orderItem.quantity * orderItem.unitPrice) GROUP BY menuItemId | - |
| **Daily Revenue** | Revenue per day | SUM(payment.total) GROUP BY DATE(createdAt) | - |
| **Monthly Recurring Revenue** | Revenue per month | SUM(payment.total) GROUP BY MONTH(createdAt) | - |

#### Order Metrics

| KPI | Definition | Calculation | Target |
|-----|------------|-------------|--------|
| **Total Orders** | Count of completed orders | COUNT(orders) WHERE status IN ('COMPLETED', 'SERVED') | - |
| **Orders Per Hour** | Orders during peak/off-peak | COUNT(orders) GROUP BY HOUR(submittedAt) | - |
| **Order Acceptance Rate** | % of orders accepted | COUNT(status='RECEIVED') / COUNT(status='SUBMITTED') * 100 | > 95% |
| **Order Rejection Rate** | % of orders rejected | COUNT(status='REJECTED') / COUNT(status='SUBMITTED') * 100 | < 5% |
| **Average Items Per Order** | Items per order | AVG(COUNT(orderItems) GROUP BY orderId) | 3.5 items |
| **Repeat Order Rate** | % customers ordering again | COUNT(DISTINCT customerId with >1 order) / COUNT(DISTINCT customerId) * 100 | > 40% |

#### Operational Efficiency

| KPI | Definition | Calculation | Target |
|-----|------------|-------------|--------|
| **Average Preparation Time** | Time from RECEIVED to READY | AVG(readyAt - acceptedAt) | < 20 min |
| **Average Service Time** | Time from READY to SERVED | AVG(servedAt - readyAt) | < 5 min |
| **Order Cycle Time** | End-to-end order time | AVG(servedAt - submittedAt) | < 30 min |
| **Table Turnover Rate** | Orders per table per day | COUNT(orders) / COUNT(DISTINCT tableId) / days | 8 orders/day |
| **Kitchen Efficiency** | Orders ready on time | COUNT(readyAt < expectedTime) / COUNT(orders) * 100 | > 90% |

#### Customer Satisfaction

| KPI | Definition | Calculation | Target |
|-----|------------|-------------|--------|
| **Average Rating** | Average menu item rating | AVG(review.rating) | > 4.0 / 5.0 |
| **Review Rate** | % orders with reviews | COUNT(reviews) / COUNT(completed_orders) * 100 | > 15% |
| **Net Promoter Score (NPS)** | Customer loyalty metric | % Promoters - % Detractors | > 50 |

### Technical KPIs

#### Performance Metrics

| KPI | Definition | Target |
|-----|------------|--------|
| **API Response Time (P95)** | 95th percentile response time | < 500ms |
| **API Response Time (P99)** | 99th percentile response time | < 1000ms |
| **Error Rate** | % of failed requests | < 1% |
| **Database Query Time** | Average query execution | < 100ms |
| **WebSocket Latency** | Real-time event delay | < 200ms |

#### Availability Metrics

| KPI | Definition | Target |
|-----|------------|--------|
| **Uptime** | System availability | > 99.5% |
| **Mean Time Between Failures (MTBF)** | Average time between incidents | > 720 hours (30 days) |
| **Mean Time To Recovery (MTTR)** | Average recovery time | < 15 minutes |

---

## Event Schema

### Standard Event Structure

All events follow a standardized schema:

```javascript
{
  "eventId": "uuid",
  "eventName": "string",
  "eventType": "enum[customer|order|payment|system]",
  "timestamp": "ISO8601",
  "restaurantId": "uuid",
  "userId": "uuid?",
  "sessionId": "string?",
  "properties": {
    // Event-specific data
  },
  "context": {
    "ip": "string",
    "userAgent": "string",
    "platform": "web|mobile|tablet",
    "source": "customer_app|staff_dashboard|kitchen_display"
  }
}
```

### Customer Journey Events

#### 1. Menu Browsing

**Event: `menu_viewed`**
```javascript
{
  "eventName": "menu_viewed",
  "eventType": "customer",
  "timestamp": "2026-01-19T10:00:00Z",
  "restaurantId": "uuid",
  "sessionId": "session_xyz",
  "properties": {
    "tableId": "uuid",
    "qrCode": "QR123",
    "categoryCount": 5,
    "itemCount": 42
  }
}
```

**Event: `menu_item_viewed`**
```javascript
{
  "eventName": "menu_item_viewed",
  "eventType": "customer",
  "properties": {
    "menuItemId": "uuid",
    "itemName": "Grilled Salmon",
    "price": 250000,
    "categoryId": "uuid",
    "categoryName": "Main Course"
  }
}
```

#### 2. Cart Management

**Event: `item_added_to_cart`**
```javascript
{
  "eventName": "item_added_to_cart",
  "eventType": "customer",
  "properties": {
    "cartId": "uuid",
    "menuItemId": "uuid",
    "itemName": "Grilled Salmon",
    "quantity": 2,
    "unitPrice": 250000,
    "modifiers": [
      {
        "modifierId": "uuid",
        "modifierName": "Extra Spicy",
        "priceAdjustment": 10000
      }
    ],
    "totalPrice": 520000
  }
}
```

**Event: `item_removed_from_cart`**
```javascript
{
  "eventName": "item_removed_from_cart",
  "eventType": "customer",
  "properties": {
    "cartId": "uuid",
    "menuItemId": "uuid",
    "itemName": "Grilled Salmon"
  }
}
```

**Event: `cart_abandoned`**
```javascript
{
  "eventName": "cart_abandoned",
  "eventType": "customer",
  "properties": {
    "cartId": "uuid",
    "itemCount": 3,
    "totalValue": 520000,
    "abandonReason": "timeout|user_exit|unknown"
  }
}
```

#### 3. Order Placement

**Event: `order_submitted`**
```javascript
{
  "eventName": "order_submitted",
  "eventType": "order",
  "properties": {
    "orderId": "uuid",
    "orderNumber": "ORD-0051",
    "tableId": "uuid",
    "itemCount": 3,
    "subtotal": 500000,
    "specialInstructions": "No onions",
    "customerType": "guest|registered"
  }
}
```

### Order Lifecycle Events

**Event: `order_accepted`**
```javascript
{
  "eventName": "order_accepted",
  "eventType": "order",
  "properties": {
    "orderId": "uuid",
    "orderNumber": "ORD-0051",
    "acceptedById": "uuid",
    "waiterName": "John Doe",
    "acceptanceTime": 45 // seconds from submission
  }
}
```

**Event: `order_rejected`**
```javascript
{
  "eventName": "order_rejected",
  "eventType": "order",
  "properties": {
    "orderId": "uuid",
    "orderNumber": "ORD-0051",
    "rejectedById": "uuid",
    "rejectionReason": "Out of ingredient X"
  }
}
```

**Event: `order_preparing`**
```javascript
{
  "eventName": "order_preparing",
  "eventType": "order",
  "properties": {
    "orderId": "uuid",
    "orderNumber": "ORD-0051",
    "kitchenStaffId": "uuid",
    "estimatedPrepTime": 20 // minutes
  }
}
```

**Event: `order_ready`**
```javascript
{
  "eventName": "order_ready",
  "eventType": "order",
  "properties": {
    "orderId": "uuid",
    "orderNumber": "ORD-0051",
    "actualPrepTime": 18, // minutes
    "itemCount": 3
  }
}
```

**Event: `order_served`**
```javascript
{
  "eventName": "order_served",
  "eventType": "order",
  "properties": {
    "orderId": "uuid",
    "orderNumber": "ORD-0051",
    "servedById": "uuid",
    "totalCycleTime": 25 // minutes from submission
  }
}
```

### Payment Events

**Event: `payment_initiated`**
```javascript
{
  "eventName": "payment_initiated",
  "eventType": "payment",
  "properties": {
    "paymentId": "uuid",
    "orderId": "uuid",
    "amount": 550000,
    "method": "STRIPE|MOMO|VNPAY|CASH",
    "currency": "VND"
  }
}
```

**Event: `payment_completed`**
```javascript
{
  "eventName": "payment_completed",
  "eventType": "payment",
  "properties": {
    "paymentId": "uuid",
    "orderId": "uuid",
    "amount": 550000,
    "tip": 50000,
    "total": 600000,
    "method": "STRIPE",
    "gatewayTransactionId": "pi_xyz123",
    "processingTime": 3.2 // seconds
  }
}
```

**Event: `payment_failed`**
```javascript
{
  "eventName": "payment_failed",
  "eventType": "payment",
  "properties": {
    "paymentId": "uuid",
    "orderId": "uuid",
    "amount": 550000,
    "method": "STRIPE",
    "errorCode": "insufficient_funds",
    "errorMessage": "Card declined"
  }
}
```

### System Events

**Event: `api_request`**
```javascript
{
  "eventName": "api_request",
  "eventType": "system",
  "properties": {
    "method": "POST",
    "endpoint": "/api/orders",
    "statusCode": 201,
    "responseTime": 245, // ms
    "userId": "uuid"
  }
}
```

**Event: `error_occurred`**
```javascript
{
  "eventName": "error_occurred",
  "eventType": "system",
  "properties": {
    "errorType": "DatabaseError",
    "errorMessage": "Connection timeout",
    "stackTrace": "...",
    "endpoint": "/api/orders",
    "userId": "uuid"
  }
}
```

---

## Instrumentation Plan

### Backend Instrumentation

#### 1. Prometheus Metrics (Already Implemented)

**Current Metrics:**
```javascript
// HTTP Request Duration Histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Total Requests Counter
const totalRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});
```

**Access Metrics:**
```http
GET /metrics
```

**Response Format:** Prometheus text format
```
# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="POST",route="/api/orders",code="201",le="0.1"} 45
http_request_duration_seconds_bucket{method="POST",route="/api/orders",code="201",le="0.3"} 98
...
```

#### 2. Socket.IO Event Tracking

**Events Emitted (Already Implemented):**
- `new_order` → Order submitted
- `order_status_update` → Order status changed
- `payment_received` → Payment completed
- `order_items_added` → Items added to order

**Instrumentation Code:**
```javascript
// backend/src/controllers/order.controller.js
const io = req.app.get('io');
if (io) {
  io.to(req.body.restaurantId).emit('new_order', order);
  
  // Track event (future)
  analyticsService.track({
    eventName: 'order_submitted',
    restaurantId: order.restaurantId,
    properties: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      itemCount: order.orderItems.length
    }
  });
}
```

#### 3. Database Queries for Analytics

**Revenue Report (Already Implemented):**
```javascript
// backend/src/services/report.service.js
async getRevenueReport(restaurantId, startDate, endDate) {
  const bills = await prisma.bill.findMany({
    where: {
      restaurantId,
      createdAt: { gte: start, lte: end }
    },
    include: {
      order: { include: { orderItems: true } }
    }
  });
  
  // Calculate metrics
  const totalRevenue = bills.reduce((sum, bill) => sum + parseFloat(bill.total), 0);
  const totalOrders = bills.length;
  const averageOrderValue = totalRevenue / totalOrders;
  
  return { totalRevenue, totalOrders, averageOrderValue };
}
```

### Frontend Instrumentation

#### 1. Page View Tracking

**Implementation (Recommended):**
```javascript
// frontend/src/analytics.js
export const trackPageView = (pageName, properties = {}) => {
  const event = {
    eventName: 'page_viewed',
    eventType: 'customer',
    timestamp: new Date().toISOString(),
    properties: {
      pageName,
      ...properties
    },
    context: {
      userAgent: navigator.userAgent,
      platform: getPlatform(),
      source: 'customer_app'
    }
  };
  
  // Send to backend
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
};

// Usage in React component
useEffect(() => {
  trackPageView('menu', {
    restaurantId: params.restaurantId,
    tableId: params.tableId
  });
}, []);
```

#### 2. User Interaction Tracking

**Click Tracking:**
```javascript
// Track menu item view
const handleItemClick = (item) => {
  trackEvent('menu_item_viewed', {
    menuItemId: item.id,
    itemName: item.name,
    price: item.price,
    categoryId: item.categoryId
  });
  
  // Show item details
  setSelectedItem(item);
};

// Track add to cart
const handleAddToCart = (item, quantity, modifiers) => {
  trackEvent('item_added_to_cart', {
    menuItemId: item.id,
    itemName: item.name,
    quantity,
    modifiers,
    totalPrice: calculateTotal(item, quantity, modifiers)
  });
  
  // Add to cart
  addToCart(item, quantity, modifiers);
};
```

#### 3. Cart Abandonment Tracking

**Implementation:**
```javascript
// Track cart abandonment on unmount
useEffect(() => {
  const handleBeforeUnload = () => {
    if (cart.items.length > 0 && !orderSubmitted) {
      trackEvent('cart_abandoned', {
        cartId: cart.id,
        itemCount: cart.items.length,
        totalValue: cart.total,
        abandonReason: 'user_exit'
      });
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [cart, orderSubmitted]);
```

---

## Metrics Collection

### Data Sources

| Source | Data Type | Frequency | Retention |
|--------|-----------|-----------|-----------|
| **PostgreSQL** | Transactional data | Real-time | Indefinite |
| **Prometheus** | System metrics | 15s scrape interval | 7 days |
| **Socket.IO Events** | Real-time events | Event-driven | - |
| **Application Logs** | Error logs, audit trails | Real-time | 30 days |

### Aggregation Strategy

**Pre-aggregated Metrics (Recommended):**

Create materialized views or scheduled jobs for common queries:

```sql
-- Daily revenue summary
CREATE MATERIALIZED VIEW daily_revenue_summary AS
SELECT
  DATE(b.createdAt) as date,
  b.restaurantId,
  COUNT(DISTINCT b.orderId) as total_orders,
  SUM(b.total) as total_revenue,
  AVG(b.total) as average_order_value,
  COUNT(DISTINCT o.customerId) as unique_customers
FROM bills b
JOIN orders o ON b.orderId = o.id
WHERE b.createdAt >= NOW() - INTERVAL '90 days'
GROUP BY DATE(b.createdAt), b.restaurantId;

-- Refresh daily
REFRESH MATERIALIZED VIEW daily_revenue_summary;
```

**Real-time Aggregation:**

For live dashboards, query directly with optimized indexes:

```javascript
// Get real-time stats
const todayStats = await prisma.$queryRaw`
  SELECT
    COUNT(*) as total_orders,
    SUM(total) as total_revenue,
    AVG(total) as avg_order_value
  FROM bills
  WHERE restaurantId = ${restaurantId}
    AND DATE(createdAt) = CURRENT_DATE
`;
```

---

## Dashboard Configuration

### Metabase Integration (Already Implemented)

**Configuration:**
```javascript
// backend/src/controllers/report.controller.js
exports.getMetabaseDashboardUrl = async (req, res) => {
  const payload = {
    resource: { dashboard: METABASE_DASHBOARD_ID },
    params: {
      restaurant_id: req.user.restaurantId // Filter by restaurant
    },
    exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 min expiry
  };
  
  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
  
  res.json({ success: true, data: { iframeUrl } });
};
```

### Recommended Dashboards

#### 1. Executive Dashboard

**Metrics:**
- Today's Revenue (vs. yesterday, vs. last week)
- Total Orders (hourly breakdown)
- Average Order Value (trend)
- Top 5 Menu Items (by revenue)
- Customer Satisfaction (average rating)

**Charts:**
- Revenue line chart (last 30 days)
- Orders by hour heatmap
- Menu item revenue pie chart
- Rating distribution histogram

#### 2. Operations Dashboard

**Metrics:**
- Orders in Queue (SUBMITTED)
- Orders Preparing (PREPARING)
- Orders Ready (READY)
- Average Prep Time (today vs. target)
- Table Occupancy Rate

**Charts:**
- Order flow funnel (SUBMITTED → COMPLETED)
- Prep time distribution box plot
- Table status pie chart
- Kitchen efficiency trend

#### 3. Financial Dashboard

**Metrics:**
- Daily/Weekly/Monthly Revenue
- Revenue by Payment Method
- Discount Applied
- Tips Received
- Tax Collected

**Charts:**
- Revenue trend (daily/weekly/monthly)
- Payment method breakdown
- Profit margin analysis

---

## Implementation Roadmap

### Phase 1: Core Instrumentation (Current)
- Prometheus metrics for HTTP requests
- Socket.IO real-time events
- Revenue report service
- Metabase integration

### Phase 2: Enhanced Tracking (Next 3 months)
- Frontend event tracking (page views, clicks, cart actions)
- Custom analytics service
- Cart abandonment tracking
- Customer journey funnel analysis

### Phase 3: Advanced Analytics (Next 6 months)
- Predictive analytics (demand forecasting)
- Cohort analysis
- A/B testing framework
- Real-time alerting (revenue drops, error spikes)

### Phase 4: Machine Learning (Future)
- Personalized menu recommendations
- Dynamic pricing optimization
- Churn prediction
- Inventory optimization

---

## Appendix

### Query Examples

**Get Top 10 Menu Items by Revenue:**
```sql
SELECT
  mi.name,
  mi.id,
  SUM(oi.quantity * oi.unitPrice) as total_revenue,
  SUM(oi.quantity) as total_quantity,
  COUNT(DISTINCT oi.orderId) as order_count
FROM order_items oi
JOIN menu_items mi ON oi.menuItemId = mi.id
JOIN orders o ON oi.orderId = o.id
WHERE o.restaurantId = '${restaurantId}'
  AND o.status = 'COMPLETED'
  AND o.createdAt >= NOW() - INTERVAL '30 days'
GROUP BY mi.id, mi.name
ORDER BY total_revenue DESC
LIMIT 10;
```

**Get Order Cycle Time Analysis:**
```sql
SELECT
  orderNumber,
  EXTRACT(EPOCH FROM (servedAt - submittedAt)) / 60 as cycle_time_minutes,
  EXTRACT(EPOCH FROM (acceptedAt - submittedAt)) / 60 as acceptance_time,
  EXTRACT(EPOCH FROM (readyAt - acceptedAt)) / 60 as prep_time,
  EXTRACT(EPOCH FROM (servedAt - readyAt)) / 60 as service_time
FROM orders
WHERE restaurantId = '${restaurantId}'
  AND status = 'SERVED' OR status = 'COMPLETED'
  AND submittedAt >= NOW() - INTERVAL '7 days'
ORDER BY submittedAt DESC;
```
