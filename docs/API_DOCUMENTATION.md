# NERA API Documentation

## 📖 Overview

Complete REST API and WebSocket documentation for NERA backend.

**Base URL**: `http://localhost:3001/api/v1` (development)

**Swagger UI**: `http://localhost:3001/docs` (interactive API browser)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### Get Token (Login)

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@neuroadaptive.com",
  "password": "Demo1234!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@neuroadaptive.com",
    "name": "Admin Sistem",
    "role": "ADMIN",
    "isVerified": true,
    "isActive": true,
    "locale": "id",
    "createdAt": "2026-08-30T00:00:00Z"
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 👥 Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "student@neuroadaptive.com",
  "password": "SecurePass123!",
  "name": "Student Name",
  "role": "STUDENT"
}
```

**Roles**: `ADMIN`, `TEACHER`, `COUNSELOR`, `STUDENT`, `PARENT`

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

### Get Profile

```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@neuroadaptive.com",
  "name": "Admin Sistem",
  "role": "ADMIN",
  "avatar": null,
  "locale": "id",
  "isVerified": true,
  "isActive": true,
  "lastLoginAt": "2026-08-30T02:22:00Z",
  "createdAt": "2026-08-30T00:00:00Z",
  "updatedAt": "2026-08-30T02:22:00Z"
}
```

---

## 📊 EEG Endpoints

### Send EEG Result

```http
POST /eeg/results
Authorization: Bearer <token>
Content-Type: application/json

{
  "focusScore": 85,
  "relaxationScore": 45,
  "stressLevel": "medium",
  "brainWaveFrequencies": {
    "delta": 0.15,
    "theta": 0.15,
    "alpha": 0.30,
    "beta": 0.25,
    "gamma": 0.15
  },
  "timestamp": 1693321320000,
  "sessionId": "session-uuid"
}
```

**Success**: `200 OK`

### Get EEG Session Data

```http
GET /eeg/sessions/:sessionId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "session-uuid",
  "userId": "user-uuid",
  "startTime": "2026-08-30T02:00:00Z",
  "endTime": "2026-08-30T02:30:00Z",
  "duration": 1800,
  "averageFocusScore": 82,
  "averageRelaxationScore": 48,
  "dominantStressLevel": "medium",
  "eegData": [
    {
      "timestamp": 1693321320000,
      "focusScore": 85,
      "relaxationScore": 45,
      "stressLevel": "medium"
    }
  ]
}
```

### List User's EEG Sessions

```http
GET /eeg/sessions
Authorization: Bearer <token>

// Optional query parameters:
// ?limit=10&offset=0
// ?sortBy=createdAt&sortOrder=desc
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "startTime": "2026-08-30T02:00:00Z",
      "endTime": "2026-08-30T02:30:00Z",
      "averageFocusScore": 82
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### Get EEG Status

```http
GET /eeg/status
```

**Response:**
```json
{
  "status": "connected",
  "samplingRate": 256,
  "channelsAvailable": 8,
  "lastDataPoint": "2026-08-30T02:22:50Z"
}
```

---

## 🧠 AI Recommendations

### Get Recommendations for Session

```http
GET /ai/recommendations/session/:sessionId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "sessionId": "session-uuid",
  "recommendations": [
    "Great focus! Keep maintaining this level",
    "Consider taking a short break - relaxation score is declining",
    "Practice deep breathing exercises to reduce stress"
  ],
  "analysisTimestamp": "2026-08-30T02:22:50Z"
}
```

### Get Recommendations History

```http
GET /ai/recommendations/history
Authorization: Bearer <token>

// Query parameters:
// ?userId=user-uuid&limit=20&offset=0
```

### Analyze Session

```http
GET /ai/analyze/session/:sessionId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "sessionId": "session-uuid",
  "analysis": {
    "focusTrend": "improving",
    "stressPattern": "decreasing",
    "optimalFocusWindow": "14:00-15:00",
    "suggestedBreakTime": 15,
    "recommendations": [...]
  },
  "generatedAt": "2026-08-30T02:22:50Z"
}
```

---

## 📚 Learning Content

### Get Learning Content

```http
GET /learning/content
Authorization: Bearer <token>

// Query parameters:
// ?difficulty=BEGINNER&subject=mathematics&limit=20
```

