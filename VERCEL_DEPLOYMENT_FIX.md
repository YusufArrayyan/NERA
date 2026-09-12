# 🔧 Vercel Deployment Fix Guide

**Issue**: "This page couldn't load" error on https://nera-learning.vercel.app  
**Date**: August 29, 2026  
**Status**: Quick fix available

---

## 🎯 Problem Diagnosis

Possible causes:
1. ❌ Build error during deployment
2. ❌ Missing environment variables
3. ❌ Next.js configuration issue
4. ❌ API route errors
5. ❌ Route not found (404)

---

## 🚀 Quick Fix Steps

### Step 1: Check Vercel Build Logs

1. Go to: https://vercel.com/dashboard
2. Find your project: `nera-learning`
3. Click on latest deployment
4. Check "Build Logs" for errors

**Common Build Errors**:
```
❌ Type errors in TypeScript
❌ Missing dependencies
❌ Import errors
❌ API route failures
```

### Step 2: Fix Environment Variables

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add Required Variables**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

3. **Redeploy**: Deployments → Latest → "Redeploy"

### Step 3: Fix Root Page Route

The issue might be that `/` route is failing. Let's add a fallback:

**Create `frontend/src/app/error.tsx`**:
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h1>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-[#5B7B5A] text-white rounded-lg hover:bg-[#4A6A49]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

**Create `frontend/src/app/not-found.tsx`**:
```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-[#5B7B5A] text-white rounded-lg hover:bg-[#4A6A49]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
```

### Step 4: Verify Next.js Config

**Check `frontend/next.config.ts`**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Ensure static export is not enabled if using API routes
  output: undefined, // Remove 'export' if present
};

export default nextConfig;
```

### Step 5: Force Redeploy

```bash
# In your local machine
cd frontend

# Make a small change to force redeploy
echo "# Force redeploy" >> README.md

# Commit and push
git add .
git commit -m "fix: Force Vercel redeploy to fix page load error"
git push origin main

# Vercel will auto-redeploy
```

---

## 🔍 Debugging Checklist

### Check Vercel Logs

- [ ] Build completed successfully (green checkmark)
- [ ] No TypeScript errors
- [ ] All dependencies installed
- [ ] No missing imports

### Check Routes

- [ ] Root `/` page exists (`frontend/src/app/page.tsx`)
- [ ] Layout exists (`frontend/src/app/layout.tsx`)
- [ ] No circular imports

### Check Components

- [ ] `LandingPageStitch` component exists
- [ ] All imported components exist
- [ ] No server/client component conflicts

### Check Environment

- [ ] Environment variables set in Vercel
- [ ] API URLs don't cause CORS issues
- [ ] No hardcoded localhost in production code

---

## 🎨 Alternative: Create Simple Landing Page

If issue persists, create a simple working landing page first:

**Replace `frontend/src/app/page.tsx`**:
```typescript
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5B7B5A] to-[#7A9B79]">
      <div className="max-w-4xl w-full mx-auto px-4 text-center text-white">
        <h1 className="text-6xl font-bold mb-6">
          NERA
        </h1>
        <p className="text-2xl mb-8">
          Neuro-Adaptive Cloud Learning
        </p>
        <p className="text-xl mb-12">
          Platform pembelajaran berbasis EEG untuk meningkatkan fokus dan performa belajar
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="px-8 py-3 bg-white text-[#5B7B5A] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Masuk
          </a>
          <a
            href="/auth/register"
            className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#5B7B5A] transition-colors"
          >
            Daftar
          </a>
        </div>
      </div>
    </div>
  );
}
```

This will at least show something while we debug the full landing page.

---

## 📱 Test After Fix

1. **Visit**: https://nera-learning.vercel.app
2. **Expected**: See landing page (not error)
3. **Test**: Click "Masuk" → Should go to login page
4. **Try Login**: Will fail (backend not deployed yet) but page should load

---

## 🚨 If Still Not Working

### Option 1: Check Vercel Function Logs

1. Vercel Dashboard → Project → Logs
2. Look for runtime errors
3. Check if any API routes are failing

### Option 2: Use Vercel CLI for Local Testing

```bash
npm install -g vercel

cd frontend
vercel dev

# This runs Vercel environment locally
# Check if it works locally first
```

### Option 3: Contact Vercel Support

If build succeeds but page still doesn't load:
1. Check Vercel Status: https://vercel.com/status
2. Contact support: support@vercel.com
3. Check firewall/ISP blocking

---

## ✅ Success Criteria

After fix, you should see:
- ✅ Landing page loads (not black error screen)
- ✅ Navigation works
- ✅ Can access `/auth/login` page
- ✅ Images and styles load correctly
- ⚠️ API calls will fail (backend not deployed yet)

---

## 🔄 Current Workaround

Until Vercel issue is fixed, you can:

1. **Run locally**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open: http://localhost:3000

2. **Share localhost** (if needed for demo):
   ```bash
   npm install -g localtunnel
   lt --port 3000
   ```
   Get public URL to share

---

## 📞 Quick Actions

### Immediate (5 min)
1. Check Vercel build logs
2. Add environment variables if missing
3. Force redeploy

### If Build Errors (15 min)
1. Run `npm run build` locally to see errors
2. Fix TypeScript/import errors
3. Commit and push

### If Route Issues (10 min)
1. Add `error.tsx` and `not-found.tsx`
2. Simplify landing page temporarily
3. Test incrementally

---

**Created**: August 29, 2026  
**Priority**: HIGH  
**Status**: Debugging in progress

