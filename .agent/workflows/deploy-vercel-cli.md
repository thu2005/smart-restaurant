---
description: Deploy frontend lên Vercel bằng CLI từ branch feat/menu-management
---

# Deploy Frontend lên Vercel bằng CLI

## Bước 1: Cài đặt Vercel CLI

```bash
npm install -g vercel
```

## Bước 2: Login vào Vercel

```bash
vercel login
```

Làm theo hướng dẫn để login (sẽ mở browser).

## Bước 3: Di chuyển vào thư mục frontend

```bash
cd frontend
```

## Bước 4: Deploy lên production

```bash
vercel --prod
```

Khi được hỏi:
- **Set up and deploy**: `Y` (Yes)
- **Which scope**: Chọn account của bạn
- **Link to existing project**: `N` (No) - tạo project mới
- **What's your project's name**: `smart-restaurant-frontend` (hoặc tên bạn muốn)
- **In which directory is your code located**: `./` (vì đã ở trong frontend)
- **Want to override the settings**: `N` (No)

## Bước 5: Cấu hình Environment Variables (nếu cần)

Nếu deploy xong mà chưa có env vars:

```bash
# Thêm VITE_API_URL
vercel env add VITE_API_URL production

# Khi được hỏi, nhập: https://your-backend.onrender.com/api
```

Sau đó redeploy:

```bash
vercel --prod
```

## Bước 6: Lấy URL

Sau khi deploy xong, CLI sẽ hiển thị URL production:
```
✅ Production: https://smart-restaurant-frontend.vercel.app
```

Copy URL này và cập nhật vào Render backend environment variables.

## Lưu ý

- CLI sẽ tự động deploy từ branch hiện tại (`feat/menu-management`)
- Mỗi lần chạy `vercel --prod` sẽ tạo một production deployment mới
- Có thể xem tất cả deployments tại: https://vercel.com/dashboard
