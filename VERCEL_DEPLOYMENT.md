# 🚀 Deploy Headband Frontend to Vercel

**Your Backend API (ngrok)**: `https://chef-overlook-cocoa.ngrok-free.dev`

---

## 📋 Quick Steps (5 minutes)

### Step 1: Go to Vercel
1. Open https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"

### Step 2: Select Repository
1. Find and select: `YusufArrayyan/NERA`
2. Click "Import"

### Step 3: Configure Project
1. **Framework**: Next.js (auto-detected)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`

### Step 4: Set Environment Variables
Add this environment variable:
```
NEXT_PUBLIC_API_URL=https://chef-overlook-cocoa.ngrok-free.dev
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://headband-frontend.vercel.app`

---

## ✅ Your Live URLs

**Frontend**: https://headband-frontend.vercel.app (after Vercel deployment)  
**Backend**: https://chef-overlook-cocoa.ngrok-free.dev (already live via ngrok)  
**Database**: Supabase (hidden, working)

---

## 📝 After Deployment

Test the integration:
1. Open frontend URL in browser
2. You should see the dashboard
3. Check browser DevTools → Network tab
4. Requests should go to ngrok backend URL

## ⚠️ Important Notes

**ngrok URL Changes**: 
- Every time you restart ngrok, you get a new URL
- If URL changes, update Vercel environment variable
- Easier to get paid ngrok account ($5/month) for stable URL

**Current Setup**:
- ✅ Backend: Running locally on your machine via ngrok
- ✅ Frontend: Deployed to Vercel (global CDN)
- ✅ Database: Supabase (cloud)
- ✅ Cost: $0/month

