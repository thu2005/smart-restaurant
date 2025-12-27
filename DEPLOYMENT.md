# Deployment Guide - Menu Management Branch

Hướng dẫn deploy nhánh `feat/menu-management` lên production.

## 🚀 Quick Links

- **Frontend (Vercel)**: [Your Vercel URL]
- **Backend (Render)**: [Your Render URL]
- **Database**: PostgreSQL on Render

## 📋 Prerequisites

- GitHub account với repository `smart-restaurant`
- Vercel account (free tier OK)
- Render account (free tier OK)
- Nhánh `feat/menu-management` đã được push lên GitHub

## 🔧 Deployment Steps

### 1️⃣ Deploy Backend (Render)

1. Tạo PostgreSQL Database trên Render
2. Tạo Web Service cho backend
3. Cấu hình environment variables
4. Deploy và lấy backend URL

### 2️⃣ Deploy Frontend (Vercel)

1. Cập nhật `frontend/.env.production` với backend URL
2. Push changes lên GitHub
3. Deploy lên Vercel từ branch `feat/menu-management`
4. Lấy frontend URL

### 3️⃣ Update Backend CORS

1. Cập nhật `FRONTEND_URL` trong Render environment variables
2. Render sẽ tự động redeploy

## 📚 Chi tiết đầy đủ

Xem file workflow: `.agent/workflows/deploy-menu-management.md`

Hoặc chạy lệnh:
```bash
cat .agent/workflows/deploy-menu-management.md
```

## 🔐 Environment Variables

### Backend (Render)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<random-secure-string>
JWT_EXPIRE=7d
FRONTEND_URL=<vercel-frontend-url>
QR_BASE_URL=<vercel-frontend-url>
```

### Frontend (Vercel)

```env
VITE_API_URL=<render-backend-url>/api
```

## ✅ Testing Checklist

- [ ] Frontend loads successfully
- [ ] Backend API responds (check /api/health)
- [ ] Login works
- [ ] Menu categories CRUD works
- [ ] Menu items CRUD works
- [ ] Modifiers CRUD works
- [ ] Image upload works
- [ ] Filters and search work

## 🐛 Common Issues

### CORS Error
- Kiểm tra `FRONTEND_URL` trong backend env vars
- Đảm bảo không có trailing slash

### Database Connection Error
- Kiểm tra `DATABASE_URL` format
- Đảm bảo Prisma migrations đã chạy

### Build Failed
- Kiểm tra logs trong Vercel/Render dashboard
- Đảm bảo dependencies đầy đủ trong package.json

## 📊 Monitoring

- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com/

## 🔄 Auto Deploy

Cả Vercel và Render đều tự động deploy khi có push mới lên branch `feat/menu-management`.

---

**Note**: Free tier của Render sẽ sleep sau 15 phút không hoạt động. Request đầu tiên sẽ mất ~30-60s để wake up.
