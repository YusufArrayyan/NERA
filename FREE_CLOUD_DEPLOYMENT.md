# 🚀 Headband MVP - Free Cloud Deployment

**Goal**: Deploy to Vercel + Supabase + Render (100% free tier)  
**Duration**: 45 minutes  
**Cost**: $0/month

---

## ✅ Task #1: Set Up Supabase PostgreSQL

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up (GitHub recommended)
4. Create new organization (name: "headband" or similar)

### Step 2: Create Database
1. In Supabase dashboard, click "New Project"
2. Name: `headband-db`
3. Password: Generate strong password (save it!)
4. Region: Choose closest to you
5. Click "Create new project" (takes 2-3 minutes)

### Step 3: Get Connection String
1. In project, go to Settings → Database
2. Copy "Connection string" (Pool mode)
3. It looks like: `postgresql://postgres:PASSWORD@...`
4. Save this - you'll need it for Render backend

### Step 4: Get DB Details
You'll need:
- Host: `[project].supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Password: (what you set above)

**✅ Supabase database ready!**

---

## ✅ Task #2: Migrate Database Schema

### Step 1: Connect to Supabase (Windows Command)
```powershell
# Install psql if needed:
# Download from https://www.postgresql.org/download/windows/
# Or use: choco install postgresql14

# Connect to Supabase:
psql -h [YOUR_SUPABASE_HOST] -U postgres -d postgres

# When prompted, enter your Supabase password
```

### Step 2: Run Schema Migration
Once connected via psql:

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'STUDENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create other core tables (see init-db.sql for full schema)
-- ... [copy from backend/init-db.sql]
```

**Alternative (Easier)**: Use Supabase SQL Editor
1. In Supabase dashboard, go to SQL Editor
2. Click "New query"
3. Paste contents of `backend/init-db.sql`
4. Click "Run"

**✅ Schema migrated to Supabase!**

---

## ✅ Task #3: Deploy Backend to Render

### Step 1: Push Backend to GitHub
```powershell
cd c:\CODING PROJECT\Headband-CloudLearning-App\backend

# Initialize git repo (if needed)
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/headband-backend.git
git push -u origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up (GitHub recommended)
3. Connect your GitHub account

### Step 3: Deploy to Render
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Select `headband-backend` repo
4. Configuration:
   - Name: `headband-backend`
   - Environment: `Node`
   - Build command: `npm ci && npm run build`
   - Start command: `npm run start:prod`
   - Region: Choose closest

### Step 4: Set Environment Variables
In Render dashboard, go to Environment:

```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres
REDIS_URL=redis://DEFAULT:PASSWORD@HOST:6379
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

**Note**: You'll get REDIS_URL from Upstash in Task #5

### Step 5: Deploy
1. Click "Create Web Service"
2. Render builds and deploys (takes 5-10 min)
3. Once done, get your backend URL: `https://headband-backend.onrender.com`
4. Save this URL!

**✅ Backend deployed to Render!**

---

## ✅ Task #4: Deploy Frontend to Vercel

### Step 1: Push Frontend to GitHub
```powershell
cd c:\CODING PROJECT\Headband-CloudLearning-App\frontend

git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/headband-frontend.git
git push -u origin main
```

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Sign up (GitHub recommended)
3. Connect GitHub

### Step 3: Deploy Frontend
1. Click "Add New..." → "Project"
2. Select `headband-frontend` repo
3. Framework: `Next.js`
4. Build settings (auto-detect)
5. Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://headband-backend.onrender.com
   ```
6. Click "Deploy"

### Step 4: Get Frontend URL
Once deployed, you'll get a URL like:
```
https://headband-frontend.vercel.app
```

**✅ Frontend deployed to Vercel!**

---

## ✅ Task #5: Set Up Upstash Redis

### Step 1: Create Upstash Account
1. Go to https://upstash.com
2. Sign up (GitHub recommended)
3. Create team

### Step 2: Create Redis Database
1. Click "Create database"
2. Name: `headband-redis`
3. Type: `Redis`
4. Region: Choose closest
5. Click "Create"

### Step 3: Get Connection Details
In Upstash dashboard:
- Click your database
- Copy "Redis URL" (format: `redis://default:PASSWORD@HOST:PORT`)
- Save this

### Step 4: Update Render Backend
1. Go to Render dashboard
2. Select `headband-backend` service
3. Go to Environment
4. Add/update: `REDIS_URL=redis://...` (from Upstash)
5. Click "Save"
6. Service auto-redeploys

**✅ Redis configured!**

---

## ✅ Task #6: Test Cloud Deployment

### Test 1: Backend Health Check
```powershell
$backendUrl = "https://headband-backend.onrender.com"
curl.exe "$backendUrl/api/v1/eeg/patterns"

# Expected: 401 Unauthorized (auth required, which is correct)
```

### Test 2: Frontend Loads
1. Open browser: `https://headband-frontend.vercel.app`
2. Should see dashboard
3. Should load without errors

### Test 3: API Integration
```powershell
# Frontend makes API calls to Render backend
# Check browser DevTools → Network tab
# Should see requests to https://headband-backend.onrender.com

# Expected: All requests succeed or return 401 (auth needed)
```

### Test 4: Test All 4 MVP Endpoints
See QUICK_START_TESTING.md for endpoint tests

**✅ All systems live on free cloud!**

---

## 📋 Checklist

- [ ] Supabase database created and schema migrated
- [ ] Render backend deployed and running
- [ ] Vercel frontend deployed and accessible
- [ ] Upstash Redis created and connected
- [ ] Environment variables set in Render
- [ ] Frontend points to Render backend URL
- [ ] Health checks passing
- [ ] All 4 MVP endpoints responding

---

## 🎯 Your Free Cloud URLs

**Frontend**: `https://headband-frontend.vercel.app`  
**Backend API**: `https://headband-backend.onrender.com`  
**Database**: Supabase (hidden, but working)  
**Cache**: Upstash Redis (hidden, but working)  

---

## ⚠️ Important Notes

**Render Free Tier Limitation**:
- Backend goes to sleep after 15 minutes of inactivity
- First request after sleep takes 30-45 seconds (cold start)
- This is normal and free

**Supabase Free Tier Limitation**:
- 500MB storage max
- Perfect for MVP testing
- Fine for demo purposes

**Vercel Free Tier**:
- Unlimited deployments
- No cold starts
- Perfect for frontend

---

**Status**: Ready to deploy  
**Next**: Follow steps 1-6 in order  
**Time**: ~45 minutes total

