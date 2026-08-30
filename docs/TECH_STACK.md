# NERA Technology Stack

## 📚 Complete Technology Overview

This document details all technologies used in NERA and explains why each was chosen.

---

## 🎨 Frontend (Web Dashboard)

### Core Framework: **Next.js 16**
- **Purpose**: Server-side rendering, static generation, API routes
- **Why Chosen**: 
  - Built-in optimization (automatic code splitting)
  - Excellent TypeScript support
  - Vercel-native deployment (free tier available)
  - App Router for modern file-based routing
- **Version**: 16.2.10
- **License**: MIT

**Key Features Used:**
- Server Components for data fetching
- Client Components for interactivity
- Dynamic imports for code splitting
- Image optimization
- API routes for backend communication

### Styling: **Tailwind CSS**
- **Purpose**: Utility-first CSS framework
- **Why Chosen**:
  - Rapid development with pre-built components
  - Responsive design out of the box
  - Small bundle size (~50KB gzipped)
  - No CSS naming conflicts
- **Version**: Latest
- **Configuration**: `tailwind.config.ts`

**Custom Utilities:**
- Organic/rounded card styling
- Custom color palette (primary green, secondary brown, accent terracotta)
- Gradient backgrounds
- Shadow system for depth

### UI Components: **Lucide React Icons**
- **Purpose**: Modern, lightweight SVG icons
- **Why Chosen**:
  - 1000+ icons available
  - Consistent design language
  - Tree-shakeable (only used icons included)
  - Perfect for brain/health/wellness themes
- **Icons Used**: Brain, Activity, TrendingUp, BarChart3, Users, Settings, etc.

### Language: **TypeScript**
- **Purpose**: Static type checking
- **Version**: 5.7.3
- **Benefits**:
  - Catch errors at compile time
  - Better IDE autocomplete
  - Self-documenting code
  - Refactoring safety

### Key Dependencies:
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "next": "^16.2.10",
  "typescript": "^5.7.3",
  "tailwindcss": "^3.4.0",
  "lucide-react": "^0.344.0"
}
```

---

## 🔧 Backend (REST API & WebSocket)

### Core Framework: **NestJS**
- **Purpose**: Scalable, enterprise-grade Node.js framework
- **Why Chosen**:
  - Modular architecture (features separated in modules)
  - Built-in dependency injection
  - Excellent TypeScript support
  - Perfect for large applications
  - Integrated microservices support
- **Version**: 11.0.1
- **Architecture Pattern**: Modular MVC

**Core Components:**

### Database: **Supabase (PostgreSQL)**
- **Purpose**: Managed PostgreSQL database
- **Why Chosen**:
  - Free tier includes 500MB storage
  - Built-in authentication
  - Real-time subscriptions
  - Auto-scaling
  - No credit card needed for free tier
- **Connection**: pgBouncer connection pooling
- **ORM**: Prisma (see below)

### ORM: **Prisma**
- **Purpose**: Type-safe database access
- **Why Chosen**:
  - Auto-generates TypeScript types
  - Migrations management
  - Query builder with type safety
  - Seed data support
- **Version**: 5.20.0
- **Features Used**:
  - Schema definitions
  - Migrations
  - Seeding
  - Query builder

**Schema Includes:**
- Users (Student, Teacher, Parent, Counselor, Admin)
- Sessions (learning sessions with EEG data)
- EEGLogs (raw and processed EEG data)
- Gamification (points, achievements, leaderboards)
- Learning content
- Interventions
- Analytics data

### Authentication: **JWT + Passport.js**
- **JWT Library**: `@nestjs/jwt`
- **Passport Strategy**: `passport-jwt`
- **Why Chosen**:
  - Stateless authentication
  - Scalable across multiple servers
  - Token-based for mobile/SPA support
  - Industry standard
- **Flow**: Login → JWT issued → Stored in localStorage → Sent in Authorization header

### Real-time Communication: **Socket.io**
- **Purpose**: WebSocket communication
- **Why Chosen**:
  - Fallback to HTTP polling if WebSocket unavailable
  - Built-in rooms/namespaces
  - Automatic reconnection
  - Perfect for real-time EEG data streaming
- **Version**: 4.8.3
- **Usage**:
  - Stream EEG results from worker to dashboard
  - Send recommendations from cloud to worker
  - Real-time notifications

### Security: **Helmet**
- **Purpose**: HTTP security headers
- **Why Chosen**:
  - Protects against common attacks
  - Simple middleware
  - Industry standard
- **Headers Set**: CSP, X-Frame-Options, X-Content-Type-Options, etc.

### API Documentation: **Swagger/OpenAPI**
- **Purpose**: Auto-generated API documentation
- **Why Chosen**:
  - Auto-documents endpoints from code
  - Interactive testing UI
  - Type-safe request/response examples
- **Access**: `http://localhost:3001/docs`
- **Benefits**: No manual doc maintenance needed

