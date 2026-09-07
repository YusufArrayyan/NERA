# Quick Start - Test What Was Built

**Goal**: Verify all 4 completed features work locally in 15 minutes

---

## ⚡ TL;DR - 5 Commands to Test Everything

```bash
# 1. Start services
docker-compose down -v && docker-compose up -d

# Wait 30 seconds for services to start

# 2. Test dashboard data endpoint
curl http://localhost:3000/ai/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Test recommendations scoring
curl http://localhost:3000/learning/recommendations/adaptive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Test intervention config
curl -X POST http://localhost:3000/interventions/config/thresholds \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lowFocusThreshold":30,"highStressThreshold":70}'

# 5. Test email (if SMTP configured)
curl -X POST http://localhost:3000/notifications/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 1️⃣ Test Dashboard with Real EEG Data (3 min)

### What it does:
- Fetches real AI recommendations
- Displays learning content
- Updates in real-time

### How to test:

1. **Start local services**:
```bash
cd c:\CODING PROJECT\Headband-CloudLearning-App
docker-compose down -v
docker-compose up -d
```

2. **Open browser**:
```
http://localhost:3001/dashboard/student
```

3. **Start a session**:
- Click "Mulai Sesi Belajar" button
- Wait 5 seconds for EEG data

4. **Verify**:
- ✅ Focus gauge updates (0-100 scale)
- ✅ Recommendations appear below
- ✅ Learning content cards display
- ✅ Recommendations refresh every 30s

### Expected output:
```
Focus Score: 75
Recommendations:
  - Calculus: Derivatives (Score: 87.5)
  - Linear Algebra Basics (Score: 82.3)
  - Physics: Quantum Theory (Score: 78.9)

Learning Content:
  [VISUAL] Calculus: Derivatives Part 1 | Difficulty: 2
  [AUDITORY] Linear Algebra Explained | Difficulty: 2
```

---

## 2️⃣ Test Intervention Triggering (3 min)

### What it does:
- Auto-triggers interventions on low focus
- Tracks high stress
- Sends alerts to students

### How to test:

1. **Connect backend logs**:
```bash
docker-compose logs -f backend
```

2. **Start a session and simulate patterns**:
```bash
# In another terminal, send test EEG data with LOW focus
curl -X POST http://localhost:3000/eeg/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "LOW_FOCUS",
    "duration": 40,
    "focusIndex": 20,
    "stressIndex": 80
  }'
```

3. **Watch backend logs for**:
```
[Interventions] Created AUTO_SUPPORT intervention for user...
[Interventions] Low focus started for user...
[Interventions] Created AUTO_BREAK intervention after 300s...
```

4. **Check database**:
```bash
docker-compose exec postgres psql -U headband -d headband_db

SELECT * FROM interventions ORDER BY "createdAt" DESC LIMIT 5;
```

### Expected output:
```
| type | title | notes | priority | status |
|------|-------|-------|----------|--------|
| AUTO_SUPPORT | Try This to Improve Focus | Materi visual... | LOW | PENDING |
| AUTO_BREAK | Take a Break | Your focus has been low... | MEDIUM | PENDING |
```

---

## 3️⃣ Test Adaptive Recommendations (3 min)

### What it does:
- Scores content on 3 factors (EEG + Learning + Difficulty)
- Returns top recommendations
- Shows reasoning

### How to test:

```bash
# Get adaptive recommendations
curl "http://localhost:3000/learning/recommendations/adaptive?focusCategory=LOW&recommendedMode=VISUAL&focusIndex=25&stressIndex=75&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected output:
```json
[
  {
    "contentId": "uuid-1",
    "title": "Visual Math: Fractions",
    "type": "VISUAL",
    "difficulty": 2,
    "score": 88.5,
    "reason": "Materi visual untuk meningkatkan fokus Anda",
    "eegMatch": 92,
    "learningMatch": 85,
    "difficultyMatch": 78
  },
  {
    "contentId": "uuid-2",
    "title": "Auditory Physics",
    "type": "AUDITORY",
    "difficulty": 2,
    "score": 65.3,
    "reason": "Tingkat kesulitan optimal untuk pembelajaran Anda",
    "eegMatch": 45,
    "learningMatch": 78,
    "difficultyMatch": 82
  }
]
```

### Verify:
- ✅ Scores are between 0-100
- ✅ Top items have high scores
- ✅ VISUAL mode scored higher (matches LOW focus)
- ✅ Reasons explain why

---

## 4️⃣ Test Email Notifications (2 min)