**Response:**
```json
{
  "content": [
    {
      "id": "content-uuid",
      "title": "Introduction to Algebra",
      "description": "Learn the basics of algebraic equations",
      "subject": "mathematics",
      "difficulty": "BEGINNER",
      "duration": 45,
      "contentType": "video"
    }
  ],
  "total": 100
}
```

### Get Adaptive Content

```http
GET /learning/content/adaptive/:mode
Authorization: Bearer <token>

// Modes: FOCUS_MODE, RELAXATION_MODE, STRESS_RELIEF_MODE
```

**Response:**
Returns content specifically tailored to the specified brain state.

### Create Learning Content (Teacher/Admin)

```http
POST /learning/content
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced Calculus",
  "description": "Deep dive into calculus concepts",
  "subject": "mathematics",
  "difficulty": "ADVANCED",
  "contentType": "video",
  "duration": 120,
  "url": "https://example.com/video",
  "tags": ["calculus", "mathematics", "advanced"]
}
```

---

## 🎮 Gamification

### Get User Stats

```http
GET /gamification/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": "user-uuid",
  "totalPoints": 5420,
  "currentLevel": 12,
  "nextLevelPoints": 6000,
  "achievementsUnlocked": 18,
  "streakDays": 7,
  "currentStreak": "learning",
  "badges": [
    {
      "id": "badge-uuid",
      "name": "Brain Master",
      "description": "Achieved 90% focus score",
      "unlockedAt": "2026-08-30T01:00:00Z"
    }
  ]
}
```

### Get Leaderboard

```http
GET /gamification/leaderboard
Authorization: Bearer <token>

// Query parameters:
// ?period=WEEK&limit=50&offset=0
```

**Periods**: `DAY`, `WEEK`, `MONTH`, `ALL_TIME`

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user-uuid",
      "name": "Top Student",
      "points": 45000,
      "level": 25
    }
  ],
  "userRank": 42,
  "period": "WEEK"
}
```

### Check Achievements

```http
POST /gamification/check-achievements
Authorization: Bearer <token>
```

**Response:**
```json
{
  "newAchievements": [
    {
      "id": "achievement-uuid",
      "name": "Meditation Master",
      "description": "Achieved 20 consecutive days of relaxation",
      "reward": 500
    }
  ],
  "totalPoints": 5420
}
```

### Get Missions

```http
GET /gamification/missions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "activeMissions": [
    {
      "id": "mission-uuid",
      "name": "Focus Quest",
      "description": "Maintain 80% focus for 10 sessions",
      "progress": 7,
      "target": 10,
      "reward": 1000,
      "deadline": "2026-09-06T23:59:59Z"
    }
  ],
  "completedMissions": 24
}
```

---

## 📊 Analytics

### Get User Analytics

```http
GET /analytics/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": "user-uuid",
  "totalSessions": 42,
  "totalFocusTime": 3780,
  "averageFocusScore": 82,
  "averageRelaxationScore": 55,
  "focusTrend": "improving",
  "improvementPercentage": 12.5,
  "weeklyStats": {
    "Monday": { "sessions": 6, "averageFocus": 84 },
    "Tuesday": { "sessions": 5, "averageFocus": 81 }
  }
}
```

### Get Class Analytics (Teacher)

```http
GET /analytics/class
Authorization: Bearer <token>

// Query parameters:
// ?classId=class-uuid&period=MONTH
```

**Response:**
```json
{
  "classId": "class-uuid",
  "totalStudents": 30,
  "averageStudentFocus": 78,
  "topPerformer": {
    "studentId": "user-uuid",
    "name": "Best Student",
    "focusScore": 92
  },
  "needsAttention": [
    {
      "studentId": "user-uuid",
      "name": "Struggling Student",
      "focusScore": 45
    }
  ]
}
```

### Get Student Analytics (Teacher viewing student)

```http
GET /analytics/student/:studentId
Authorization: Bearer <token>
```

---

## 💬 Notifications

### Get Notifications

```http
GET /notifications
Authorization: Bearer <token>

// Query parameters:
// ?limit=20&offset=0&read=false
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification-uuid",
      "title": "Achievement Unlocked",
      "message": "You've achieved 90% focus!",
      "type": "achievement",
      "read": false,
      "createdAt": "2026-08-30T02:20:00Z"
    }
  ],
  "total": 15,
  "unreadCount": 3
}
```

### Get Unread Count

```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "unreadCount": 3
}
```

### Mark Notification as Read

```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read

