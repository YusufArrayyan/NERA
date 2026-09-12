# 🚀 Deploy Backend NOW - Quick Start Guide

**Time**: 30-45 menit  
**Platform**: Render.com (Free tier)  
**Result**: Full-stack working aplikasi

---

## ⚡ Step 1: Deploy Database (10 menit)

### 1.1 Buka Render.com

🔗 **Go to**: https://render.com

**Sign up/Login** dengan:
- GitHub account (recommended) ATAU
- Email

### 1.2 Create PostgreSQL Database

1. Click **"New +"** button (top right)
2. Select **"PostgreSQL"**
3. Fill in:
   ```
   Name: nera-db
   Database: nera_prod
   User: nera_user
   Region: Oregon (US West) atau Singapore
   Plan: FREE
   ```
4. Click **"Create Database"**
5. **Wait 2-3 minutes** for provisioning

### 1.3 Copy Connection String

Setelah database ready:

1. Scroll ke **"Connections"** section
2. Copy **"Internal Database URL"** (starts with `postgresql://...`)
3. **Save ini**, akan dipakai di Step 2!

**Format**: 
```
postgresql://nera_user:xxxxx@dpg-xxxxx-a/nera_prod
```

---

## ⚡ Step 2: Deploy Backend Service (15 menit)

### 2.1 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"**
3. Click **"Connect account"** → Authorize GitHub
4. Find repository: **"YusufArrayyan/NERA"**
5. Click **"Connect"**

### 2.2 Configure Service

Fill in:

```
Name: nera-backend
Region: Oregon (same as database!)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build && npx prisma migrate deploy
Start Command: npm run start:prod
Instance Type: FREE
```

### 2.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **10 variables**:

```env
NODE_ENV=production
PORT=10000

# Database (paste dari Step 1.3)
DATABASE_URL=postgresql://nera_user:xxxxx@dpg-xxxxx-a/nera_prod

# JWT Secrets (generate new - lihat di bawah)
JWT_SECRET=your-32-char-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-other-32-char-secret-here
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://nera-learning.vercel.app,http://localhost:3000

# Bcrypt
BCRYPT_ROUNDS=12
```

### 2.4 Generate JWT Secrets

**Windows PowerShell**:
```powershell
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output, paste ke JWT_SECRET

# Generate JWT_REFRESH_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output, paste ke JWT_REFRESH_SECRET
```

**Atau manual** (min 32 characters random):
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

### 2.5 Deploy!

1. Click **"Create Web Service"**
2. **Wait 5-10 minutes** for build
3. Watch logs for errors

**Expected logs**:
```
✓ Build successful
✓ Prisma migrations applied
✓ Server listening on port 10000
```

### 2.6 Get Backend URL

After deployment success:

1. Top of page shows URL: `https://nera-backend.onrender.com`
2. **Copy this URL**
3. Test: Open `https://nera-backend.onrender.com/health`
4. Should see: `{"status":"ok"}`

---

## ⚡ Step 3: Update Frontend (5 menit)

### 3.1 Go to Vercel Dashboard

🔗 **Go to**: https://vercel.com/dashboard

### 3.2 Find Your Project

1. Find: **"nera-learning"** (or your project name)
2. Click on it

### 3.3 Update Environment Variables

1. Click **"Settings"** tab
2. Click **"Environment Variables"** (left sidebar)
3. Find: `NEXT_PUBLIC_API_URL`
4. Click **"Edit"**
5. Change value to: `https://your-backend.onrender.com`
   - Replace dengan URL dari Step 2.6
   - **NO trailing slash!**
6. Click **"Save"**

Also update `NEXT_PUBLIC_WS_URL`:
7. Same value: `https://your-backend.onrender.com`
8. Click **"Save"**

### 3.4 Redeploy Frontend

1. Click **"Deployments"** tab
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Click **"Redeploy"** again to confirm
5. **Wait 2-3 minutes**

---

## ⚡ Step 4: Seed Database (5 menit)

### 4.1 Access Render Shell

1. Go back to Render dashboard
2. Click your **backend service** (nera-backend)
3. Click **"Shell"** tab (top menu)
4. Wait for shell to connect

### 4.2 Run Seed Command

In the shell, type:

```bash
npm run db:seed
```

**Expected output**:
```
🌱 Seeding database...
✅ Created demo users
✅ Created achievements
✅ Created missions
🎉 Seeding complete!
```

### 4.3 Verify Database

Still in shell:

```bash
npx prisma studio
```

This will fail (no GUI in shell), but you can verify with:

```bash
node -e "require('./dist/database/prisma.service').default.user.count().then(console.log)"
```

Should output: `6` (6 demo users created)

---

## ✅ Step 5: Test Full Stack! (5 menit)

### 5.1 Open Application

🔗 **Go to**: https://nera-learning.vercel.app

