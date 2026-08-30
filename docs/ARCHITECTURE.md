# NERA Architecture Document

## 🏗️ Edge-Cloud Hybrid Architecture Overview

NERA implements a **three-tier Edge-Cloud Hybrid Architecture** designed specifically for neuro-adaptive learning with EEG technology.

```
┌─────────────────────────────────────────────────────────────────┐
│                    NERA System Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TIER 1: EDGE LAYER (User's Machine)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🎧 EEG Headband (256 Hz sampling)                         │ │
│  │       ↓ USB/Bluetooth                                      │ │
│  │  📱 Tauri Desktop Worker App                              │ │
│  │  ├─ EEG Signal Processing (Real-time)                     │ │
│  │  ├─ Brain Wave Analysis (FFT, Frequency Decomposition)    │ │
│  │  ├─ Focus/Relaxation Scoring                              │ │
│  │  ├─ AI Recommendations (Local)                            │ │
│  │  ├─ Offline Queue & Caching                               │ │
│  │  └─ WebSocket/REST Client                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                         ↓ ↑                                      │
│              REST API + WebSocket Sync                           │
│              (Automatic when online)                             │
│                         ↓ ↑                                      │
│  TIER 2: CLOUD LAYER (Backend API)                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🔧 NestJS REST API (Port 3001)                            │ │
│  │  ├─ Authentication & Authorization                        │ │
│  │  ├─ EEG Data Storage & Indexing                           │ │
│  │  ├─ Advanced Analytics Engine                             │ │
│  │  ├─ AI Recommendation System                              │ │
│  │  ├─ Real-time WebSocket Broadcast                         │ │
│  │  └─ Gamification & Progress Tracking                      │ │
│  │                                                             │ │
│  │  💾 Database (Supabase PostgreSQL)                         │ │
│  │  ├─ Users, Sessions, EEG Logs                             │ │
│  │  ├─ Learning Content, Gamification                        │ │
│  │  ├─ Analytics & Reports                                   │ │
│  │  └─ Real-time Subscriptions (pgSubscriptions)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                         ↓ ↑                                      │
│              REST API + WebSocket Updates                        │
│                         ↓ ↑                                      │
│  TIER 3: PRESENTATION LAYER (Web Dashboard)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🌐 Next.js Web Dashboard (Vercel)                         │ │
│  │  ├─ Real-time Session Monitoring                          │ │
│  │  ├─ Historical Analytics & Reports                        │ │
│  │  ├─ Multi-role Dashboard (Student, Teacher, etc)          │ │
│  │  ├─ Gamification UI                                       │ │
│  │  ├─ Cross-device Access                                   │ │
│  │  └─ Mobile-responsive Design                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Why Edge-Cloud Hybrid?

### Traditional Cloud-Only Problems
- ❌ Network latency (500ms+ for real-time EEG feedback)
- ❌ Continuous connectivity required
- ❌ Privacy concerns (raw EEG data to cloud)
- ❌ Higher bandwidth usage
- ❌ Dependency on cloud availability

### Traditional Desktop-Only Problems
- ❌ No cross-device data access
- ❌ Manual synchronization needed
- ❌ Limited cloud analytics
- ❌ Scalability challenges
- ❌ No multi-user coordination

### NERA Hybrid Solution ✅
- ✅ **<50ms latency** for EEG processing (local)
- ✅ **Works offline** - syncs when available
- ✅ **Privacy-first** - only results sent to cloud
- ✅ **Scalable** - edge handles processing, cloud handles storage
- ✅ **Resilient** - works with or without connectivity
- ✅ **Flexible** - access data from web dashboard anywhere
- ✅ **Distributed** - spreads computational load

---

## 🔄 Data Flow Diagram

### Real-time EEG Processing

```
EEG Headband (256 Hz)
    ↓ [Raw Data: 2048 bytes/sec]
    
EDGE WORKER (Tauri App)
    ├─ Buffer: 256 samples (1 second window)
    ├─ FFT Analysis: Extract frequency bands
    ├─ Feature Extraction: Focus, Relaxation, Stress
    └─ Score Calculation: 0-100 scale
    
    ↓ [Processed Result: ~500 bytes]
    
Local Cache (if offline)
    ├─ Queue in SQLite
    ├─ Max capacity: 1 hour of data
    └─ Auto-flush when online
    
    ↓ [WebSocket/REST]
    
CLOUD BACKEND (NestJS)
    ├─ Receive processed result
    ├─ Validate & store in PostgreSQL
    ├─ Run advanced analytics
    ├─ Generate recommendations
    └─ Broadcast to connected clients
    
    ↓ [WebSocket Update]
    
