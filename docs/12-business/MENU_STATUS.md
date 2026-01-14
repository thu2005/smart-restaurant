MenuItem có 2 field trong DB:
- `isAvailable` (Boolean) - Admin bật/tắt món
- `stockStatus` (String) - Tình trạng kho: `"available"`, `"low_stock"`, `"sold_out"`

Backend tự động tính ra field `status` để frontend dùng.

## Logic Tính Status

```javascript
if (stockStatus === 'sold_out') → status = 'sold_out'     // Hết hàng
else if (stockStatus === 'low_stock') → status = 'low_stock' // Sắp hết
else if (isAvailable === false) → status = 'unavailable'   // Admin tắt
else → status = 'available'                                 // Bình thường
```

## 4 Trạng Thái

| Status | Màu | Order được? | Ý nghĩa |
|--------|-----|-------------|---------|
| `available` | 🟢 Xanh | ✅ Được | Món bình thường |
| `low_stock` | 🟡 Vàng | ✅ Được | Sắp hết (cảnh báo) |
| `sold_out` | 🟠 Cam | ❌ Không | Hết hàng |
| `unavailable` | ⚫ Xám | ❌ Không | Admin tắt |

## Ví Dụ

**Món hết hàng:**
```javascript
{ isAvailable: true, stockStatus: "sold_out" } → status = "sold_out"
```

**Admin tắt món:**
```javascript
{ isAvailable: false, stockStatus: "available" } → status = "unavailable"
```

**Món sắp hết:**
```javascript
{ isAvailable: true, stockStatus: "low_stock" } → status = "low_stock"
```

## API Filter

```javascript
GET /api/menu/:restaurantId/items?status=available   // Chỉ món có thể order
GET /api/menu/:restaurantId/items?status=low_stock   // Món sắp hết
GET /api/menu/:restaurantId/items?status=sold_out    // Món hết hàng
GET /api/menu/:restaurantId/items?status=unavailable // Món admin tắt
```
