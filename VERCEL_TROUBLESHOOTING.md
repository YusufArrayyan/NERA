# Vercel Deployment Troubleshooting

## Current Status
- ✅ Local build: **PASSING** (npm run build works - 27 routes)
- ❌ Vercel deployment: **FAILING** (after cache clear)

## Root Cause Analysis

### What We Know
1. **Local environment**: Build succeeds completely
2. **Vercel environment**: Build fails (reason TBD)
3. **Code**: No TypeScript errors, no missing imports
4. **Dependencies**: All valid and installed

### Likely Causes (in order of probability)
1. **Vercel Project Configuration Issue**
   - Wrong root directory
   - Incorrect build command
   - Conflicting project settings

2. **Environment Variables**
   - Missing or incorrect env vars in Vercel dashboard
   - .env file not loaded

3. **Memory/Timeout**
   - 512MB default memory insufficient
   - Build timeout even with 120s timeout

4. **Project Structure**
   - Multiple conflicting projects in workspace
   - Backend/frontend not properly separated

## Solutions to Try (In Order)

### Solution 1: Verify Vercel Project Settings
1. Go to https://vercel.com/dashboard
2. Select project "NERA" or "headband-frontend"
3. Go to **Settings → General**
4. Verify:
   - **Root Directory**: `frontend` ✓
   - **Build Command**: `npm run build` ✓
   - **Output Directory**: `.next` ✓
   - **Node.js Version**: `20.x` ✓

### Solution 2: Check Environment Variables
1. Go to **Settings → Environment Variables**
2. Ensure these are set:
   ```
   NEXT_PUBLIC_APP_NAME = NERA
   NEXT_PUBLIC_API_URL = https://api.example.com
   NODE_ENV = production
   ```
3. Re-deploy after adding/updating

### Solution 3: Clear and Rebuild Fresh
1. Go to **Settings → Build & Deployment**
2. Click **"Clear Cache"** (if not done)
3. Go to **Deployments** tab
4. Find any failed deployment
5. Click **"..."** → **"Redeploy"**
6. Wait and monitor logs

### Solution 4: Check Project Scope
If you have multiple projects on Vercel:
1. Ensure only **ONE** project for this frontend
2. Delete any duplicate projects
3. Verify correct project is linked to GitHub repo

### Solution 5: Reduce Build Complexity
If still failing, try:
1. Temporarily reduce number of routes
2. Or: Deploy static export (if no dynamic routes needed)

## Error Messages to Watch For

- **"Build timed out"** → Increase staticPageGenerationTimeout
- **"Out of memory"** → Upgrade Vercel plan or optimize dependencies
- **"Command not found"** → Check build command in Settings
- **"Cannot find module"** → Missing dependency in package.json
- **"API connection failed"** → Expected (backend might not be accessible during build)

## Configuration Files Applied

✅ **next.config.ts**
- staticPageGenerationTimeout: 120s
- productionBrowserSourceMaps: false
- Optimized image settings

✅ **vercel.json**
- Explicit build config
- Functions maxDuration: 120s
- Node 20.x

✅ **.vercelignore**
- Excludes unnecessary files
- Reduces upload size

✅ **.env.production**
- Fallback environment variables
- Production defaults

## Local Verification ✅

```bash
cd frontend
npm run build

# Expected Output:
# - Compiled successfully in ~20s
# - TypeScript check: 25s
# - Page generation: 5s
# - 27 routes generated
# - Exit code: 0
```

## What's Deployed

**Pages (27 total)**:
- `/` - Landing page
- `/courses` - Courses list
- `/dashboard/*` - 8 dashboard variants (admin, teacher, student, etc.)
- `/analytics` - Analytics page
- `/journal` - Journal page
- `/devices` - Devices page
- `/hardware/calibration` - Hardware calibration
- `/auth/*` - Auth pages (login, register)
- `/api/v1/[...path]` - API proxy (dynamic)

**Tech Stack**:
- Next.js 16.2.10
- React 19.2.4
- Tailwind CSS 3.4.1
- TypeScript 5

## Next Steps

1. **Go to Vercel dashboard NOW** and:
   - Verify root directory is `frontend`
   - Check environment variables are set
   - Clear cache and redeploy

2. **If still failing**: Share Vercel build logs (screenshot or text)
   - Logs will show exact error
   - We can then diagnose properly

3. **Alternative**: Deploy using Vercel CLI locally
   ```bash
   npm install -g vercel
   cd frontend
   vercel deploy --prod
   ```

## Important Notes

⚠️ **DO NOT**:
- Delete package-lock.json
- Change Node version without reason
- Remove environment variables

✅ **DO**:
- Clear Vercel cache before redeploy
- Check build logs for specific errors
- Verify root directory setting

---

**Last Updated**: August 29, 2026
**Commit**: 11505e9
**Status**: Awaiting Vercel dashboard fixes