### Validation: **class-validator**
- **Purpose**: DTO validation
- **Why Chosen**:
  - Decorator-based validation
  - Works with TypeScript classes
  - Automatic error messages
- **Usage**: All request DTOs validated automatically

### Key Dependencies:
```json
{
  "@nestjs/core": "^11.0.1",
  "@nestjs/common": "^11.0.1",
  "@nestjs/jwt": "^11.0.2",
  "@nestjs/passport": "^11.0.5",
  "@nestjs/websockets": "^11.1.27",
  "@nestjs/platform-socket.io": "^11.1.27",
  "@nestjs/swagger": "^11.4.5",
  "@prisma/client": "^5.20.0",
  "prisma": "^5.20.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "bcryptjs": "^3.0.3",
  "class-validator": "^0.15.1",
  "class-transformer": "^0.5.1"
}
```

---

## 💻 Edge Worker (Local Processing)

### Framework: **Tauri**
- **Purpose**: Lightweight desktop app framework
- **Why Chosen**:
  - Much smaller than Electron (15MB vs 150MB)
  - Native performance (Rust backend)
  - True desktop integration
  - Works offline
  - Cross-platform (Windows, macOS, Linux)
- **Architecture**: Rust backend + Web frontend (HTML/CSS/JS/TS)
- **License**: MIT or Apache 2.0

**Key Advantages:**
```
Size Comparison:
- Tauri app: ~15-20MB
- Electron app: ~150MB
- Traditional exe: ~5-10MB

Performance:
- Startup time: <500ms
- Memory usage: ~50MB
- CPU usage: Minimal when idle
```

### Local Processing: **Custom TypeScript Modules**

#### EEGProcessor Module
- **Purpose**: Real-time EEG analysis
- **Functionality**:
  - Brain wave extraction (FFT-like analysis)
  - Focus score calculation
  - Relaxation score calculation
  - Stress level detection
  - Brain wave frequency separation (Delta, Theta, Alpha, Beta, Gamma)

**Brain Wave Bands:**
```
Delta (0-4 Hz):     Deep sleep, relaxation
Theta (4-8 Hz):     Meditation, drowsiness
Alpha (8-12 Hz):    Relaxation, light meditation
Beta (12-30 Hz):    Active thinking, focus
Gamma (30-100 Hz):  Complex problem solving
```

#### CloudSync Module
- **Purpose**: Cloud communication and data sync
- **Functionality**:
  - REST API communication
  - WebSocket real-time updates
  - Offline queue management
  - Automatic retry logic
  - Status tracking

**Features:**
- Sends processed results to backend
- Receives recommendations from cloud
- Queues data when offline
- Auto-syncs when connection restored
- 5-second sync intervals

### HTTP Client: **Axios**
- **Purpose**: HTTP requests to backend
- **Why Chosen**:
  - Promise-based
  - Request/response interceptors
  - Timeout support
  - Automatic JSON serialization
- **Version**: 1.7.7

### Real-time Client: **Socket.io-client**
- **Purpose**: WebSocket communication with backend
- **Why Chosen**:
  - Mirror of Socket.io on server
  - Built-in reconnection
  - Namespace support
  - Room management
- **Version**: 4.8.1

### Language: **TypeScript**
- **Version**: 5.7.3
- **Configuration**: `tsconfig.json` with strict mode enabled
- **Benefits**: Same as frontend - type safety, IDE support

### Key Dependencies:
```json
{
  "@tauri-apps/api": "^2.0.0",
  "@tauri-apps/cli": "^2.0.0",
  "axios": "^1.7.7",
  "socket.io-client": "^4.8.1",
  "dotenv": "^16.4.5",
  "typescript": "^5.7.3"
}
```

---

## 🌐 Infrastructure & Hosting

### Frontend Hosting: **Vercel**
- **Cost**: Free tier available
- **Features**:
  - Automatic deployments from GitHub
  - Global CDN
  - Serverless functions
  - Environment variables management
  - Analytics included
- **Deployment**: `git push → Vercel builds → Auto-deploy`

### Database Hosting: **Supabase**
- **Cost**: Free tier (500MB storage)
- **Features**:
  - PostgreSQL managed
  - Connection pooling included
  - Real-time subscriptions
  - Row-level security
  - Automatic backups
- **Connection**: pgBouncer for connection pooling

### Backend Hosting: **Render** (or self-hosted)
- **Cost**: Free tier available (with limitations)
- **Features**:
  - Auto-deploys from GitHub
  - HTTPS included
  - Environment variable management
  - Automatic restarts

**Alternative**: Self-hosted Node.js server on AWS/DigitalOcean/Heroku

### Version Control: **Git + GitHub**
- **Purpose**: Source code management
- **Branching Strategy**: `main` for production
- **Deployment Trigger**: Push to main → Auto-deploy on Vercel/Render

---

## 🔄 Data Flow Technologies

