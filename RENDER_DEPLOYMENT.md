# Render.com Deployment Guide

## ✅ What We've Fixed

- **Commit `12f735f`**: Added `render.yaml` configuration
- **Commit `d0c4182`**: Removed invalid `vercel.json` schema
- **Commit `c091738`**: Fixed AuthProvider useRouter crash
- **Commit `53afa4d`**: Minimal build config (no experimental features)

## 🚀 Render Deployment Steps

### Step 1: Connect GitHub Repository (if not done)
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect Repository"**
4. Choose `YusufArrayyan/NERA`
5. Click **"Connect"**

### Step 2: Configure Service
1. **Name**: `headband-frontend` (or keep default)
2. **Environment**: `Node`
3. **Region**: Select closest to your location
4. **Branch**: `main`
5. **Build Command**: (Render will auto-detect from render.yaml)
6. **Start Command**: (Render will auto-detect from render.yaml)

### Step 3: Environment Variables
Render might ask for env vars. Add these:
```
NODE_ENV = production
NEXT_PUBLIC_APP_NAME = NERA
NEXT_PUBLIC_API_URL = https://api.nera.local
NEXT_PUBLIC_WS_URL = wss://api.nera.local
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Render will start building automatically
3. Watch the build logs
4. Should take 2-5 minutes

### Step 5: Verify
- Check that service shows **"Live"** status (green)
- Click the service URL to test the app
- Should see NERA landing page

---

## 🔧 What render.yaml Does

```yaml
services:
  - type: web
    name: headband-frontend
    runtime: node
    runtimeVersion: 20        # Node 20.x (LTS)
    buildCommand: npm ci && npm run build
    startCommand: npm start   # Runs: next start
    envVars: [...]           # Production environment
    autoDeploy: true         # Auto-deploy on push
```

**This replaces vercel.json** - Render reads this file to build and deploy.

---

## ✨ How Deployment Works

1. **Push to GitHub** (`main` branch)
2. **Render detects change** (webhook)
3. **Clones repository** with `render.yaml`
4. **Reads render.yaml** for config
5. **Runs `npm ci && npm run build`**
   - Installs dependencies (clean)
   - Compiles Next.js app
   - Generates 27 static pages
6. **Runs `npm start`**
   - Starts Next.js production server
   - Listens on port 3000 (Render assigns public URL)
7. **Service goes Live** 🎉

---

## 📊 Expected Build Times

| Step | Duration |
|------|----------|
| Clone & setup | 30s |
| npm ci (install) | 60-90s |
| npm run build | 50-60s |
| Start service | 10s |
| **Total** | **~3 minutes** |

---

## ✅ Verification Checklist

After deployment:
- [ ] Service shows "Live" (green)
- [ ] Public URL accessible
- [ ] Landing page loads
- [ ] Navigation works
- [ ] No console errors
- [ ] Images load properly
- [ ] Responsive on mobile

---

## 🐛 If Build Fails

**Check these in Render dashboard:**

1. **View Logs** - Click service → **Logs** tab
   - Look for errors in build output
   - Share error message

2. **Common Issues**:
   - `npm ci` fails → Missing dependencies
   - Build timeout → Increase timeout setting
   - Out of memory → Upgrade Render plan
   - Missing env vars → Add to Render settings

3. **Troubleshooting**:
   - Clear Render cache → **Settings** → **Clear Cache**
   - Redeploy → Click **Manual Deploy**
   - Check GitHub push worked → `git log -1`

---

## 🔄 Auto-Deployment

`render.yaml` has `autoDeploy: true`, so:

**Every push to `main` triggers automatic deployment** ✅

This means:
- Make changes locally
- `git push origin main`
- Render automatically rebuilds and deploys
- No manual intervention needed

---

## 📋 Render vs Vercel vs AWS

| Feature | Render | Vercel | AWS |
|---------|--------|--------|-----|
| Deployment | Simple | Simple | Complex |
| Config | render.yaml | vercel.json | Terraform |
| Pricing | Free tier available | Free tier available | Pay-as-you-go |
| Recommended | ✅ For MVP | Next.js optimized | Enterprise |

**We're using Render because:**
- Free tier is generous
- Simple configuration
- Good for production
- Auto-deploys on push

---

## 🚀 After Successful Deployment

1. **Update DNS** (if you have custom domain)
   - Point domain to Render URL
   - Or use Render's default URL

2. **Set up SSL** (Render provides free SSL)
   - Render auto-generates certificate
   - HTTPS enabled by default

3. **Monitor Performance**
   - Render dashboard → **Metrics**
   - Check CPU, memory, requests
   - Set up alerts (Render Pro)

4. **Continuous Deployment**
   - Every `git push main` redeploys
   - No manual builds needed
   - Perfect for rapid iteration

---

## 📞 Support

**Render.com Resources:**
- Docs: https://render.com/docs
- Status: https://status.render.com
- Support: https://render.com/support

---

**Deployment Config**: `render.yaml`  
**Latest Commit**: `12f735f`  
**Status**: Ready to deploy  

Good to go! 🎉