WEB DASHBOARD (Next.js)
    ├─ Display real-time metrics
    ├─ Show recommendations
    ├─ Update charts/graphs
    └─ Sync across devices
```

---

## 📊 Component Architecture

### Edge Layer (Tauri Worker)

```typescript
NERAWorker
├── EEGProcessor
│   ├── receiveRawData(samples)
│   ├── extractBrainWaves()
│   ├── calculateFocusScore()
│   ├── calculateRelaxationScore()
│   ├── determineStressLevel()
│   └── generateRecommendations()
│
├── CloudSync
│   ├── initialize()
│   ├── sendEEGResult()
│   ├── receiveRecommendations()
│   ├── manageOfflineQueue()
│   ├── flushQueue()
│   └── getStatus()
│
└── LocalCache
    ├── Store (SQLite)
    ├── Queue (In-Memory)
    └── Retry Logic
```

### Cloud Layer (NestJS Modules)

```typescript
AppModule
├── AuthModule (JWT, Passport)
│   ├── AuthService
│   ├── AuthController
│   └── Guards (JwtAuth, Roles)
│
├── UsersModule
│   ├── UsersService
│   ├── UsersController
│   └── User Entity
│
├── EEGModule
│   ├── EEGService
│   ├── EEGController
│   ├── EEGProcessing Service
│   └── EEG Entity
│
├── AIModule
│   ├── AIService
│   ├── AIController
│   ├── RecommendationEngine
│   └── AnalyticsEngine
│
├── GamificationModule
│   ├── GamificationService
│   ├── LeaderboardService
│   └── Achievement Tracking
│
└── DatabaseModule
    ├── Prisma Service
    └── PostgreSQL Connection
```

### Presentation Layer (Next.js)

```
App (Next.js)
├── /auth
│   ├── /login (LoginPage)
│   └── /register (RegisterPage)
│
├── /dashboard
│   ├── /student (StudentDashboard)
│   ├── /teacher (TeacherDashboard)
│   ├── /parent (ParentDashboard)
│   ├── /counselor (CounselorDashboard)
│   └── /admin (AdminDashboard)
│
├── /contexts
│   └── AuthContext (Global State)
│
├── /lib
│   └── api.ts (API Client)
│
└── /components
    ├── Common (Layout, Nav, etc)
    ├── Monitoring (Charts, Metrics)
    └── Features (Content, Gamification)
```

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login
   POST /auth/login {email, password}
   ↓
2. Backend Validates
   ├─ Email exists?
   ├─ Password correct? (bcrypt verify)
   └─ Account active?
   ↓
3. Generate JWT Tokens
   ├─ accessToken (15m expiry) - for API calls
   └─ refreshToken (7d expiry) - for token refresh
   ↓
4. Client Storage
   ├─ accessToken → localStorage
   ├─ refreshToken → localStorage (or HttpOnly cookie)
   └─ User data → localStorage
   ↓
5. Subsequent Requests
   Authorization: Bearer {accessToken}
   ↓
6. Token Expiry
   → Use refreshToken to get new accessToken
   OR
   → User redirected to login
```

### Authorization (Role-Based Access Control)

```
User Roles:
├── ADMIN (All permissions)
├── TEACHER (Class management, student monitoring)
├── COUNSELOR (Student counseling, risk assessment)
├── STUDENT (Own data access, learning)
└── PARENT (Child progress monitoring)

Guard Implementation:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER', 'ADMIN')
async getClassAnalytics() { ... }
```

### Data Protection

```
Edge Layer (Local):
├─ EEG data processed locally
├─ Only aggregated results sent
└─ No raw data stored in cloud

Cloud Layer:
├─ HTTPS/TLS encryption
├─ PostgreSQL row-level security
├─ JWT tokens (never exposed)
└─ Sensitive fields encrypted

API:
├─ CORS configured for specific origins
├─ Rate limiting (100 req/min)
├─ Input validation on all endpoints
└─ SQL injection protection (Prisma ORM)
```

---

## 🔄 Synchronization Strategy

### Offline Operation

```
Network Disconnected
    ↓
Worker continues processing
    ├─ Stores results in local SQLite
    ├─ Shows cached recommendations
    ├─ UI indicates "Offline Mode"
    └─ Max queue: ~1 hour of data
    
Network Reconnected
    ↓
Auto-trigger sync
    ├─ Flush queued results (batch)
    ├─ Download cloud recommendations
    ├─ Sync session state
    └─ Update dashboard
```

