# 📊 Monitoring & Logging Setup Guide

**Date**: August 29, 2026  
**Purpose**: Production monitoring, error tracking, and performance analytics

---

## 🎯 Monitoring Stack Overview

```
Application Layer:
├─ Frontend (Vercel) → Vercel Analytics + Sentry
├─ Backend (Render) → Sentry + Winston Logger
└─ Database (PostgreSQL) → Prisma Logging + pg_stat_statements

Monitoring Services:
├─ Sentry.io → Error tracking & performance
├─ Vercel Analytics → Frontend metrics
├─ UptimeRobot → Uptime monitoring
└─ LogTail (optional) → Log aggregation
```

---

## 🔴 Sentry Setup (Recommended - Free Tier)

### Step 1: Create Sentry Account

1. Visit: https://sentry.io
2. Sign up (free tier: 5,000 errors/month)
3. Create new project: `nera-backend`
4. Create another project: `nera-frontend`

### Step 2: Backend Integration

**Install Sentry SDK**:
```bash
cd backend
npm install --save @sentry/node @sentry/profiling-node
```

**Create `backend/src/config/sentry.config.ts`**:
```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: 0.1,
    integrations: [
      new ProfilingIntegration(),
    ],
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive fields
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.['authorization'];
      }
      return event;
    },
  });
}
```

**Update `backend/src/main.ts`**:
```typescript
import { initSentry } from './config/sentry.config';

// Initialize Sentry FIRST (before any other imports)
if (process.env.NODE_ENV === 'production') {
  initSentry();
}

// ... rest of your code
```

**Add to `backend/.env`**:
```env
SENTRY_DSN=https://xxxxx@o1234567.ingest.sentry.io/1234567
```

### Step 3: Frontend Integration

**Install Sentry SDK**:
```bash
cd frontend
npm install --save @sentry/nextjs
```

**Run Sentry Wizard**:
```bash
npx @sentry/wizard@latest -i nextjs
```

**Update `frontend/sentry.client.config.ts`**:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

**Add to `frontend/.env.local`**:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o1234567.ingest.sentry.io/7654321
```

---

## 📈 Vercel Analytics (Frontend Performance)

### Setup (Free for Personal Projects)

1. **Enable in Vercel Dashboard**:
   - Go to your project
   - Settings → Analytics
   - Enable Web Analytics

2. **Install Package**:
```bash
cd frontend
npm install @vercel/analytics
```

3. **Add to `frontend/src/app/layout.tsx`**:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

4. **View Metrics**:
   - Dashboard → Analytics
   - See: Page views, top pages, real-time visitors
   - Core Web Vitals (LCP, FID, CLS)

---

## ⏰ Uptime Monitoring (UptimeRobot - Free)

### Setup

1. **Create Account**: https://uptimerobot.com
2. **Add Monitors**:

**Backend Health Check**:
```
Name: NERA Backend Health
Type: HTTP(s)
URL: https://your-backend.onrender.com/health
Interval: 5 minutes
Alert Contacts: Your email
```

**Frontend Check**:
```
Name: NERA Frontend
Type: HTTP(s)
URL: https://nera-learning.vercel.app
Interval: 5 minutes
```

**WebSocket Check** (Advanced):
```
Name: NERA WebSocket
Type: Port Monitoring
Server: your-backend.onrender.com
Port: 443
```

3. **Configure Alerts**:
   - Email notifications
   - Slack/Discord webhooks (optional)
   - SMS (paid plans)

---

## 📝 Structured Logging (Winston)

### Backend Logging Setup

**Install Winston**:
```bash
cd backend
npm install --save winston winston-daily-rotate-file
```

**Create `backend/src/config/logger.config.ts`**:
```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'nera-backend' },
  transports: [
    // Console (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File (production)
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});
```

**Usage**:
```typescript
import { logger } from './config/logger.config';

// Log levels: error, warn, info, http, debug
logger.info('Server started', { port: 3001 });
logger.error('Database connection failed', { error: err.message });
logger.warn('High memory usage', { usage: '450MB' });
```

---

## 📊 Database Monitoring

### Prisma Query Logging

**Enable in `backend/prisma/schema.prisma`**:
```prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

