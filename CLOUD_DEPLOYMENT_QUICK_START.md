# 🚀 Headband MVP - Free Cloud Deployment Quick Start

**Your GitHub repo**: https://github.com/YusufArrayyan/NERA  
**Goal**: Deploy to Vercel + Supabase + Render (100% free)  
**Duration**: 30 minutes  
**Cost**: $0/month

---

## ⏱️ 3 Quick Steps to Live

### Step 1: Create Supabase Database (5 min)

1. Go to https://supabase.com
2. Sign up with GitHub
3. Click "New Project"
4. Name: `headband` | Password: (save it!)
5. Wait 2 minutes for creation
6. Copy connection string from Settings → Database

**What you'll have**: PostgreSQL database in the cloud

---

### Step 2: Deploy Backend to Render (10 min)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect to `YusufArrayyan/NERA` repo
5. Configuration:
   - Name: `headband-backend`
   - Runtime: `Node`
   - Build: `npm ci && npm run build`
   - Start: `npm run start:prod`
   - Root directory: `backend`

6. Set Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
   JWT_SECRET=your-secret-key-here
   NODE_ENV=production
   REDIS_URL=redis://localhost:6379
   CORS_ORIGIN=https://headband-frontend.vercel.app
   ```

7. Click "Create Web Service"
8. Wait for deployment (~5 min)
9. Get URL: `https://headband-backend.onrender.com`

**What you'll have**: Backend API live in cloud

---

### Step 3: Deploy Frontend to Vercel (5 min)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Select `YusufArrayyan/NERA` repo
5. Framework: `Next.js`
6. Root directory: `frontend`
7. Environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://headband-backend.onrender.com
   ```
8. Click "Deploy"
9. Wait for deployment (~2 min)
10. Get URL: `https://headband-frontend.vercel.app`

**What you'll have**: Frontend live in cloud

---

## 🎯 Optional: Add Redis (for caching)

If you want caching/sessions:

1. Go to https://upstash.com
2. Sign up
3. Create Redis database
4. Copy Redis URL
5. In Render, update `REDIS_URL` environment variable
6. Render auto-redeploys

**Skip this if you just want MVP working**

---

## ✅ Final Checklist

- [ ] Supabase database created
- [ ] Render backend deployed
- [ ] Vercel frontend deployed
- [ ] Environment variables set
- [ ] Backend responds at `https://headband-backend.onrender.com/api/v1/eeg/patterns`
- [ ] Frontend loads at `https://headband-frontend.vercel.app`

---

## 🔗 Your Live Demo URLs (after deployment)

```
Frontend: https://headband-frontend.vercel.app
Backend:  https://headband-backend.onrender.com
Database: Supabase (PostgreSQL) - hidden, but working
```

---

## ⚠️ Important Notes

**Render Free Tier**:
- Backend sleeps after 15 min of inactivity
- First request has ~30 sec cold start
- This is fine for MVP demo

**Supabase Free Tier**:
- 500MB storage (plenty for testing)
- Connection pooling included
- Perfect for MVP

**Vercel Free Tier**:
- Unlimited deployments
- No cold starts
- Perfect for frontend

---

## 🚨 If Something Fails

### Render deployment fails
```
Check: Build logs in Render dashboard
Fix: Ensure DATABASE_URL is correct
Test: ssh into container and check logs
```

### Frontend can't reach backend
```
Check: NEXT_PUBLIC_API_URL in Vercel env vars
Fix: Make sure it matches Render backend URL
Test: Browser DevTools → Network tab
```

### Database connection fails
```
Check: CONNECTION string from Supabase is correct
Fix: Copy full string including password
Test: psql -c "SELECT 1;" (from local machine)
```

---

**Status**: Ready to deploy  
**Time**: ~30 minutes  
**Next**: Follow Step 1 → 2 → 3 in order