### What it does:
- Sends professional HTML emails
- Multiple templates (focus alerts, summaries, interventions)
- Async (non-blocking)

### How to test:

**Option A: Test email without SMTP (always works)**:
```bash
# This logs output instead of sending (if SMTP not configured)
curl -X POST http://localhost:3000/notifications/test-email \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check logs:
docker-compose logs backend | grep "Email service not configured\|Would send to"
```

**Option B: Configure real SMTP and test**:

1. **Set environment variables**:
```bash
# In .env file or docker-compose.yml
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@headband.app
```

2. **Restart services**:
```bash
docker-compose down
docker-compose up -d
```

3. **Send test email**:
```bash
curl -X POST http://localhost:3000/notifications/test-email \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **Check inbox** for email from "Headband"

### Expected output (if SMTP works):
```bash
Response: {"sent": true, "email": "student@example.com"}
```

### Expected email contains:
- ✅ Professional HTML styling
- ✅ Headband branding
- ✅ Personalized greeting
- ✅ Actionable content
- ✅ Call-to-action button

---

## 5️⃣ Test Intervention Stats & Config (2 min)

### What it does:
- Gets user's intervention statistics
- Allows admin to configure thresholds
- Tracks intervention history

### How to test:

```bash
# Get intervention stats for current user
curl http://localhost:3000/interventions/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected output:
# {"totalInterventions":5,"autoInterventions":3,"resolvedCount":1,"pendingCount":4,"byType":{"AUTO_SUPPORT":2,"AUTO_BREAK":1,...}}

# Configure thresholds (admin only)
curl -X POST http://localhost:3000/interventions/config/thresholds \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lowFocusThreshold": 25,
    "highStressThreshold": 75,
    "prolongedLowFocusSeconds": 240
  }'

# Response:
# {"message":"Intervention thresholds updated","config":{...}}
```

---

## 🔧 Troubleshooting

### Dashboard shows "Loading..." forever
```bash
# Check backend is running
docker-compose ps

# Check logs for errors
docker-compose logs backend

# Restart if needed
docker-compose restart backend
```

### Recommendations endpoint returns empty
```bash
# Check database has content
docker-compose exec postgres psql -U headband -d headband_db
SELECT COUNT(*) FROM "LearningContent";

# Should return > 0. If not, run seed:
docker-compose exec backend npm run db:seed
```

### Email doesn't send (but no error)
```bash
# This is OK - graceful fallback is working
# Check logs for: "Email service not fully configured"

# To enable real email:
1. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env
2. Restart services
3. Try again
```

### Interventions not triggering
```bash
# Check intervention service is imported
docker-compose logs backend | grep -i intervention

# Verify EEG data is being generated
curl http://localhost:3000/eeg/status

# Should show: {"connected": true, "pattern": "..."}
```

---

## 📊 What Each Test Verifies

| Test | Verifies | File | Endpoint |
|------|----------|------|----------|
| Dashboard | Real data binding, real-time updates | `frontend/src/app/dashboard/student/page.tsx` | `/ai/recommendations` |
| Interventions | Auto-triggering on thresholds | `backend/src/modules/interventions/interventions-trigger.service.ts` | `/eeg/sessions/start` |
| Recommendations | Scoring algorithm, ranking | `backend/src/modules/learning/adaptive-recommendation.service.ts` | `/learning/recommendations/adaptive` |
| Emails | Template rendering, async sending | `backend/src/modules/notifications/email.service.ts` | `/notifications/test-email` |
| Stats | Tracking and persistence | `backend/src/modules/interventions/interventions.controller.ts` | `/interventions/stats` |

---

## ✅ Success Criteria

All tests pass if you see:

```
✅ Dashboard updates in real-time with EEG data
✅ Recommendations are scored and ranked
✅ Interventions appear in database within 30 seconds
✅ Email sends (or logs gracefully if SMTP not configured)
✅ Stats API returns intervention counts
```

---

## 🎯 After Testing

### If everything works:
1. Read `PRODUCTION_DEPLOYMENT.md` for AWS setup
2. Run `INFRASTRUCTURE_VALIDATION.md` to verify AWS
3. Follow `GO_LIVE_CHECKLIST.md` for final deployment

### If something fails:
1. Check logs: `docker-compose logs backend`
2. Verify database: `docker-compose exec postgres psql ...`
3. Restart services: `docker-compose restart`
4. Run seed again: `docker-compose exec backend npm run db:seed`

---

**Generated**: August 29, 2026  
**Time to complete**: ~15 minutes  
**Status**: READY TO TEST
