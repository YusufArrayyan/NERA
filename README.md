# NERA - Neuro-Adaptive Cloud Learning Platform

![NERA Logo](frontend/public/nera-logo.png)

## 🧠 Overview

**NERA** is an innovative **Edge-Cloud Hybrid Architecture** platform for neuro-adaptive learning using EEG technology. It combines real-time local EEG processing with cloud-based data synchronization and analytics to provide personalized, brain-aware learning experiences.

### Key Innovation: Edge-Cloud Hybrid Architecture

Unlike traditional cloud-only or desktop-only solutions, NERA leverages a **hybrid approach**:

```
┌─────────────────────────────────────────────────────────────┐
│  NERA Edge-Cloud Hybrid Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🎧 EEG Headband                                             │
│       ↓                                                       │
│  💻 LOCAL EDGE (Tauri Worker)          ☁️ CLOUD (Web/API)   │
│  ├─ Real-time EEG Processing          ├─ Data Storage      │
│  ├─ AI Analysis (Local)                ├─ User Management   │
│  ├─ Offline Capability                 ├─ Analytics         │
│  └─ Privacy (no raw data to cloud)     └─ Cross-device Sync │
│       ↓                                       ↑              │
│  WebSocket/REST Sync ←──────────────────────→                │
│                                                               │
│  🌐 Web Dashboard (Vercel)                                   │
│  └─ Monitoring, Insights, Multi-device Access              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### For Users
1. Download and install NERA Worker (Tauri desktop app)
2. Create account on https://nera-learning.vercel.app
3. Connect your EEG headband
4. Start learning sessions - processing happens locally, data syncs to cloud

### For Developers
```bash
# Frontend (Next.js on Vercel)
cd frontend
npm install
npm run dev

# Backend (NestJS)
cd backend
npm install
npm run start:prod

# Worker (Tauri)
cd worker
npm install
npm run dev
```

## 📋 Project Structure

```
Headband-CloudLearning-App/
├── frontend/                 # Web Dashboard (Next.js)
│   ├── src/app/             # Pages & components
│   ├── src/contexts/        # Auth, state management
│   └── public/              # Static assets
│
├── backend/                 # Cloud API (NestJS)
│   ├── src/modules/         # Feature modules
│   ├── prisma/              # Database schema
│   └── src/main.ts          # Entry point
│
├── worker/                  # Local Edge Worker (Tauri)
│   ├── src/modules/         # EEG processing, cloud sync
│   ├── src/index.ts         # Main worker application
│   └── tauri.conf.json      # Tauri configuration
│
└── docs/                    # Documentation
    ├── ARCHITECTURE.md      # System design
    ├── TECH_STACK.md        # Technologies used
    ├── API_DOCUMENTATION.md # API endpoints
    └── SETUP.md             # Installation guide
