# 🚀 Production Deployment Guide - NERA Application

**Date**: August 29, 2026  
**Target**: Production-ready deployment in 60 minutes  
**Platforms**: Render.com (Recommended), Railway, AWS

---

## 📊 Deployment Overview

### Infrastructure Components

```
Frontend (Vercel) ✅ DEPLOYED
    ↓
Backend (Render/Railway) ⏳ TO DEPLOY
    ↓
Database (Supabase/Render PostgreSQL) ⏳ TO DEPLOY
```

---

## 🎯 Option 1: Render.com (Recommended - Free Tier)

**Why Render?**
- ✅ Free tier available (750 hours/month)
- ✅ Automatic HTTPS
- ✅ PostgreSQL included
- ✅ Zero-downtime deploys
- ✅ Built-in monitoring

### Step 1: Deploy PostgreSQL Database

1. **Go to Render Dashboard**
   - Visit: https://render.com
   - Sign up/login with GitHub

2. **Create New PostgreSQL**
   - Click "New" → "PostgreSQL"
   - Name: `nera-production-db`
   - Database: `nera_prod`
   - User: `nera_user`
   - Region: **Oregon (us-west)** or closest to users
   - Plan: **Free** (limited to 1GB, 90 days)
   - Click "Create Database"

3. **Wait for Provisioning** (2-3 minutes)
   - Status will change to "Available"

4. **Copy Connection Details**
   ```
   Internal Database URL: postgres://nera_user:****@dpg-xxxxx/nera_prod
   External Database URL: postgres://nera_user:****@oregon-postgres.render.com/nera_prod
   ```
   - Use **Internal URL** for backend on Render
   - Use **External URL** for local testing

5. **Test Connection Locally**
   ```bash
   # Update backend/.env
   DATABASE_URL="postgresql://nera_user:****@oregon-postgres.render.com/nera_prod"
   
   # Run migrations
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

### Step 2: Deploy Backend Service

1. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository: `YusufArrayyan/NERA`
   - Name: `nera-backend-prod`
   - Region: **Oregon** (same as database)
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: **Node**
   - Build Command: `npm install && npm run build && npm run db:migrate`
   - Start Command: `npm run start:prod`
   - Plan: **Free** (512MB RAM, sleeps after 15min inactivity)

2. **Configure Environment Variables**
   
   Click "Environment" tab, add:
   
   ```env
   NODE_ENV=production
   PORT=10000
   
   # Database (use Internal URL from Step 1)
   DATABASE_URL=postgres://nera_user:****@dpg-xxxxx/nera_prod
   
   # JWT Secrets (generate new for production!)
   JWT_SECRET=your-production-secret-min-32-chars-long
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars-long
   JWT_REFRESH_EXPIRES_IN=7d
   
   # CORS (your Vercel frontend URL)
   CORS_ORIGIN=https://nera-learning.vercel.app,http://localhost:3000
   
   # Optional: OpenAI for advanced AI features
   OPENAI_API_KEY=sk-proj-...
   ```

3. **Generate Secure JWT Secrets**
   ```bash
   # On your machine
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Copy output as JWT_SECRET
   
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Copy output as JWT_REFRESH_SECRET
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build
   - Check logs for errors

5. **Verify Deployment**
   - Your backend URL: `https://nera-backend-prod.onrender.com`
   - Test health: `https://nera-backend-prod.onrender.com/health`
   - Expected: `{"status":"ok"}`

### Step 3: Update Frontend Environment

1. **Update Vercel Environment Variables**
   - Go to Vercel dashboard
   - Project: `nera-learning`
   - Settings → Environment Variables
   
   Update:
   ```env
   NEXT_PUBLIC_API_URL=https://nera-backend-prod.onrender.com
   NEXT_PUBLIC_WS_URL=https://nera-backend-prod.onrender.com
   ```

2. **Redeploy Frontend**
   - Vercel will auto-redeploy on env change
   - Or: Deployments → "Redeploy"

3. **Test Full Stack**
   - Visit: `https://nera-learning.vercel.app`
   - Try login: `siswa@neuroadaptive.com` / `Demo1234!`
   - Should work end-to-end!

### Render.com Costs

| Resource | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Web Service | 750 hrs/mo (sleeps after 15min) | $7/mo (always on) |
| PostgreSQL | 90 days, 1GB | $7/mo (10GB) |
| Bandwidth | 100GB/mo | Unlimited |

**Total Free**: $0 for 90 days  
**Total Paid**: $14/mo after free trial

---

## 🚂 Option 2: Railway (Alternative - $5/mo)

**Why Railway?**
- ✅ Simple setup
- ✅ Good free tier ($5 credit/month)
- ✅ PostgreSQL included
- ✅ Easy environment management