```http
POST /notifications/read-all
Authorization: Bearer <token>
```

---

## 🎯 Interventions

### Create Intervention (Teacher/Counselor)

```http
POST /interventions
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "student-uuid",
  "type": "encouragement",
  "subject": "Great Focus!",
  "message": "Your focus has improved by 15% this week!",
  "priority": "normal"
}
```

**Types**: `encouragement`, `warning`, `counseling`, `feedback`

**Response**:
```json
{
  "id": "intervention-uuid",
  "senderId": "sender-uuid",
  "recipientId": "recipient-uuid",
  "type": "encouragement",
  "subject": "Great Focus!",
  "message": "Your focus has improved by 15% this week!",
  "status": "sent",
  "createdAt": "2026-08-30T02:22:50Z"
}
```

### Get Received Interventions

```http
GET /interventions/received
Authorization: Bearer <token>

// Query parameters:
// ?type=encouragement&limit=20
```

### Get Sent Interventions (Teacher)

```http
GET /interventions/sent
Authorization: Bearer <token>
```

### Update Intervention Status

```http
PUT /interventions/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "acknowledged"
}
```

**Statuses**: `sent`, `read`, `acknowledged`, `archived`

---

## 📝 Journal

### Create Journal Entry

```http
POST /journal
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Learning Journey",
  "content": "Today I made great progress in mathematics...",
  "mood": "positive",
  "focusLevel": 85,
  "tags": ["mathematics", "progress", "achievement"]
}
```

### Get Journal Entries

```http
GET /journal
Authorization: Bearer <token>

// Query parameters:
// ?limit=20&offset=0&sortBy=createdAt&sortOrder=desc
```

### Get Single Entry

```http
GET /journal/:id
Authorization: Bearer <token>
```

### Update Entry

```http
PUT /journal/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "mood": "positive"
}
```

### Delete Entry

```http
DELETE /journal/:id
Authorization: Bearer <token>
```

---

## 🔄 WebSocket Events

### Connection

```javascript
socket.connect()

// On connect:
socket.emit('join-session', {
  userId: 'user-uuid',
  sessionId: 'session-uuid'
})
```

### Send EEG Result (Real-time)

```javascript
socket.emit('eeg-result', {
  focusScore: 85,
  relaxationScore: 45,
  stressLevel: 'medium',
  brainWaveFrequencies: {...},
  timestamp: Date.now(),
  sessionId: 'session-uuid'
})
```

### Receive Recommendation

```javascript
socket.on('recommendation', (data) => {
  console.log('Recommendation:', data)
  // {
  //   sessionId: 'session-uuid',
  //   recommendations: ['Break time recommended', ...]
  // }
})
```

### Receive Notification

```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification)
})
```

### Receive Analytics Update

```javascript
socket.on('analytics-update', (data) => {
  console.log('Analytics updated:', data)
})
```

### Disconnect

```javascript
socket.disconnect()
```

---

## ❌ Error Responses

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Invalid request",
  "error": "Bad Request",
  "timestamp": "2026-08-30T02:22:50Z"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |
| 503 | Service Unavailable |

### Common Error Messages

```
401 Unauthorized: Invalid or expired token
403 Forbidden: You don't have permission for this resource
404 Not Found: The requested resource was not found
409 Conflict: Email already registered
422 Unprocessable Entity: Invalid request data
```

---

## 📋 Request/Response Examples

### Complete Login Flow

```javascript
// 1. Login
POST /auth/login
{
  "email": "admin@neuroadaptive.com",
  "password": "Demo1234!"
}

// Response:
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": { ... }
}

// 2. Use token in subsequent requests
GET /auth/profile
Authorization: Bearer eyJhbGciOi...

// 3. When token expires, refresh it
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOi..."
}
```

---

## 🔍 Rate Limiting

**Current Limits:**
- 100 requests per minute per IP
- WebSocket connections: No limit (connection-based)

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1693321380
```

---

## 📞 API Support

- **Swagger UI**: `http://localhost:3001/docs`
- **Health Check**: `GET /health`
- **Error Details**: Check response status and message field

---

**NERA API v1 - Edge-Cloud Hybrid Architecture** 🚀