```

## 🏗️ Architecture Overview

### Three-Tier System

**1. Edge Layer (Local Machine)**
- Tauri desktop application
- Real-time EEG processing (256 Hz sampling)
- Brain wave analysis (Delta, Theta, Alpha, Beta, Gamma)
- AI-based focus/relaxation scoring
- Local recommendations engine
- Works offline - syncs when network available

**2. Cloud Layer (Backend API)**
- NestJS RESTful API
- Supabase PostgreSQL database
- User authentication & management
- Historical data storage
- Advanced analytics & reporting
- Real-time WebSocket updates

**3. Web Layer (Frontend)**
- Next.js responsive dashboard
- Multi-role support (Student, Teacher, Parent, Counselor, Admin)
- Learning content management
- Real-time monitoring
- Gamification & progress tracking
- Works across devices

## 🔑 Key Features

### 🧠 Brain State Analysis
- **Real-time EEG Processing**: Local processing at 256 Hz with no network dependency
- **Focus Score**: Measures concentration levels (0-100%)
- **Relaxation Index**: Tracks mental calm (0-100%)
- **Stress Detection**: Identifies high-stress states
- **Brain Wave Frequency Analysis**: Delta, Theta, Alpha, Beta, Gamma breakdown

### 📊 Adaptive Learning
- AI adjusts content difficulty based on brain state
- Real-time recommendations
- Personalized learning paths
- Session-based analytics

### 👥 Multi-Role System
- **Students**: Monitor their own progress
- **Teachers**: Track class performance
- **Parents**: Monitor children's learning
- **Counselors**: Identify at-risk students
- **Admins**: System management

### ⚡ Hybrid Benefits
- **No Latency**: Local processing = instant feedback
- **Privacy**: EEG data processed locally before cloud sync
- **Offline Support**: Works without internet connection
- **Cloud Sync**: Automatic data synchronization when online
- **Cross-Device**: Access data from any web browser

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with server components
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Modern icon library

### Backend
- **NestJS** - Scalable Node.js framework
- **PostgreSQL** (Supabase) - Relational database
- **Prisma** - ORM for database
- **JWT** - Authentication
- **Socket.io** - Real-time WebSocket communication

### Edge Worker
- **Tauri** - Lightweight desktop app framework
- **TypeScript** - Type-safe processing logic
- **Axios** - HTTP client for cloud sync
- **Socket.io-client** - Real-time communication

### Hosting
- **Vercel** - Frontend deployment (free tier)
- **Supabase** - Database hosting (free tier)
- **Render** - Backend API (free tier, or self-hosted)
- **Local Machine** - Edge worker runs locally

## 📈 Data Flow

```
EEG Headband
     ↓
Worker App (Tauri)
├─ Process EEG Data
├─ Calculate Brain States
├─ Generate Recommendations
└─ Queue for Sync
     ↓ (REST/WebSocket)
Cloud Backend
├─ Store Results
├─ Run Analytics
├─ Create Insights
└─ Push Updates
     ↓ (WebSocket)
Web Dashboard
└─ Display Results & Insights
```

## 🔒 Privacy & Security

- **Edge Processing**: Raw EEG data never leaves user's machine
- **Only Results Synced**: Aggregated, non-identifiable metrics sent to cloud
- **Encrypted Communication**: HTTPS & WSS for all cloud sync
- **JWT Authentication**: Secure token-based API access
- **Role-Based Access Control**: Fine-grained permission system

## 📚 Documentation

- **[SETUP.md](docs/SETUP.md)** - Installation and running instructions
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Detailed system architecture
- **[TECH_STACK.md](docs/TECH_STACK.md)** - All technologies explained
- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - API endpoints reference

## 🧪 Test Accounts

Pre-loaded demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@neuroadaptive.com | Demo1234! |
| Teacher | guru@neuroadaptive.com | Demo1234! |
| Student | siswa@neuroadaptive.com | Demo1234! |
| Parent | orangtua@neuroadaptive.com | Demo1234! |
| Counselor | konselor@neuroadaptive.com | Demo1234! |

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Render/Self-hosted)
```bash
cd backend
npm run build
# Deploy dist/ folder to Render or your server
```

### Worker (Local/Packaged)
```bash
cd worker
npm run build
# Creates standalone executable for Windows/Mac/Linux
```

## 📊 Performance Metrics

- **EEG Processing Latency**: < 50ms local, < 500ms with cloud sync
- **Brain Wave Analysis**: Real-time at 256 Hz sampling rate
- **Cloud Sync Rate**: 5-second intervals (configurable)
- **Offline Queue**: Up to 1 hour of queued data
- **API Response Time**: < 200ms average

## 🤝 Contributing

Contributions welcome! This is an academic/thesis project demonstrating Edge-Cloud Hybrid Architecture for neuro-adaptive learning.

## 📄 License

[Your License Here]

## 👨‍💻 Author

Created as a demonstration of Edge-Cloud Hybrid Architecture for neuro-adaptive learning platforms.

## 📞 Support

For issues or questions:
1. Check [SETUP.md](docs/SETUP.md) for installation help
2. See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for API issues
3. Review [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design questions

---

**NERA: Where Brain Meets Cloud** 🧠☁️