### Quick Deploy

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   cd backend
   railway init
   # Project name: nera-backend
   ```

3. **Add PostgreSQL**
   ```bash
   railway add postgresql
   # Automatically creates DATABASE_URL
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=$(openssl rand -hex 32)
   railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
   railway variables set CORS_ORIGIN=https://nera-learning.vercel.app
   ```

5. **Deploy**
   ```bash
   railway up
   # Uploads code and deploys
   ```

6. **Get Backend URL**
   ```bash
   railway domain
   # Example: nera-backend-production.up.railway.app
   ```

7. **Run Migrations**
   ```bash
   railway run npm run db:migrate
   railway run npm run db:seed
   ```

**Railway Costs**: $5/mo credit (enough for small app)

---

## ☁️ Option 3: AWS (Enterprise - Most Control)

**Why AWS?**
- ✅ Maximum scalability
- ✅ Most reliable
- ✅ Full control
- ❌ More complex
- ❌ Higher cost (~$20-50/mo)

### Architecture

```
Route53 (DNS) → CloudFront (CDN) → ALB → ECS/EC2
                                         ↓
                                    RDS PostgreSQL
```

### Quick Setup with Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   eb init
   ```

2. **Create Application**
   ```bash
   cd backend
   eb init nera-backend --region us-west-2 --platform node.js
   ```

3. **Create Environment**
   ```bash
   eb create nera-production --database \
     --database.engine postgres \
     --database.size 10 \
     --instance t3.micro
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv NODE_ENV=production \
     JWT_SECRET=your-secret \
     CORS_ORIGIN=https://nera-learning.vercel.app
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

**AWS Costs**: ~$20-50/mo (t3.micro + RDS)

---

## 🔒 Security Checklist

### Before Production

- [ ] Change all default passwords
- [ ] Generate new JWT secrets (min 32 chars)
- [ ] Enable HTTPS only (no HTTP)
- [ ] Set secure CORS origins (no wildcards)
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection (sanitize inputs)
- [ ] CSRF tokens for forms
- [ ] Environment variables secured (not in code)

### Database Security

- [ ] Strong passwords (min 16 chars, random)
- [ ] Restrict access to backend IP only
- [ ] Enable SSL connections
- [ ] Regular backups configured
- [ ] No public access to database
- [ ] Audit logs enabled

### API Security

- [ ] JWT expiration short (15min)
- [ ] Refresh tokens rotated
- [ ] Input validation on all endpoints
- [ ] Rate limiting per IP/user
- [ ] Request size limits
- [ ] API versioning (/api/v1)

---

## 📊 Post-Deployment Verification

### Health Checks

```bash
# Backend health
curl https://your-backend-url.com/health
# Expected: {"status":"ok","timestamp":"..."}

# Database connectivity
curl https://your-backend-url.com/health/db
# Expected: {"database":"connected"}

# WebSocket
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  https://your-backend-url.com/socket.io/
# Expected: 101 Switching Protocols
```

### Functional Tests

```bash
# Login test
curl -X POST https://your-backend-url.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"siswa@neuroadaptive.com","password":"Demo1234!"}'
# Expected: {"accessToken":"...","user":{...}}

# Protected endpoint test
TOKEN="your-token-from-login"
curl https://your-backend-url.com/analytics/user?period=WEEKLY \
  -H "Authorization: Bearer $TOKEN"
# Expected: Analytics data or 404
```

### Frontend Integration

1. Visit: `https://nera-learning.vercel.app`
2. Open DevTools Network tab
3. Login with: `siswa@neuroadaptive.com` / `Demo1234!`
4. Verify:
   - ✅ POST /auth/login → 200 OK
   - ✅ GET /analytics/user → 200 OK
   - ✅ WebSocket connection established
   - ✅ No CORS errors
   - ✅ No 5xx server errors

---

## 🔧 Troubleshooting

### Issue: Backend returns 502 Bad Gateway

**Cause**: Backend not started or crashed

**Fix**:
```bash
# Check Render logs
# Dashboard → Your Service → Logs

# Look for:
- "listening on port 10000" ✅ Good
- "ECONNREFUSED" ❌ Database connection failed
- "MODULE_NOT_FOUND" ❌ Build failed
```

### Issue: CORS errors on frontend

**Cause**: CORS_ORIGIN not set correctly

**Fix**:
```bash
# In Render environment variables
CORS_ORIGIN=https://nera-learning.vercel.app,http://localhost:3000

# Note: No trailing slashes!
```

### Issue: Database connection timeout

**Cause**: Using external URL from backend (should use internal)

**Fix**:
```bash
# On Render, use Internal Database URL
DATABASE_URL=postgres://...@dpg-xxxxx/nera_prod

# Not the external URL (oregon-postgres.render.com)
```

### Issue: WebSocket not connecting

**Cause**: Frontend WS URL incorrect or server not supporting WebSocket