### Sync Conflict Resolution

```
Conflict: Local and Cloud diverge
    ↓
Resolution Priority:
1. Cloud is source of truth for analytics
2. Edge results take precedence for real-time
3. Last-write-wins for user data
4. Merge strategy for accumulated metrics

Example:
Edge: 100 queued results
Cloud: 50 stored results
→ Sync sends remaining 50 + any new data
```

### Queue Management

```
Offline Queue:
├─ Max items: 3600 (1 hour @ 1 Hz)
├─ Storage: Local SQLite
├─ Strategy: FIFO (First-In-First-Out)
└─ Retry: Exponential backoff on failure

Sync Process:
├─ Batch size: 10 items per request
├─ Interval: 5 seconds
├─ Timeout: 10 seconds per batch
└─ Max retries: 3 attempts
```

---

## 📈 Scalability Architecture

### Horizontal Scaling

```
Single User:
Edge: 1 Worker → Backend: 1 API Server → DB: 1 Instance

Multiple Users:
Edge: N Workers → Backend: N API Instances → DB: 1 (PostgreSQL scales)

Load Distribution:
├─ Workers distributed across user machines (no central resource)
├─ API servers behind load balancer
├─ Database connection pooling (pgBouncer)
└─ WebSocket scaled with PM2 cluster mode
```

### Performance Optimization

```
Edge Layer:
├─ Process locally (zero cloud latency)
├─ Batch uploads (reduce requests)
├─ Gzip compression
└─ Local caching

Cloud Layer:
├─ Database indexing on frequently queried fields
├─ Pagination for list endpoints
├─ Redis caching (future: for leaderboards, etc)
├─ Connection pooling
└─ Query optimization

Frontend Layer:
├─ Code splitting per route
├─ Image optimization
├─ API response caching
├─ Lazy loading components
└─ CDN deployment (Vercel)
```

---

## 🛠️ Deployment Architecture

### Development Environment

```
Developer Machine:
├─ Frontend (Next.js) → localhost:3000
├─ Backend (NestJS) → localhost:3001
└─ Worker (Tauri) → Desktop App

Services:
├─ Supabase Cloud (Free tier)
└─ Git (GitHub)
```

### Production Environment

```
Frontend:
├─ Vercel (Global CDN)
├─ Auto-deploy on git push
└─ Environment variables configured

Backend:
├─ Render (or self-hosted)
├─ Auto-deploy on git push
├─ Environment variables configured
└─ PostgreSQL: Supabase Cloud

Worker:
├─ Packaged as standalone executable
├─ Windows/macOS/Linux builds
├─ Distributed via website/app store
└─ Auto-updates support (future)
```

### Infrastructure Topology

```
User's Machine:
┌─────────────────────────┐
│  NERA Worker (Tauri)    │
│  ├─ EEG Headband USB    │
│  └─ Socket.io Client    │
└────────────┬────────────┘
             │
         HTTPS/WSS
             │
    ┌────────┴────────┐
    │                 │
  Vercel (Frontend)  Render (Backend)
    │                 │
    │              PostgreSQL
    │              (Supabase)
    │                 │
    └────────┬────────┘
             │
         Cache Layer
         (Future: Redis)
```

---

## 🔌 Integration Points

### EEG Headband Integration

```
Headband → USB/Bluetooth → Worker
    ├─ Driver: Native serial communication
    ├─ Data rate: 256 samples/sec
    ├─ Channels: 8 (typically)
    └─ Format: Binary stream or JSON

Worker Processing:
├─ Buffer: 256 samples (1 second window)
├─ Process: FFT, feature extraction
├─ Output: Focus, Relaxation, Stress scores
└─ Queue: For cloud sync
```

### Third-party Integrations (Future)

```
Possible Integrations:
├─ Learning Platform APIs (Coursera, Udemy)
├─ Wearable APIs (Fitbit, Apple Watch)
├─ Calendar APIs (Google, Microsoft)
├─ Communication (Slack, Email)
└─ Analytics (Mixpanel, Amplitude)

Architecture Ready For:
├─ Plugin system
├─ Webhook support
├─ API client SDK
└─ GraphQL layer (future)
```

---

## 🧪 Testing Architecture

### Unit Testing

```
Unit Tests (Jest):
├─ EEGProcessor tests
│   ├─ Brain wave extraction
│   ├─ Score calculation
│   └─ Recommendation generation
│
├─ CloudSync tests
│   ├─ API communication
│   ├─ Queue management
│   └─ Offline handling
│
└─ API tests (Supertest)
    ├─ Auth endpoints
    ├─ EEG endpoints
    └─ Gamification endpoints
```

