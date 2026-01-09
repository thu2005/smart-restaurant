## Missing APIs - TO BE IMPLEMENTED

### 1. Customer Menu Filters & Sorting ✅ ALREADY SUPPORTED
**Backend already supports these query parameters:**
- `search`: Text search on item name/description
- `categoryId`: Filter by category
- `status`: Filter availability (`available`, `unavailable`, `sold_out`)
- `isChefRecommended`: Filter by chef recommendations
- `sortBy`: Sort options (`createdAt`, `price`, `price_desc`, `name`, `popularity`)
- `page`, `limit`: Pagination with response `{ page, limit, total, totalPages }`

**Frontend TODO:** Implement customer menu with:
- Search bar → API `?search=...`
- Category tabs → API `?categoryId=...`
- Availability filter → API `?status=available`
- Chef Recommended toggle → API `?isChefRecommended=true`
- Sort dropdown → API `?sortBy=popularity|price|createdAt`
- Pagination UI → API `?page=X&limit=Y`

### 2. Average Rating & Review Count ⚠️ NEW
**Requirements:**
- Bổ sung thông tin đánh giá vào `MenuItem` object:
  - `averageRating`: Điểm trung bình (ví dụ: 4.8).
  - `reviewCount`: Tổng số lượng đánh giá.
- Áp dụng cho cả API danh sách và chi tiết món ăn.

### 3. Nutritional Information ⚠️ CRITICAL MISSING
**Database Schema Changes Required:**
Add to MenuItem model:
```javascript
nutritionalInfo: {
  calories: Number,
  protein: String,    // e.g. "42g"
  carbs: String,     // e.g. "28g" 
  fat: String,       // e.g. "26g"
  fiber: String,     // e.g. "4g"
  sodium: String,    // e.g. "680mg"
  sugar: String,     // e.g. "3g"
  cholesterol: String // e.g. "95mg"
},
ingredients: [String], // Array of ingredient names
allergens: [String]    // Array of allergen info
```

**API Endpoints:**
- **GET** `/menu/{restaurantId}/items/{itemId}/nutrition` - Get nutritional data
- **PUT** `/menu/items/{itemId}/nutrition` - Update nutrition (admin only)

### 4. Related Items Algorithm
- **GET** `/menu/{restaurantId}/items/{itemId}/related` - Get related menu items based on category/tags

### 5. Enhanced Menu Features
- **GET** `/menu/{restaurantId}/items/popular` - Get popular items (based on orderCount)
- **GET** `/menu/{restaurantId}/categories/{categoryId}/items` - Get items by category