**Fix**:
```env
# Frontend .env
NEXT_PUBLIC_WS_URL=https://nera-backend-prod.onrender.com

# Backend must have Socket.IO configured for production
# Check main.ts has: app.enableCors({ origin: [...], credentials: true })
```

### Issue: 500 errors on all endpoints

**Cause**: Database migrations not run

**Fix**:
```bash
# SSH into Render or run locally with prod DATABASE_URL
cd backend
DATABASE_URL="prod-url" npm run db:migrate
DATABASE_URL="prod-url" npm run db:seed
```

---

## 🎛️ Monitoring & Maintenance

### Render Dashboard Monitoring

Check daily:
- **CPU Usage**: < 80% average
- **Memory**: < 400MB (512MB limit)
- **Response Time**: < 200ms p95
- **Error Rate**: < 1%
- **Uptime**: > 99%

### Database Monitoring

Check weekly:
- **Database Size**: Monitor growth (Free tier: 1GB limit)
- **Connection Count**: < 10 concurrent
- **Slow Queries**: Log queries > 500ms
- **Backup Status**: Daily backups enabled

### Logs to Monitor

```bash
# Render Logs (view in dashboard)
# Look for:

[ERROR] - Any errors should be investigated immediately
[WARN] - Review and fix if recurring
Database connection pool exhausted - Scale up or optimize queries
Memory usage: 512MB (100%) - Need to upgrade plan
```

---

## 📈 Scaling Strategy

### Phase 1: MVP (Free Tier)
- **Users**: 0-100
- **Infrastructure**: Render Free
- **Database**: 1GB PostgreSQL
- **Cost**: $0

### Phase 2: Early Growth ($14/mo)
- **Users**: 100-1000
- **Infrastructure**: Render Starter
- **Database**: 10GB PostgreSQL
- **Cost**: $14/mo

### Phase 3: Scale Up ($50/mo)
- **Users**: 1000-10,000
- **Infrastructure**: Render Pro + replicas
- **Database**: 25GB with read replicas
- **Cost**: ~$50/mo

### Phase 4: Enterprise (Custom)
- **Users**: 10,000+
- **Infrastructure**: AWS multi-region
- **Database**: RDS with auto-scaling
- **Cost**: $200+/mo

---

## 🚨 Incident Response

### Backend Down

1. Check Render status page: https://status.render.com
2. Check service logs for errors
3. Restart service if needed (Dashboard → Restart)
4. If persists, rollback: Deploy → Previous Deploy → Redeploy

### Database Connection Issues

1. Check database status in Render
2. Verify DATABASE_URL is correct
3. Check connection pool exhaustion
4. Restart database if needed (may cause downtime)

### High Latency

1. Check backend response times
2. Identify slow queries (enable Prisma query logging)
3. Add database indexes if needed
4. Consider caching layer (Redis)

---

## ✅ Production Deployment Checklist

### Pre-Deploy
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Secrets generated (JWT, database password)
- [ ] CORS origins configured correctly
- [ ] Database migrations ready
- [ ] Seed data prepared

### Deploy
- [ ] Database deployed and accessible
- [ ] Migrations run successfully
- [ ] Seed data loaded
- [ ] Backend deployed and healthy
- [ ] Frontend environment updated
- [ ] Frontend redeployed

### Post-Deploy
- [ ] Health check passes
- [ ] Login works end-to-end
- [ ] WebSocket connects
- [ ] Analytics load
- [ ] No console errors
- [ ] Performance acceptable (<2s page load)
- [ ] Mobile responsive
- [ ] SSL certificate valid

### Monitoring
- [ ] Sentry error tracking configured
- [ ] Uptime monitoring enabled
- [ ] Slack/email alerts set up
- [ ] Backup strategy verified
- [ ] Rollback plan documented

---

## 🎯 Success Metrics

### Technical
- **Uptime**: > 99.5%
- **Response Time**: < 200ms p95
- **Error Rate**: < 0.1%
- **Page Load**: < 2s first load, < 500ms subsequent

### Business
- **User Registrations**: Track daily
- **Active Sessions**: Monitor peak hours
- **Feature Usage**: Analytics, Journal, Courses
- **Retention**: Day 1, Day 7, Day 30

---

## 📞 Quick Reference

### Render.com URLs
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs

### Common Commands
```bash
# View backend logs
# Dashboard → Service → Logs

# Restart service
# Dashboard → Service → Manual Deploy → Deploy

# Scale up
# Dashboard → Service → Settings → Plan
```

### Support
- Render Support: support@render.com
- NERA Issues: GitHub Issues
- Emergency: Check INFRASTRUCTURE_TEAM_BRIEFING.md

---

**Deployment Time**: 30-60 minutes (Render)  
**Difficulty**: Beginner-friendly  
**Recommended**: Render.com for MVP

**Next Steps**: See PRODUCTION_CHECKLIST.md for final verification

