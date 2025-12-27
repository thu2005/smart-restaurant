---
description: Hướng dẫn deploy nhánh menu-management lên Vercel và Render
---

# Deploy nhánh menu-management

## Bước 1: Chuẩn bị và đẩy code lên GitHub

Đảm bảo tất cả thay đổi đã được commit và push lên nhánh `feat/menu-management`:

```bash
# Kiểm tra trạng thái
git status

# Add và commit nếu có thay đổi
git add .
git commit -m "Add deployment configs for menu-management"

# Push lên remote
git push origin feat/menu-management
```

## Bước 2: Deploy Backend lên Render

### 2.1. Tạo Web Service trên Render

1. Truy cập [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Kết nối với GitHub repository của bạn
4. Chọn repository: `smart-restaurant`
5. Chọn branch: `feat/menu-management`

### 2.2. Cấu hình Web Service

Điền các thông tin sau:

- **Name**: `smart-restaurant-backend` (hoặc tên bạn muốn)
- **Region**: Singapore (hoặc gần bạn nhất)
- **Branch**: `feat/menu-management`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (hoặc plan bạn muốn)

### 2.3. Thêm Environment Variables

Trong phần **Environment Variables**, thêm các biến sau:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<your-secure-jwt-secret>
JWT_EXPIRE=7d
FRONTEND_URL=<your-vercel-frontend-url>
QR_BASE_URL=<your-vercel-frontend-url>
```

**Lưu ý quan trọng:**
- `DATABASE_URL`: Bạn cần tạo PostgreSQL database trên Render hoặc dùng service khác (ElephantSQL, Supabase, etc.)
- `FRONTEND_URL`: Sẽ cập nhật sau khi deploy frontend (bước 3)
- `JWT_SECRET`: Tạo một chuỗi ngẫu nhiên mạnh (có thể dùng: `openssl rand -base64 32`)

### 2.4. Tạo PostgreSQL Database trên Render (nếu chưa có)

1. Click **"New +"** → **"PostgreSQL"**
2. Chọn **Name**: `smart-restaurant-db`
3. Chọn **Region**: Cùng region với backend
4. Chọn **Instance Type**: `Free`
5. Click **"Create Database"**
6. Copy **Internal Database URL** và paste vào `DATABASE_URL` của Web Service

### 2.5. Deploy

Click **"Create Web Service"** và đợi Render build & deploy.

Sau khi deploy thành công, bạn sẽ có URL backend: `https://smart-restaurant-backend-xxxx.onrender.com`

## Bước 3: Deploy Frontend lên Vercel

### 3.1. Cập nhật file .env.production

Cập nhật file `frontend/.env.production` với URL backend vừa deploy:

```
VITE_API_URL=https://smart-restaurant-backend-xxxx.onrender.com/api
```

Commit và push thay đổi:

```bash
git add frontend/.env.production
git commit -m "Update backend URL for production"
git push origin feat/menu-management
```

### 3.2. Deploy lên Vercel

#### Cách 1: Qua Vercel Dashboard (Khuyến nghị)

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import repository `smart-restaurant`
4. Trong **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Trong **Environment Variables**, thêm:
   ```
   VITE_API_URL=https://smart-restaurant-backend-xxxx.onrender.com/api
   ```

6. Trong **Git Branch**, chọn: `feat/menu-management`

7. Click **"Deploy"**

#### Cách 2: Qua Vercel CLI

```bash
# Cài đặt Vercel CLI (nếu chưa có)
npm install -g vercel

# Di chuyển vào thư mục frontend
cd frontend

# Login vào Vercel
vercel login

# Deploy
vercel --prod

# Khi được hỏi:
# - Set up and deploy: Yes
# - Which scope: Chọn account của bạn
# - Link to existing project: No
# - Project name: smart-restaurant-frontend
# - Directory: ./ (vì đã ở trong frontend)
# - Override settings: No
```

### 3.3. Cập nhật FRONTEND_URL trên Render

Sau khi deploy frontend thành công, bạn sẽ có URL: `https://smart-restaurant-frontend.vercel.app`

1. Quay lại Render Dashboard
2. Vào Web Service backend
3. Vào **Environment** tab
4. Cập nhật:
   ```
   FRONTEND_URL=https://smart-restaurant-frontend.vercel.app
   QR_BASE_URL=https://smart-restaurant-frontend.vercel.app
   ```
5. Click **"Save Changes"** - Render sẽ tự động redeploy

## Bước 4: Kiểm tra

1. Truy cập frontend URL: `https://smart-restaurant-frontend.vercel.app`
2. Kiểm tra kết nối API có hoạt động không
3. Test các chức năng menu management:
   - Đăng nhập admin
   - Quản lý categories
   - Quản lý menu items
   - Quản lý modifiers

## Bước 5: Cấu hình Auto Deploy (Optional)

### Vercel Auto Deploy

Vercel tự động deploy khi có push mới lên branch `feat/menu-management`. Không cần cấu hình thêm.

### Render Auto Deploy

Render cũng tự động deploy khi có push mới. Kiểm tra trong **Settings** → **Build & Deploy** → **Auto-Deploy** đã bật.

## Troubleshooting

### Lỗi build trên Vercel
- Kiểm tra logs trong Vercel Dashboard
- Đảm bảo `package.json` có đầy đủ dependencies
- Kiểm tra `vite.config.mjs` cấu hình đúng

### Lỗi CORS
- Đảm bảo `FRONTEND_URL` trong backend environment variables đúng
- Kiểm tra CORS config trong backend code

### Database connection error
- Kiểm tra `DATABASE_URL` có đúng format không
- Đảm bảo Prisma migrations đã chạy: `npx prisma migrate deploy`

### API calls failed
- Kiểm tra `VITE_API_URL` trong frontend environment variables
- Mở Developer Console (F12) để xem lỗi network

## Monitoring

- **Vercel**: Xem logs và analytics tại [Vercel Dashboard](https://vercel.com/dashboard)
- **Render**: Xem logs tại [Render Dashboard](https://dashboard.render.com/) → Chọn service → **Logs** tab

---

**Lưu ý**: Free tier của Render sẽ sleep sau 15 phút không hoạt động. Request đầu tiên có thể mất 30-60s để wake up.
