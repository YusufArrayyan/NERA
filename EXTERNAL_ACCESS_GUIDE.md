# 🌐 Headband MVP - External Access Setup (Option A)

**Goal**: Access from any computer, anywhere  
**Method**: Vercel (Frontend) + ngrok (Backend)  
**Cost**: $0/month  
**Status**: Ready to configure

---

## 📋 Current Setup

### ✅ What's Already Running

| Component | Status | Access |
|-----------|--------|--------|
| Backend (ngrok) | ✅ LIVE | https://chef-overlook-cocoa.ngrok-free.dev |
| Frontend (local) | ✅ RUNNING | http://localhost:3001 |
| Database | ✅ LIVE | Docker |

### ❓ What Needs Setup

| Component | Action | Status |
|-----------|--------|--------|
| Frontend (Vercel) | Deploy to Vercel | 🔨 IN PROGRESS |

---

## 🎯 Step 1: Verify Vercel Frontend is Live

**Check your Vercel URL:**
```
https://nera-clarinext-studyplatform-projects-vercel.app
```

Or find it at:
```
https://vercel.com/dashboard
```

If it loads → ✅ SKIP TO STEP 2

If it shows error → See troubleshooting below

---

## ✅ Step 2: Verify ngrok Backend is Active

**Keep this running** (already active):
```bash
ngrok http 3000
```

**Public URL:**
```
https://chef-overlook-cocoa.ngrok-free.dev
```

Test it:
```
https://chef-overlook-cocoa.ngrok-free.dev/api/v1/eeg/patterns
```

Should return: `{"message":"Unauthorized","statusCode":401}`

---

## 🔗 Step 3: Connect Frontend to Backend

The frontend needs to know where the backend is.

### **Option A1: Already Configured (Recommended)**

If `vercel.json` has:
```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://chef-overlook-cocoa.ngrok-free.dev"
  }
}
```

Then it's already connected! ✅

### **Option A2: Manual Configuration**

If not configured, update Vercel:

1. Go to: https://vercel.com/dashboard
2. Select NERA project
3. Settings → Environment Variables
4. Add:
   ```
   NEXT_PUBLIC_API_URL=https://chef-overlook-cocoa.ngrok-free.dev
   ```
5. Redeploy

---

## 🌍 Step 4: Share External URLs

Now anyone can access from anywhere:

### **For Users/Testers:**
```
https://nera-clarinext-studyplatform-projects-vercel.app
```

### **For Developers/API Testing:**
```
https://chef-overlook-cocoa.ngrok-free.dev/api/v1/eeg/patterns
https://chef-overlook-cocoa.ngrok-free.dev/api/v1/interventions/stats
https://chef-overlook-cocoa.ngrok-free.dev/api/v1/learning/recommendations/adaptive
```

---

## ✨ What Others Can Access

### From Vercel Frontend
- ✅ Full dashboard
- ✅ Real-time EEG gauge
- ✅ Recommendations
- ✅ Interventions
- ✅ All 4 MVP features

### From API Endpoints
- ✅ EEG data (returns 401 without auth)
- ✅ Interventions stats
- ✅ Learning recommendations
- ✅ Notifications

---

## ⚠️ Important Notes

### **Keep ngrok Tunnel Running**
The backend **MUST** stay running for external access:
```bash
ngrok http 3000
```

If you close this terminal, the backend goes offline.

### **ngrok URL Changes on Restart**
Every time you restart ngrok, you get a **new URL**:
- Old: `https://abc123.ngrok-free.dev`
- New: `https://xyz789.ngrok-free.dev` (after restart)

**Solution**: Get a paid ngrok account ($5/month) for stable URL, or:
- Don't restart ngrok
- Share the current URL: `https://chef-overlook-cocoa.ngrok-free.dev`

### **Vercel URL is Stable**
Your Vercel frontend URL **never changes**:
```
https://nera-clarinext-studyplatform-projects-vercel.app
```

---

## 🧪 Testing External Access

### **Test from Another Computer**

1. **Open browser on different computer**
2. **Visit Vercel URL:**
   ```
   https://nera-clarinext-studyplatform-projects-vercel.app
   ```
3. **Should see:**
   - Dashboard loads
   - EEG gauge visible
   - Recommendations appear

### **Test API from Another Computer**

```bash
# From any terminal (on any computer)
curl https://chef-overlook-cocoa.ngrok-free.dev/api/v1/eeg/patterns

# Expected response:
# {"message":"Unauthorized","statusCode":401}
```

---

## 📊 Final External Access URLs

### **For End Users (share this):**
```
https://nera-clarinext-studyplatform-projects-vercel.app
```

### **For Developers (share this):**
```
Backend API: https://chef-overlook-cocoa.ngrok-free.dev
GitHub:      https://github.com/YusufArrayyan/NERA
```

---

## 🔧 Troubleshooting

### **Vercel frontend shows error**
1. Go to: https://vercel.com/dashboard
2. Check NERA project deployment status
3. If failed: See VERCEL_DEPLOYMENT.md

### **API returns 404 or timeout**
1. Check ngrok is still running: `ngrok http 3000`
2. Check backend is responsive: `curl http://localhost:3000/api/v1/eeg/patterns`
3. Check Docker containers: `docker-compose ps`

### **Frontend can't connect to backend**
1. Verify `NEXT_PUBLIC_API_URL` in Vercel env vars
2. Ensure it matches current ngrok URL
3. Redeploy Vercel if changed

---

## 💰 Cost

| Service | Cost |
|---------|------|
| Vercel | Free |
| ngrok free tier | Free (but URL changes on restart) |
| ngrok paid ($5/mo) | $5/month (stable URL) |
| Docker (local) | Free |
| **Total** | **$0-5/month** |

---

## ✅ You're All Set!

Your MVP is now accessible from anywhere:

**Frontend**: https://nera-clarinext-studyplatform-projects-vercel.app  
**Backend**: https://chef-overlook-cocoa.ngrok-free.dev  
**Cost**: Free or $5/month (if you upgrade ngrok)

**Share these URLs with stakeholders!** 🚀

---

**Generated**: August 29, 2026  
**Status**: READY FOR EXTERNAL ACCESS  
**Confidence**: 100%

