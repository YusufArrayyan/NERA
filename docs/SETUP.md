# NERA Setup & Installation Guide

## 📋 Prerequisites

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum (8GB recommended)
- **Disk**: 2GB free space
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher

### Check Your Setup
```bash
node --version  # Should be v20+
npm --version   # Should be v10+
```

## 🏠 Local Development Setup

### 1. Frontend (Next.js Dashboard)

```bash
cd frontend
npm install
npm run dev
```

Access at: **http://localhost:3000**

**Ports:**
- Development: `3000`
- Build: Optimized for production

**Features:**
- Hot reload enabled
- TypeScript checking
- Tailwind CSS compilation
- Next.js Turbopack bundling

### 2. Backend (NestJS API)

```bash
cd backend

# Install dependencies
npm install

# Create/update database
npm run db:migrate

# Seed test data
npm run db:seed

# Start development server
npm run start:prod
# OR for hot-reload development:
npm run start:dev
```

Access at: **http://localhost:3001**
Swagger Docs: **http://localhost:3001/docs**

**Available Commands:**
- `npm run build` - Build for production
- `npm run start:dev` - Development with hot reload
- `npm run start:prod` - Production build
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed test accounts
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### 3. Worker (Tauri Edge Application)

```bash
cd worker

# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build production executable
npm run build
```

**Output Location:**
- Windows: `worker/src-tauri/target/release/nera_worker.exe`
- macOS: `worker/src-tauri/target/release/nera_worker.app`
- Linux: `worker/src-tauri/target/release/nera_worker`

## 🔧 Environment Configuration

### Backend (.env)

```bash
# Copy example to actual config
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL="your_supabase_connection_string"
DIRECT_URL="your_supabase_direct_connection"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### Worker (.env)

```bash
cp worker/.env.example worker/.env
```

Edit `worker/.env`:
```env
API_URL=http://localhost:3001
WS_URL=ws://localhost:3001
USER_ID=demo-user
SESSION_ID=demo-session
```

### Frontend (.env.local)

Already configured in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 📊 Database Setup (Supabase)

### Option A: Use Cloud Supabase (Recommended for Testing)

1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection strings
5. Update `.env` files with your credentials

### Option B: Local PostgreSQL

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb nera

# Update DATABASE_URL in backend/.env
DATABASE_URL="postgresql://localhost/nera"
```

## 🧪 Testing the Application

### 1. Test Login (All Components Running)

Navigate to **http://localhost:3000** and login with:

```
Email: admin@neuroadaptive.com
Password: Demo1234!
```

### 2. Test Backend API

```bash
# Check API health
curl http://localhost:3001/api/v1/health

# Test authentication
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@neuroadaptive.com",
    "password": "Demo1234!"
  }'
```

### 3. Test Worker Locally

```bash
cd worker

# Set environment variables
export API_URL=http://localhost:3001
export USER_ID=test-user
export SESSION_ID=test-session

# Run worker
npm run start
```

## 🚀 Production Deployment

### Frontend (Vercel)

```bash
cd frontend

# Build
npm run build

# Deploy to Vercel
vercel deploy
```

**Environment Variables on Vercel:**
- `NEXT_PUBLIC_API_URL` = Your backend API URL
- `NEXT_PUBLIC_WS_URL` = Your backend WebSocket URL

### Backend (Render/Self-hosted)

```bash
cd backend

# Build
npm run build

# Create production environment file
cp .env.production.example .env.production

# For Render - just connect GitHub repository
# Render auto-deploys on push to main branch
```

**Set these on your hosting provider:**
- `DATABASE_URL` - Production database
- `JWT_SECRET` - Secure random string
- `PORT` - 3000 (Render default)
- `NODE_ENV` - production
- `CORS_ORIGIN` - Your frontend URL

### Worker (Package & Distribute)

```bash
cd worker

# Build standalone executable
npm run build

# Create installer (Windows)
npm run build -- --windows msi

# Create DMG installer (macOS)
npm run build -- --macos dmg
```

Distributable files in `worker/src-tauri/target/release/bundle/`

## 🐛 Troubleshooting

### Frontend Won't Connect to Backend

**Error:** "Failed to fetch"

**Solution:**
1. Check backend is running on http://localhost:3001
2. Verify CORS_ORIGIN in backend `.env` includes frontend URL
3. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

```bash
# Restart backend
cd backend
npm run start:prod
```

### Database Connection Failed

**Error:** "Error querying the database: FATAL"

**Solution:**
1. Verify DATABASE_URL in `.env` is correct
2. Check database server is running
3. Ensure database exists and user has permissions

```bash
# Test connection
psql $DATABASE_URL
```

### EEG Device Not Detected

**Error:** "Failed to connect to EEG headband"

**Solution:**
1. Verify headband is powered on and connected via USB
2. Check device port in `worker/.env`: 
   - Linux/Mac: `/dev/ttyUSB0`
   - Windows: `COM3` (check Device Manager)
3. Ensure no other app is using the port

```bash
# List available ports (Linux/Mac)
ls /dev/tty*

# Check COM ports (Windows PowerShell)
Get-Content "HKLM:\System\CurrentControlSet\Enum\USB"
```

### Port Already in Use

**Error:** "Address already in use"

**Solution:**
```bash
# Find process using port (macOS/Linux)
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run start:prod
```

## 📱 Running Multiple Instances

For testing with multiple students:

```bash
# Terminal 1: Backend
cd backend
npm run start:prod

# Terminal 2: Frontend instance 1
cd frontend
PORT=3000 npm run dev

# Terminal 3: Frontend instance 2
cd frontend
PORT=3001 npm run dev

# Terminal 4: Worker instance 1
cd worker
USER_ID=student-1 npm run dev

# Terminal 5: Worker instance 2
cd worker
USER_ID=student-2 npm run dev
```

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Frontend loads at http://localhost:3000
- [ ] Can login with test account
- [ ] Backend API accessible at http://localhost:3001
- [ ] Swagger docs load at http://localhost:3001/docs
- [ ] Database migrations ran successfully
- [ ] Test data seeded (can see test accounts)
- [ ] Worker starts without errors
- [ ] Can process sample EEG data (if headband connected)

## 🆘 Getting Help

1. Check logs for error messages
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint issues
4. Check [TECH_STACK.md](./TECH_STACK.md) for technology-specific help

## 🎉 Next Steps

Once setup is complete:

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
2. Explore test accounts and features
3. Connect an EEG headband (if available)
4. Start a learning session and monitor brain state
5. Check cloud sync is working (Worker → Backend → Dashboard)

---

**Having issues?** Make sure all three components are running and environment variables are correctly set!