### Integration Testing

```
E2E Tests:
├─ Login flow
├─ EEG data upload
├─ Real-time sync
├─ Multi-device sync
└─ Offline → Online transition
```

### Performance Testing

```
Load Testing:
├─ 100 simultaneous workers
├─ 1000 EEG uploads/sec
├─ WebSocket broadcast to 10k users
└─ Large dataset analytics queries
```

---

## 📋 System Constraints & Limits

### Performance Targets

```
Response Times:
├─ EEG Processing: <50ms
├─ API Response: <200ms
├─ WebSocket latency: <100ms
└─ Dashboard update: <500ms

Throughput:
├─ EEG samples: 256/sec per user
├─ API requests: 100/min per user
├─ Concurrent users: 1000+
└─ Database queries: 10,000+/sec
```

### Storage Limits

```
Per User:
├─ EEG data: ~100MB/month
├─ Session logs: ~10MB/month
├─ User profile: <1MB
└─ Total: ~200MB/month

Cloud Storage:
├─ Supabase free: 500MB (enough for ~2 users)
├─ Upgrade: 1GB = 5 users
└─ Retention: 12 months (configurable)
```

### Offline Capacity

```
Local Storage:
├─ Offline queue: 1 hour max (~3600 results)
├─ Cache: 100MB local storage
├─ Database: SQLite on disk
└─ Recovery: Auto-resync on reconnect
```

---

## 🚀 Future Architecture Enhancements

### Phase 2: Advanced Features
```
├─ Real-time multi-player sessions
├─ Distributed ML model updates
├─ Video streaming of sessions
├─ Voice-based recommendations
└─ Mobile app (React Native)
```

### Phase 3: Enterprise Features
```
├─ Single sign-on (SAML)
├─ Advanced audit logging
├─ Custom branding/white-label
├─ API marketplace
└─ Analytics platform
```

### Phase 4: Advanced Scaling
```
├─ Microservices architecture
├─ Kubernetes orchestration
├─ Redis caching layer
├─ GraphQL API
├─ Event streaming (Kafka)
└─ Machine learning pipeline (TensorFlow)
```

---

## 📊 Architecture Decision Records (ADRs)

### ADR-001: Edge-Cloud Hybrid

**Decision**: Process EEG locally, sync results to cloud

**Rationale**:
- Real-time feedback required (latency <50ms)
- Privacy-first approach
- Works offline
- Reduces cloud resource usage

**Consequences**:
- Increased client complexity
- Need for offline sync handling
- More sophisticated architecture
- Better user experience

---

### ADR-002: Tauri over Electron

**Decision**: Use Tauri for desktop worker app

**Rationale**:
- 10x smaller bundle size
- Native performance
- Modern architecture
- Cross-platform support

**Consequences**:
- Smaller ecosystem
- Some platform-specific quirks
- Less third-party packages
- Better performance

---

### ADR-003: PostgreSQL over NoSQL

**Decision**: Use relational PostgreSQL database

**Rationale**:
- Structured data with clear relationships
- ACID guarantees
- Complex queries (analytics)
- Row-level security support

**Consequences**:
- Schema migrations needed
- Less flexible for unstructured data
- Better consistency guarantees
- Excellent analytical capabilities

---

## 🔍 Monitoring & Observability

```
Metrics to Track:
├─ EEG Processing latency
├─ Cloud sync success rate
├─ API response times
├─ Worker uptime
├─ Queue depth
├─ User engagement
└─ Error rates

Logging:
├─ Structured JSON logs
├─ Centralized log aggregation (future)
├─ Error tracking (Sentry)
└─ Performance monitoring

Alerts:
├─ High error rate (>1%)
├─ API response time >500ms
├─ Worker disconnection
├─ Database connection issues
└─ Sync failures
```

---

## ✅ Architecture Validation Checklist

- [x] Handles offline operation
- [x] Sub-100ms EEG processing latency
- [x] Works across multiple devices
- [x] Scales to 1000+ users
- [x] Privacy-first design
- [x] Graceful degradation
- [x] Cross-platform (Windows/Mac/Linux)
- [x] Security hardened
- [x] Maintainable codebase
- [x] Well documented

---

**NERA: Enterprise-Grade Edge-Cloud Hybrid Architecture for Neuro-Adaptive Learning** 🧠☁️
