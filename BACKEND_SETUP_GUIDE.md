# 🚀 Backend Setup & Testing Guide

**Purpose**: Complete guide to run and test NERA backend API  
**Date**: August 29, 2026

---

## 📋 Prerequisites

### Required Software:
- ✅ Node.js v20+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- ✅ npm or yarn package manager

### Optional (for full features):
- Redis (for caching) - Can run without it
- Docker (for containerized setup)

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

**Expected**: Install ~50 packages (NestJS, Prisma, Socket.IO, etc.)

---

### Step 2: Setup PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE nera_db;
\q
```

#### Option B: Docker PostgreSQL

```bash
docker run --name nera-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nera_db \
  -p 5432:5432 \
  -d postgres:14
```

---

### Step 3: Configure Environment Variables

File `.env` already configured with:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nera_db?schema=public"
PORT=3001
JWT_SECRET="neuro-adaptive-jwt-secret-key-2026"
CORS_ORIGIN="http://localhost:3000,https://nera-learning.vercel.app"
```

✅ **Port 3001** - Matches frontend API client  
✅ **CORS** - Both local and Vercel allowed

---

### Step 4: Setup Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (create tables)
npm run db:migrate

# Seed initial data (demo users, courses, etc.)
npm run db:seed
```

**What gets created:**
- ✅ User table (with demo accounts)
- ✅ EEGSession & EEGReading tables
- ✅ Course & Module tables
- ✅ JournalEntry table
- ✅ Badge & UserBadge tables
- ✅ Analytics tables

**Demo Users Created:**
```
siswa@nera.demo   / Demo1234!  (Student)
guru@nera.demo    / Demo1234!  (Teacher)
admin@nera.demo   / Demo1234!  (Admin)
```

---

### Step 5: Start Backend Server

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod
```

**Expected Output:**
```
[Nest] 12345  - LOG [NestApplication] Nest application successfully started
[Nest] 12345  - LOG [RoutesResolver] EEGController {/eeg}:
[Nest] 12345  - LOG   POST /eeg/start
[Nest] 12345  - LOG   GET  /eeg/status
[Nest] 12345  - LOG [RoutesResolver] AnalyticsController {/analytics}:
[Nest] 12345  - LOG   GET /analytics/user
[Nest] 12345  - LOG Server listening on http://localhost:3001
[Nest] 12345  - LOG Socket.IO server started on port 3001
```

✅ **Backend is running!**

---

## 🧪 Testing API Endpoints

### Method 1: Using curl

#### Test Health Check
```bash
curl http://localhost:3001/health
```
**Expected**: `{"status":"ok","timestamp":"..."}`

#### Test Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"siswa@nera.demo","password":"Demo1234!"}'
```
**Expected**:
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": 1,
    "email": "siswa@nera.demo",
    "name": "Alya Juwita Putri",
    "role": "STUDENT"
  }
}
```

#### Test EEG Status (requires auth)
```bash
TOKEN="<paste_token_here>"

curl http://localhost:3001/eeg/status \
  -H "Authorization: Bearer $TOKEN"
```

---

### Method 2: Using Postman/Thunder Client

1. Import this collection:

```json
{
  "name": "NERA API",
  "requests": [
    {
      "name": "Login",
      "method": "POST",
      "url": "http://localhost:3001/auth/login",
      "body": {
        "email": "siswa@nera.demo",
        "password": "Demo1234!"
      }
    },
    {
      "name": "Get User Analytics",
      "method": "GET",
      "url": "http://localhost:3001/analytics/user?period=WEEKLY",
      "headers": {
        "Authorization": "Bearer {{token}}"
      }
    },
    {
      "name": "Start EEG Session",
      "method": "POST",
      "url": "http://localhost:3001/eeg/start",
      "headers": {
        "Authorization": "Bearer {{token}}"
      },
      "body": {
        "pattern": "MODERATE_FOCUS"
      }
    }
  ]
}
```

---

### Method 3: Swagger UI Documentation

Open in browser:
```
http://localhost:3001/api/docs
```

✅ Interactive API documentation  
✅ Try endpoints directly  
✅ See request/response schemas

---

## 📊 Endpoint Testing Checklist

### Auth Endpoints
- [ ] `POST /auth/login` - Login with demo account
- [ ] `POST /auth/register` - Create new user
- [ ] `POST /auth/logout` - Logout user
- [ ] `GET /auth/me` - Get current user info

### EEG Endpoints
- [ ] `GET /eeg/status` - Check device status
- [ ] `POST /eeg/start` - Start EEG session
- [ ] `POST /eeg/stop/:id` - Stop session
- [ ] `GET /eeg/session/:id` - Get session data
- [ ] `GET /eeg/sessions` - List user sessions

