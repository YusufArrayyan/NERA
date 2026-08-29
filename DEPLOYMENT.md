# Deployment Guide

## GitHub Setup ✅
Your project is already connected to GitHub at: `https://github.com/YusufArrayyan/NERA`

### Current Status
- Remote: `origin https://github.com/YusufArrayyan/NERA.git`
- Branch: `main`

---

## Vercel Setup (Frontend)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Select the **NERA** repository
4. Vercel will auto-detect your Next.js project

### Step 2: Configure Build Settings
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel Dashboard → **Settings** → **Environment Variables**, add:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
NEXT_PUBLIC_WS_URL=wss://your-backend-api-url.com
```

Replace with your actual backend URL (local, staging, or production).

### Step 4: Deploy
- Automatic deploys on every push to `main` branch
- Preview deployments for pull requests
- Manual deployments available in Vercel dashboard

---

## Backend Deployment Options

### Option A: Railway (Recommended for NestJS)
1. Go to [railway.app](https://railway.app)
2. Connect GitHub account
3. Create new project from repo
4. Select backend folder
5. Add environment variables (DB connection, JWT secret, etc.)

### Option B: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set root directory to `backend`
5. Build command: `npm run build`
6. Start command: `npm run start:prod`

### Option C: Heroku (Legacy)
1. Create app on [heroku.com](https://heroku.com)
2. Connect GitHub
3. Enable automatic deploys

---

## Database Setup

### For Production Database:
1. **PostgreSQL**: Use Railway, Render, or Neon (neon.tech)
2. Update `.env` with production connection string
3. Run migrations: `npx prisma migrate deploy`

---

## GitHub Secrets Setup

For automated deployments, add these secrets to your GitHub repo:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add:
   - `VERCEL_TOKEN` - From Vercel account settings
   - `VERCEL_ORG_ID` - From Vercel dashboard
   - `VERCEL_PROJECT_ID` - From Vercel project settings

---

## Quick Commands

```bash
# Local development
npm install
cd frontend && npm run dev

# Build production
cd frontend && npm run build

# Deploy manually to Vercel
vercel deploy --prod
```

---

## Health Check URLs

After deployment:
- Frontend: `https://your-vercel-domain.vercel.app`
- Backend API: `https://your-backend-url.com/api`
- Swagger Docs: `https://your-backend-url.com/api/docs`

---

## Troubleshooting

**Frontend won't build?**
- Check `node_modules` is clean: `npm ci`
- Verify environment variables are set
- Check Next.js config in `frontend/next.config.ts`

**WebSocket issues?**
- Ensure backend URL uses `wss://` (secure WebSocket) in production
- Backend must support WebSocket upgrades

**Database connection failed?**
- Verify database URL in environment variables
- Run migrations on production database
- Check firewall/security groups allow connection