### 5.2 Try Login

1. Click **"Masuk"**
2. Login dengan:
   ```
   Email: siswa@neuroadaptive.com
   Password: Demo1234!
   ```
3. **Should redirect** to `/dashboard/student`
4. **Should see** real data dari database!

### 5.3 Test Features

Try these:
- ✅ View analytics (should show 0 sessions - new account)
- ✅ Check gamification (Level 1, 0 XP, 0 streak)
- ✅ View profile
- ✅ Navigate between pages
- ✅ Logout and login again

---

## 🎉 SUCCESS!

If all works:

✅ **Frontend**: Deployed on Vercel  
✅ **Backend**: Deployed on Render  
✅ **Database**: PostgreSQL on Render  
✅ **Full Stack**: Working end-to-end!

**Your app is now LIVE**: https://nera-learning.vercel.app

---

## 🐛 Troubleshooting

### Issue 1: Build Failed on Render

**Error**: `Cannot find module '@nestjs/core'`

**Fix**:
1. Render dashboard → Your service
2. Environment variables → Check `NODE_ENV=production`
3. Redeploy

### Issue 2: Database Connection Failed

**Error**: `Connection refused` or `ECONNREFUSED`

**Fix**:
1. Check `DATABASE_URL` is **Internal URL** (not External)
2. Should start with: `postgresql://nera_user:...@dpg-xxxxx-a/...`
3. Backend and Database in **same region**

### Issue 3: CORS Error on Frontend

**Error**: `Access to fetch blocked by CORS`

**Fix**:
1. Render → Backend service → Environment
2. Check `CORS_ORIGIN=https://nera-learning.vercel.app`
3. **NO trailing slash**
4. Redeploy backend

### Issue 4: Login Still Fails

**Error**: `Failed to fetch` or Network error

**Checks**:
1. Backend health: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok"}`
2. Vercel env vars: `NEXT_PUBLIC_API_URL` correct?
3. Frontend redeployed after env change?
4. Database seeded? (Step 4)

### Issue 5: Cold Start Delay

**Symptom**: First request after 15min takes 30+ seconds

**Explanation**: Render free tier sleeps after 15min inactivity

**Solutions**:
- Wait 30s for first request (one-time)
- Upgrade to Render Starter ($7/mo) for always-on
- Use UptimeRobot to ping every 5min (keeps awake)

---

## 📊 Costs Summary

| Service | Plan | Cost |
|---------|------|------|
| Frontend (Vercel) | Free | $0 |
| Backend (Render) | Free | $0 |
| Database (Render) | Free | $0 |
| **Total** | | **$0/month** |

**Free tier limits**:
- Database: 1GB, 90 days free
- Backend: 750 hours/month, sleeps after 15min
- Frontend: Unlimited

**Upgrade later**:
- Backend Starter: $7/mo (always-on)
- Database Starter: $7/mo (10GB, permanent)

---

## 🎯 Next Steps After Deployment

1. **Test all features** dengan 3 accounts:
   - Student: `siswa@neuroadaptive.com`
   - Teacher: `guru@neuroadaptive.com`
   - Admin: `admin@neuroadaptive.com`
   - Password semua: `Demo1234!`

2. **Enable Monitoring** (optional):
   - Follow: `MONITORING_SETUP.md`
   - Setup Sentry for error tracking
   - Setup UptimeRobot for uptime monitoring

3. **Invite Beta Users**:
   - Share link: https://nera-learning.vercel.app
   - Collect feedback
   - Fix bugs

4. **Plan Next Features**:
   - Hardware EEG integration
   - Advanced AI models
   - More gamification

---

## 📞 Need Help?

**Render Issues**: 
- Docs: https://render.com/docs
- Support: support@render.com

**Vercel Issues**:
- Docs: https://vercel.com/docs
- Support: support@vercel.com

**Backend Logs**:
- Render → Your service → Logs tab

**Frontend Errors**:
- Vercel → Your project → Functions → Errors

---

## ✅ Checklist

Pre-deployment:
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Vercel account created (already done)

Database (Step 1):
- [ ] PostgreSQL created
- [ ] Connection string copied
- [ ] Status shows "Available"

Backend (Step 2):
- [ ] Web service created
- [ ] Environment variables added (10 vars)
- [ ] Build successful
- [ ] Health endpoint returns OK

Frontend (Step 3):
- [ ] Environment variables updated
- [ ] Redeployed successfully
- [ ] No build errors

Database Seed (Step 4):
- [ ] Seed command run successfully
- [ ] 6 users created

Testing (Step 5):
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can logout
- [ ] All pages accessible

---

**Created**: August 29, 2026  
**Updated**: August 29, 2026  
**Status**: Ready to deploy!

🚀 **Start deploying now! Estimated time: 30-45 minutes**