### Analytics Endpoints
- [ ] `GET /analytics/user?period=WEEKLY` - User analytics
- [ ] `GET /analytics/class` - Class analytics (teacher)
- [ ] `GET /analytics/summary` - Summary stats

### Gamification Endpoints
- [ ] `GET /gamification/badges` - Get user badges
- [ ] `GET /gamification/level` - Get user level & XP
- [ ] `GET /gamification/streak` - Get streak data
- [ ] `POST /gamification/claim` - Claim badge

### Journal Endpoints
- [ ] `GET /journal/entries` - List entries
- [ ] `POST /journal/entries` - Create entry
- [ ] `GET /journal/entries/:id` - Get single entry
- [ ] `PUT /journal/entries/:id` - Update entry

### Learning Endpoints
- [ ] `GET /learning/courses` - List all courses
- [ ] `GET /learning/courses/:id` - Get course details
- [ ] `POST /learning/enroll/:id` - Enroll in course
- [ ] `GET /learning/progress/:id` - Get progress

---

## 🔄 Testing Real-time Features

### WebSocket Connection

```javascript
// In browser console or Node.js
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
});

socket.on('eeg-data', (data) => {
  console.log('📊 EEG Data:', data);
});

socket.emit('start-eeg-stream', { sessionId: 1 });
```

**Expected**: Real-time EEG data every 100ms

---

## 🗄️ Database Inspection

### Using Prisma Studio

```bash
npm run db:studio
```

Opens web UI at `http://localhost:5555`

✅ View all tables  
✅ Edit records  
✅ See relationships

### Using psql

```bash
psql -U postgres -d nera_db

-- List tables
\dt

-- View users
SELECT id, email, name, role FROM "User";

-- View sessions
SELECT id, "userId", pattern, "startTime" FROM "EEGSession" LIMIT 10;

-- View analytics
SELECT * FROM "Analytics" WHERE "userId" = 1;
```

---

## 🐛 Troubleshooting

### Problem: "Port 3001 already in use"

```bash
# Find process
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Problem: "Cannot connect to database"

```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
sudo service postgresql restart  # Linux
brew services restart postgresql  # Mac
```

### Problem: "Prisma client not generated"

```bash
npm run db:generate
```

### Problem: "Migration failed"

```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Then re-seed
npm run db:seed
```

---

## 📦 Production Deployment

### Option 1: Render.com

1. Create new Web Service
2. Connect GitHub repo (backend folder)
3. Build command: `npm install && npm run build`
4. Start command: `npm run start:prod`
5. Add environment variables:
   ```
   DATABASE_URL=<your_postgres_url>
   JWT_SECRET=<strong_secret>
   CORS_ORIGIN=https://nera-learning.vercel.app
   ```

### Option 2: AWS/DigitalOcean

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/src/main.js --name nera-backend

# Save PM2 config
pm2 save
pm2 startup
```

---

## ✅ Verification Checklist

Before marking Task #2 complete:

### Backend Server
- [ ] `npm install` runs without errors
- [ ] `npm run db:generate` creates Prisma client
- [ ] `npm run db:migrate` creates all tables
- [ ] `npm run db:seed` inserts demo data
- [ ] `npm run start:dev` starts server on port 3001
- [ ] Health check returns OK

### API Endpoints
- [ ] Login endpoint works (returns JWT)
- [ ] Protected endpoints require auth
- [ ] EEG endpoints respond correctly
- [ ] Analytics returns data
- [ ] Gamification returns badges/level
- [ ] Journal CRUD works
- [ ] Courses API works

### Database
- [ ] Can connect to PostgreSQL
- [ ] All tables exist
- [ ] Demo users created
- [ ] Can query data via Prisma Studio

### WebSocket
- [ ] Socket.IO server starts
- [ ] Can connect from frontend
- [ ] Real-time EEG data streams

### Integration
- [ ] Frontend can call backend APIs
- [ ] CORS allows both localhost and Vercel
- [ ] JWT auth works end-to-end

---

## 🎯 Expected Result

After following this guide:

✅ Backend running on `http://localhost:3001`  
✅ Database with demo data  
✅ All API endpoints responding  
✅ WebSocket streaming working  
✅ Frontend can connect successfully  

**Status**: Ready for full integration testing!

---

## 📞 Quick Reference

```bash
# Start everything
npm install              # Once
npm run db:generate      # Once
npm run db:migrate       # Once
npm run db:seed          # Once
npm run start:dev        # Every time

# Useful commands
npm run db:studio        # View database
npm run db:reset         # Reset database
npm run lint             # Check code
npm run test             # Run tests
```

**Backend URL**: `http://localhost:3001`  
**Swagger Docs**: `http://localhost:3001/api/docs`  
**Prisma Studio**: `http://localhost:5555`

---

**Created**: August 29, 2026  
**Last Updated**: August 29, 2026