**Create `backend/src/database/prisma.service.ts`**:
```typescript
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.config';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 500) {
    logger.warn('Slow query detected', {
      query: e.query,
      duration: `${e.duration}ms`,
    });
  }
});

prisma.$on('error', (e) => {
  logger.error('Database error', { message: e.message });
});

export default prisma;
```

### PostgreSQL Monitoring

**Enable pg_stat_statements** (for query analysis):
```sql
-- Connect to your database
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View top slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🚨 Alerting Rules

### Critical Alerts (Immediate Action)

- **Backend Down**: > 2 failed health checks in 10min
- **Database Connection Lost**: Any database connection error
- **High Error Rate**: > 10 errors/min
- **Memory Leak**: Memory usage > 90% for > 5min
- **Authentication Failures**: > 50 failed logins/min (possible attack)

### Warning Alerts (Monitor)

- **Slow Queries**: Query time > 500ms
- **High CPU**: > 80% for > 10min
- **High Response Time**: p95 > 1s
- **Low Database Connections**: < 2 available connections

### Info Alerts (Track Trends)

- **Deployment Complete**: Successful deployment notification
- **Daily Summary**: Daily stats email
- **New User Registration**: Track growth

---

## 📱 Notification Channels

### Slack Integration

**Create Incoming Webhook**:
1. Slack → Apps → Incoming Webhooks
2. Add to your channel
3. Copy webhook URL

**Send Alerts**:
```typescript
async function notifySlack(message: string, level: 'info' | 'warn' | 'error') {
  const emoji = { info: '✅', warn: '⚠️', error: '🔴' };
  
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `${emoji[level]} ${message}`,
      channel: '#nera-alerts',
    }),
  });
}
```

### Email Alerts

Use SendGrid, Resend, or SMTP:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendAlert(subject: string, body: string) {
  await transporter.sendMail({
    from: 'alerts@nera.app',
    to: 'admin@nera.app',
    subject,
    html: body,
  });
}
```

---

## 📊 Custom Metrics Dashboard

### Render Dashboard (Built-in)

- **CPU Usage**: Dashboard → Metrics
- **Memory Usage**: Real-time graph
- **Request Count**: HTTP requests/sec
- **Response Time**: p50, p95, p99

### Custom Metrics with Prometheus (Advanced)

**Install**:
```bash
npm install prom-client
```

**Setup**:
```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  registers: [register],
});

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
```

---

## ✅ Monitoring Checklist

### Initial Setup
- [ ] Sentry configured (backend + frontend)
- [ ] Vercel Analytics enabled
- [ ] UptimeRobot monitors created
- [ ] Slack webhook configured
- [ ] Email alerts set up
- [ ] Winston logger configured
- [ ] Prisma query logging enabled

### Daily Checks
- [ ] Check Sentry for new errors
- [ ] Review Uptime Robot status
- [ ] Monitor response times (Vercel)
- [ ] Check backend logs for warnings
- [ ] Database size and performance

### Weekly Reviews
- [ ] Analyze error trends
- [ ] Review slow queries
- [ ] Check disk space usage
- [ ] Review user growth metrics
- [ ] Security audit (failed logins, etc.)

---

## 💰 Costs Summary

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Sentry | 5K errors/mo | $26/mo (50K errors) |
| Vercel Analytics | ✅ Included | ✅ Included |
| UptimeRobot | 50 monitors | $7/mo (unlimited) |
| LogTail | 1GB/mo | $15/mo (5GB) |

**Total Free**: $0/mo (sufficient for MVP)  
**Total Paid**: ~$50/mo (for scale)

---

## 🎯 Success Metrics to Track

### Technical Health
- **Uptime**: Target > 99.5%
- **Error Rate**: Target < 0.1%
- **Response Time**: Target < 200ms p95
- **Database Query Time**: Target < 50ms avg

### User Engagement
- **Daily Active Users** (DAU)
- **Session Duration**: Target > 10min
- **Feature Usage**: EEG sessions, Journal entries
- **Retention**: Day 1, Day 7, Day 30

### Business Metrics
- **User Growth**: Track daily signups
- **Completion Rate**: Sessions started vs completed
- **Achievement Unlock Rate**: Gamification engagement
- **Course Enrollment**: Learning engagement

---

**Created**: August 29, 2026  
**Status**: Production Ready  
**Maintenance**: Review metrics weekly