### Between Components:

**Worker ↔ Backend:**
```
REST API (HTTP):
- POST /api/v1/eeg/results        (send processed data)
- GET  /api/v1/ai/recommendations (get recommendations)

WebSocket (Real-time):
- emit('eeg-result', data)
- on('recommendation', callback)
```

**Backend ↔ Frontend:**
```
REST API (HTTP):
- GET/POST /api/v1/auth/*         (authentication)
- GET/POST /api/v1/eeg/sessions   (session management)
- GET      /api/v1/analytics/*    (reports)

WebSocket (Real-time):
- Real-time session updates
- Live notifications
- Live analytics
```

---

## 📊 Development Tools

### Package Managers:
- **npm**: v10+ (default Node.js package manager)
- **Node.js**: v20+ (JavaScript runtime)

### Build Tools:
- **Turbopack**: Next.js bundler (faster than Webpack)
- **Nest CLI**: NestJS build tool
- **Tauri CLI**: Desktop app bundler

### Code Quality:
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

### Testing:
- **Jest**: Unit testing
- **Supertest**: HTTP testing

### Environment Management:
- **dotenv**: Load environment variables from `.env` files

---

## 🔐 Security Technologies

### Authentication:
- **JWT (JSON Web Tokens)**: Stateless authentication
- **bcryptjs**: Password hashing (salted & rounds: 10)
- **Passport.js**: Authentication middleware

### API Security:
- **CORS**: Cross-Origin Resource Sharing (configured for specific origins)
- **Helmet**: HTTP security headers
- **Rate Limiting**: Throttler middleware (100 requests per minute)

### Data Protection:
- **HTTPS/WSS**: Encrypted communication
- **Environment Variables**: Sensitive data not in code
- **Row-Level Security**: PostgreSQL RLS policies (in Supabase)

---

## 📈 Performance Optimizations

### Frontend:
- **Code Splitting**: Next.js automatic per-route
- **Image Optimization**: Next.js automatic optimization
- **Compression**: gzip enabled on CDN
- **Caching**: Browser caching + CDN edge caching

### Backend:
- **Connection Pooling**: pgBouncer for database
- **Request Compression**: gzip middleware
- **Caching**: Redis-ready architecture (future)
- **Query Optimization**: Prisma ORM optimization

### Worker:
- **Local Processing**: Zero network latency for EEG processing
- **Async Queue**: Non-blocking sync operations
- **Offline Queue**: Processes data offline, syncs when available

---

## 📚 Development Dependencies

### Common to All:
```json
{
  "typescript": "^5.7.3",
  "@types/node": "^24.0.0",
  "prettier": "^3.4.2",
  "eslint": "^9.18.0"
}
```

### Frontend Specific:
```json
{
  "eslint-config-next": "^16.2.10",
  "postcss": "^8.4.49",
  "autoprefixer": "^10.4.20"
}
```

### Backend Specific:
```json
{
  "@nestjs/schematics": "^11.0.0",
  "@nestjs/testing": "^11.0.1",
  "@types/jest": "^30.0.0",
  "jest": "^30.0.0",
  "ts-jest": "^29.2.5"
}
```

### Worker Specific:
```json
{
  "@types/socket.io-client": "^3.0.0"
}
```

---

## 🎯 Architecture Pattern Summary

### Design Patterns Used:

**Factory Pattern** (EEGProcessor, CloudSync initialization)
**Observer Pattern** (Socket.io events)
**Strategy Pattern** (Different authentication strategies)
**Module Pattern** (NestJS modules for separation of concerns)
**Singleton Pattern** (Database connections via Prisma)

### Architectural Styles:

**Frontend**: Component-based architecture
**Backend**: Modular monolithic (can scale to microservices)
**Worker**: Event-driven, asynchronous processing

---

## 🚀 Why This Stack?

### Advantages:
1. **TypeScript Everywhere**: Consistent typing across full stack
2. **Free Tier Friendly**: All platforms have generous free tiers
3. **Scalable**: Each component can scale independently
4. **Real-time Ready**: Socket.io built-in for live updates
5. **Developer Experience**: Modern tooling, good documentation
6. **Performance**: Optimized for both cloud and edge processing
7. **Security**: Built-in security features throughout
8. **Maintainability**: Clear separation of concerns

### Trade-offs Accepted:
- Tauri over Electron: Smaller but fewer third-party packages
- Supabase over Firebase: More control but need SQL knowledge
- Next.js over Vue/Angular: Framework locked-in but better DX

---

## 📞 Technology Support

- **Next.js**: https://nextjs.org/docs
- **NestJS**: https://docs.nestjs.com
- **Tauri**: https://tauri.app/docs
- **Supabase**: https://supabase.com/docs
- **Prisma**: https://www.prisma.io/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

**NERA Tech Stack: Modern, Scalable, Edge-Cloud Hybrid Architecture** 🚀
