# 🧪 End-to-End Testing Guide

**Purpose**: Complete user flow testing for all roles in NERA application  
**Date**: August 29, 2026  
**Status**: Testing Framework Ready

---

## 📋 Prerequisites

### Required Setup

1. **Backend Running**
   ```bash
   cd backend
   npm run start:dev
   ```
   Verify: `http://localhost:3001/health` returns OK

2. **Frontend Running**
   ```bash
   cd frontend
   npm run dev
   ```
   Verify: `http://localhost:3000` loads

3. **Database Seeded**
   ```bash
   cd backend
   npm run db:seed
   ```
   Verify: Demo users created

4. **Browser**
   - Chrome/Edge (recommended for DevTools)
   - Network tab open (to verify API calls)
   - Console tab open (to catch errors)

---

## 👨‍🎓 Student User Flow

### Test Account
```
Email: siswa@neuroadaptive.com
Password: Demo1234!
Expected Role: STUDENT
Expected Name: Alya Juwita Putri
```

---

### Flow 1: Login & Dashboard Access

**Steps:**

1. **Navigate to Landing Page**
   - URL: `http://localhost:3000`
   - ✅ Check: Page loads without errors
   - ✅ Check: NERA logo visible
   - ✅ Check: "Masuk" button visible

2. **Click "Masuk" Button**
   - ✅ Check: Redirects to `/auth/login`
   - ✅ Check: Login form appears
   - ✅ Check: Email and password fields visible

3. **Enter Credentials**
   - Email: `siswa@neuroadaptive.com`
   - Password: `Demo1234!`
   - ✅ Check: Input fields accept text

4. **Click "Login" Button**
   - ✅ Check: Loading indicator appears
   - ✅ Check: Network request to `POST /auth/login`
   - ✅ Check: Response contains `accessToken` and `user` object
   - ✅ Check: Redirects to `/dashboard/student`
   - ✅ Check: localStorage has `accessToken` and `user`

5. **Verify Dashboard Loads**
   - ✅ Check: User name "Alya Juwita Putri" displayed
   - ✅ Check: XP/Level/Streak widgets visible
   - ✅ Check: Weekly progress chart visible
   - ✅ Check: No console errors
   - ✅ Check: Bottom navigation visible (Beranda/Statistik/Profil)

**Expected API Calls:**
```
POST /auth/login → 200 OK
GET /analytics/user?period=WEEKLY → 200 OK (or 404 if no data)
GET /gamification/badges → 200 OK
GET /gamification/level → 200 OK
GET /gamification/streak → 200 OK
```

**Success Criteria:**
- ✅ Login successful with backend API
- ✅ Dashboard loads with real data or empty states
- ✅ No mock data displayed
- ✅ Navigation functional

---

### Flow 2: Start EEG Session

**Prerequisites:** Logged in as student

**Steps:**

1. **Navigate to EEG Session Page**
   - Click "Mulai Sesi" button on dashboard
   - OR navigate to `/dashboard/student/session`
   - ✅ Check: Session page loads
   - ✅ Check: "Start Session" button visible

2. **Click "Start Session"**
   - ✅ Check: Loading indicator appears
   - ✅ Check: API call to `POST /eeg/start`
   - ✅ Check: Response contains `sessionId`
   - ✅ Check: Session status changes to "ACTIVE"
   - ✅ Check: WebSocket connection established

3. **Verify Real-time Data Streaming**
   - ✅ Check: Focus index updates every 100ms (10Hz)
   - ✅ Check: EEG chart animates smoothly
   - ✅ Check: Brain wave indicators (alpha, beta, theta) update
   - ✅ Check: Focus category displays (LOW/MODERATE/HIGH)
   - ✅ Check: No lag or frozen UI

4. **Monitor Session for 2 Minutes**
   - ✅ Check: Timer counts up
   - ✅ Check: Focus data continuously updates
   - ✅ Check: Signal quality indicator present
   - ✅ Check: No console errors or warnings

5. **Stop Session**
   - Click "Stop Session" button
   - ✅ Check: API call to `POST /eeg/stop/:sessionId`
   - ✅ Check: WebSocket disconnects gracefully
   - ✅ Check: Session summary displays
   - ✅ Check: XP earned shown
   - ✅ Check: Coins earned shown

6. **Verify Session Saved**
   - Navigate to `/dashboard/student/history` or analytics
   - ✅ Check: Completed session appears in history
   - ✅ Check: Session details (duration, avgFocus, avgStress) saved
   - ✅ Check: Analytics updated with new session data

**Expected API Calls:**
```
POST /eeg/start → 201 Created (sessionId)
WebSocket /eeg → connect → emit('startStream')
WebSocket /eeg → on('eegData') [10 events per second]
POST /eeg/stop/:sessionId → 200 OK
GET /eeg/session/:sessionId → 200 OK
```

**Success Criteria:**
- ✅ Session starts and stops correctly
- ✅ Real-time data streams without interruption
- ✅ Session data persists to database
- ✅ Gamification rewards calculated

---

### Flow 3: View Analytics

**Prerequisites:** At least 1 completed session

**Steps:**

1. **Navigate to Analytics**
   - Click "Statistik" in bottom navigation
   - OR navigate to `/dashboard/student/stats`
   - ✅ Check: Analytics page loads
   - ✅ Check: Time range selector (Week/Month) visible

2. **Verify Weekly Analytics**
   - Select "Week" time range
   - ✅ Check: API call to `GET /analytics/user?period=WEEKLY`
   - ✅ Check: Total sessions count displayed
   - ✅ Check: Average focus percentage shown
   - ✅ Check: Total minutes calculated
   - ✅ Check: Weekly progress chart populated

3. **Switch to Monthly View**
   - Select "Month" time range
   - ✅ Check: API call to `GET /analytics/user?period=MONTHLY`
   - ✅ Check: Data updates to monthly aggregation
   - ✅ Check: Chart re-renders with new data

4. **Check Focus Distribution**
   - ✅ Check: LOW/MODERATE/HIGH percentages shown
   - ✅ Check: Adds up to 100%
   - ✅ Check: Visual breakdown (pie chart or bars)

5. **View Session History**
   - Scroll to "Riwayat Sesi" section
   - ✅ Check: List of completed sessions
   - ✅ Check: Each session shows date, duration, avgFocus
   - ✅ Check: Can click session for details

**Success Criteria:**
- ✅ Analytics loads from backend
- ✅ Time range switching works
- ✅ Data visualization accurate
- ✅ Session history accessible

---

### Flow 4: Gamification - Achievements & Rewards

**Prerequisites:** Some sessions completed

**Steps:**

1. **Check Current Level & XP**
   - Dashboard shows level widget
   - ✅ Check: Current level displayed (e.g., "Level 5")
   - ✅ Check: Current XP shown (e.g., "2840 XP")
   - ✅ Check: XP to next level shown (e.g., "160 to Level 6")
   - ✅ Check: Progress bar visual

2. **View Badges/Achievements**
   - Navigate to badges section
   - ✅ Check: API call to `GET /gamification/badges`
   - ✅ Check: Unlocked badges shown (colored/highlighted)
   - ✅ Check: Locked badges shown (grayed out)
   - ✅ Check: Progress percentage for each badge

3. **Check Streak**
   - ✅ Check: Current streak days displayed (e.g., "7 hari")
   - ✅ Check: Streak icon (🔥) visible if active
   - ✅ Check: Longest streak shown

4. **Complete a Session to Earn Rewards**
   - Start and complete a new session
   - ✅ Check: XP increases after session
   - ✅ Check: Coins increase after session
   - ✅ Check: Level up notification if threshold reached
   - ✅ Check: Achievement unlock notification if earned

5. **Verify Leaderboard (if available)**
   - Navigate to leaderboard
   - ✅ Check: User ranking displayed
   - ✅ Check: Top users shown
   - ✅ Check: XP-based sorting

**Success Criteria:**
- ✅ Gamification system functional
- ✅ Rewards calculated correctly
- ✅ Achievements unlock properly
- ✅ Streak tracking accurate

---

### Flow 5: Journal Entry

**Prerequisites:** Logged in as student

**Steps:**

1. **Navigate to Journal**
   - Click menu or navigate to `/dashboard/student/journal`
   - ✅ Check: Journal page loads
   - ✅ Check: "Write New Entry" button visible
   - ✅ Check: Previous entries list (or empty state)

2. **Create Manual Entry**
   - Click "Write New Entry"
   - ✅ Check: Editor modal/page appears
   - Select mood: "Happy" 😊
   - Enter title: "Sesi fokus hari ini"
   - Enter content: "Hari ini saya belajar dengan fokus tinggi..."
   - ✅ Check: Text input works
   - Click "Save"
   - ✅ Check: API call to `POST /journal/entries`
   - ✅ Check: Entry appears in list
   - ✅ Check: Timestamp correct

3. **Generate AI Journal**
   - Click "Generate AI Summary"
   - ✅ Check: API call to `POST /ai/journal`
   - ✅ Check: Loading indicator during generation
   - ✅ Check: AI-generated text appears
   - ✅ Check: EEG summary included (avgFocus, avgStress, sessions today)
   - ✅ Check: Can edit AI-generated text before saving

4. **View Journal Entry**
   - Click on a journal entry
   - ✅ Check: Full entry displays
   - ✅ Check: Mood emoji shown
   - ✅ Check: Date and time shown
   - ✅ Check: EEG summary (if available) shown

5. **Edit Journal Entry**
   - Click "Edit" on an entry
   - Modify content
   - Click "Save"
   - ✅ Check: API call to `PUT /journal/entries/:id`
   - ✅ Check: Changes saved
   - ✅ Check: Updated timestamp

6. **Delete Journal Entry (optional)**
   - Click "Delete" on an entry
   - Confirm deletion
   - ✅ Check: API call to `DELETE /journal/entries/:id`
   - ✅ Check: Entry removed from list

**Expected API Calls:**
```
GET /journal/entries → 200 OK
POST /journal/entries → 201 Created
POST /ai/journal → 200 OK (AI generation)
PUT /journal/entries/:id → 200 OK
DELETE /journal/entries/:id → 200 OK
```

**Success Criteria:**
- ✅ CRUD operations work
- ✅ AI journal generation functional
- ✅ EEG data integrated into journal
- ✅ Mood tracking works

---

### Flow 6: Browse & Enroll in Courses

**Prerequisites:** Logged in as student

**Steps:**

1. **Navigate to Courses**
   - Click "Courses" or navigate to `/dashboard/student/courses`
   - ✅ Check: API call to `GET /learning/courses`
   - ✅ Check: Course cards displayed
   - ✅ Check: Each course shows title, description, difficulty

2. **Filter Courses**
   - Select difficulty filter (e.g., "Beginner")
   - ✅ Check: Courses filtered client-side
   - Select content type filter (e.g., "Video")
   - ✅ Check: Courses filtered by type

3. **View Course Details**
   - Click on a course card
   - ✅ Check: Navigate to `/dashboard/student/courses/:id`
   - ✅ Check: API call to `GET /learning/courses/:id`
   - ✅ Check: Full course description shown
   - ✅ Check: Modules/chapters listed
   - ✅ Check: Duration estimate shown

4. **Enroll in Course**
   - Click "Enroll" button
   - ✅ Check: API call to `POST /learning/enroll/:id`
   - ✅ Check: Button changes to "Continue" or "Start Learning"
   - ✅ Check: Course added to "My Courses"

5. **Track Progress**
   - Complete a module/lesson
   - ✅ Check: API call to `POST /learning/progress/:id`
   - ✅ Check: Progress bar updates
   - ✅ Check: Completion percentage shown
   - ✅ Check: XP earned for completion

**Success Criteria:**
- ✅ Course browsing functional
- ✅ Enrollment process works
- ✅ Progress tracking accurate
- ✅ Content delivery working

---

### Flow 7: Settings & Profile

**Prerequisites:** Logged in as student

**Steps:**

1. **Navigate to Settings**
   - Click "Profil" in bottom nav or menu
   - Navigate to `/settings`
   - ✅ Check: Settings page loads
   - ✅ Check: Current profile info displayed

2. **Update Profile**
   - Change name
   - Upload avatar (if supported)
   - Update locale (ID/EN)
   - Click "Save"
   - ✅ Check: API call to `PUT /users/profile`
   - ✅ Check: Changes saved
   - ✅ Check: Dashboard reflects new name/avatar

3. **Change Password**
   - Navigate to "Change Password" section
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click "Update Password"
   - ✅ Check: API call to `PUT /auth/password`
   - ✅ Check: Success message shown
   - ✅ Check: Can login with new password

4. **Notification Preferences**
   - Toggle notification settings
   - ✅ Check: Settings save immediately or on button click
   - ✅ Check: Preferences persist after refresh

5. **View Notifications**
   - Navigate to `/notifications`
   - ✅ Check: API call to `GET /notifications`
   - ✅ Check: List of notifications shown
   - ✅ Check: Unread notifications highlighted
   - Click notification
   - ✅ Check: API call to `PUT /notifications/:id/read`
   - ✅ Check: Notification marked as read

**Success Criteria:**
- ✅ Profile updates work
- ✅ Password change functional
- ✅ Notification system working
- ✅ Settings persist

---

### Flow 8: Logout

**Steps:**

1. **Click Logout**
   - Click "Logout" button (in menu or profile)
   - ✅ Check: API call to `POST /auth/logout` (optional)
   - ✅ Check: localStorage cleared (accessToken, refreshToken, user)
   - ✅ Check: Redirects to `/` (landing page)

2. **Verify Logout**
   - Try accessing `/dashboard/student`
   - ✅ Check: Redirects to `/auth/login`
   - ✅ Check: Cannot access protected routes
   - ✅ Check: No user data in localStorage

**Success Criteria:**
- ✅ Logout clears session
- ✅ Protected routes inaccessible
- ✅ Clean redirect to public page

---

## 👨‍🏫 Teacher User Flow

### Test Account
```
Email: guru@neuroadaptive.com
Password: Demo1234!
Expected Role: TEACHER
Expected Name: Hannibal Lecter, S.Pd
```

---

### Flow 1: Teacher Login & Dashboard

**Steps:**

1. **Login as Teacher**
   - Navigate to `/auth/login`
   - Email: `guru@neuroadaptive.com`
   - Password: `Demo1234!`
   - ✅ Check: Redirects to `/dashboard/teacher`
   - ✅ Check: Teacher-specific UI shown

2. **Verify Class Overview**
   - ✅ Check: API call to `GET /analytics/class`
   - ✅ Check: List of monitored students shown
   - ✅ Check: Each student shows name, avgFocus, lastActive
   - ✅ Check: Class-wide statistics (avg focus, total sessions)

3. **View Student List**
   - ✅ Check: Table/cards of students
   - ✅ Check: Can sort by focus, sessions, lastActive
   - ✅ Check: Search/filter functionality

**Success Criteria:**
- ✅ Teacher dashboard loads
- ✅ Student data visible
- ✅ Class analytics functional

---

### Flow 2: Real-time Class Monitoring

**Prerequisites:** Logged in as teacher

**Steps:**

1. **Navigate to Live Monitor**
   - Click "Monitor Live" or similar
   - ✅ Check: WebSocket connection established
   - ✅ Check: API/WebSocket call for class simulation

2. **Start Class Monitoring**
   - Click "Start Monitoring"
   - ✅ Check: emit('startClassSimulation', { studentIds: [...] })
   - ✅ Check: Receive 'classEegData' events (every 2s)
   - ✅ Check: Student focus indicators update

3. **View Individual Student**
   - Click on a student card
   - ✅ Check: Student's real-time data highlighted
   - ✅ Check: Current focus category shown
   - ✅ Check: Stress level indicator

4. **Identify Struggling Student**
   - Look for student with high stress (>70%) or low focus (<40%)
   - ✅ Check: Visual alert/warning indicator
   - ✅ Check: Suggestion to intervene

**Success Criteria:**
- ✅ Real-time monitoring works
- ✅ Multi-student data streams
- ✅ Alerts for struggling students

---

### Flow 3: Create Intervention

**Prerequisites:** Identified struggling student

**Steps:**

1. **Click "Create Intervention"**
   - Select student from dropdown or click on their card
   - ✅ Check: Intervention form appears
   - ✅ Check: Student name pre-filled

2. **Fill Intervention Details**
   - Type: "Support"
   - Title: "Perhatian fokus menurun"
   - Notes: "Siswa menunjukkan penurunan fokus..."
   - Priority: "HIGH"
   - Click "Send"
   - ✅ Check: API call to `POST /interventions`
   - ✅ Check: Success message shown

3. **Verify Intervention Sent**
   - ✅ Check: Intervention appears in "Sent Interventions" list
   - ✅ Check: Status shows "PENDING"
   - ✅ Check: Student receives notification

4. **Student Views Intervention**
   - (Switch to student account or verify API)
   - ✅ Check: Notification created for student
   - ✅ Check: Intervention visible in student's notifications

5. **Track Intervention Status**
   - Student acknowledges or responds
   - ✅ Check: Status updates to "IN_PROGRESS"
   - Teacher marks as resolved
   - ✅ Check: API call to `PUT /interventions/:id`
   - ✅ Check: Status updates to "RESOLVED"

**Expected API Calls:**
```
POST /interventions → 201 Created
GET /interventions?toUserId=:studentId → 200 OK
PUT /interventions/:id → 200 OK
```

**Success Criteria:**
- ✅ Intervention creation works
- ✅ Notifications sent to student
- ✅ Status tracking functional

---

### Flow 4: View Class Analytics

**Prerequisites:** Students have completed sessions

**Steps:**

1. **Navigate to Class Analytics**
   - Click "Class Stats" or navigate to `/dashboard/teacher/stats`
   - ✅ Check: API call to `GET /analytics/class?period=WEEKLY`
   - ✅ Check: Class-wide metrics shown

2. **View Aggregate Metrics**
   - ✅ Check: Average class focus percentage
   - ✅ Check: Total class sessions
   - ✅ Check: Active students count
   - ✅ Check: Struggling students count

3. **View Individual Student Analytics**
   - Click on a student in the list
   - ✅ Check: Drill-down to student's detailed analytics
   - ✅ Check: Shows same data as student's own analytics page
   - ✅ Check: Can view session history

4. **Export Report (if available)**
   - Click "Export Report"
   - ✅ Check: CSV/PDF download initiated
   - ✅ Check: Contains class summary data

**Success Criteria:**
- ✅ Class-wide analytics visible
- ✅ Individual student drill-down works
- ✅ Data accurate and up-to-date

---

## 👨‍💼 Admin User Flow

### Test Account
```
Email: admin@neuroadaptive.com
Password: Demo1234!
Expected Role: ADMIN
```

---

### Flow 1: Admin Dashboard

**Steps:**

1. **Login as Admin**
   - Email: `admin@neuroadaptive.com`
   - Password: `Demo1234!`
   - ✅ Check: Redirects to `/dashboard/admin`
   - ✅ Check: Admin-specific UI shown

2. **View System Overview**
   - ✅ Check: Total users count
   - ✅ Check: Active sessions count
   - ✅ Check: System health metrics

3. **Manage Users (if implemented)**
   - Navigate to "Users" section
   - ✅ Check: List all users
   - ✅ Check: Can filter by role
   - ✅ Check: Can search by name/email

4. **View Audit Logs (if implemented)**
   - Navigate to "Audit Logs"
   - ✅ Check: Recent system actions listed
   - ✅ Check: Shows user, action, timestamp

**Success Criteria:**
- ✅ Admin dashboard accessible
- ✅ User management functional (if implemented)
- ✅ System monitoring works

---

## 🔧 Technical Testing

### API Response Times

Test with backend running, measure response times:

```bash
# Auth endpoint
time curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"siswa@neuroadaptive.com","password":"Demo1234!"}'

# Expected: < 200ms
```

```bash
# Analytics endpoint
time curl http://localhost:3001/analytics/user?period=WEEKLY \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: < 100ms
```

### WebSocket Performance

1. Open DevTools Network tab
2. Filter: WS (WebSocket)
3. Start EEG session
4. Monitor WebSocket frames
   - ✅ Check: ~10 frames per second (10Hz)
   - ✅ Check: Frame size < 1KB
   - ✅ Check: No disconnections

### Database Query Performance

Open Prisma Studio: `npm run db:studio`

1. Check record counts:
   - ✅ Users: 6+
   - ✅ Sessions: Increases with usage
   - ✅ EEGLog: Many records per session
   - ✅ EEGProcessed: ~1 per second per session

2. Verify relationships:
   - ✅ User → Sessions
   - ✅ Session → EEGLog
   - ✅ User → Gamification

---

## 📊 Test Results Template

### Session Summary

**Date**: ___________  
**Tester**: ___________  
**Duration**: ___________ minutes

### Results

| Flow | Status | Notes |
|------|--------|-------|
| Student Login | ⬜ Pass ⬜ Fail | |
| Start EEG Session | ⬜ Pass ⬜ Fail | |
| View Analytics | ⬜ Pass ⬜ Fail | |
| Gamification | ⬜ Pass ⬜ Fail | |
| Journal Entry | ⬜ Pass ⬜ Fail | |
| Browse Courses | ⬜ Pass ⬜ Fail | |
| Settings | ⬜ Pass ⬜ Fail | |
| Logout | ⬜ Pass ⬜ Fail | |
| Teacher Login | ⬜ Pass ⬜ Fail | |
| Class Monitoring | ⬜ Pass ⬜ Fail | |
| Create Intervention | ⬜ Pass ⬜ Fail | |
| Class Analytics | ⬜ Pass ⬜ Fail | |

### Issues Found

1. **Issue**: ___________  
   **Severity**: ⬜ Critical ⬜ Major ⬜ Minor  
   **Reproduction**: ___________

2. **Issue**: ___________  
   **Severity**: ⬜ Critical ⬜ Major ⬜ Minor  
   **Reproduction**: ___________

### Overall Assessment

- **Functionality**: ___ / 10
- **Performance**: ___ / 10
- **UX**: ___ / 10
- **Stability**: ___ / 10

**Ready for Beta?**: ⬜ Yes ⬜ No (explain): ___________

---

## ✅ Success Criteria

### Critical (Must Pass)
- ✅ Login/logout works with real backend
- ✅ EEG session starts and stops successfully
- ✅ Real-time data streams without interruption
- ✅ Data persists to database
- ✅ All role-based dashboards accessible

### Important (Should Pass)
- ✅ Analytics load from backend
- ✅ Gamification rewards calculated
- ✅ Journal CRUD operations work
- ✅ Teacher can monitor students
- ✅ No console errors during normal use

### Nice to Have
- ✅ Smooth animations and transitions
- ✅ Loading states feel fast
- ✅ Error messages helpful
- ✅ Responsive on mobile

---

## 🐛 Known Issues to Verify

Based on audit, check these potential issues:

1. **Mock Data Fallbacks** (MOCK_DATA_REMOVAL_GUIDE.md)
   - ✅ Verify no mock data shows when backend available
   - ✅ Verify error messages when backend down

2. **Chart Placeholder Data**
   - ⚠️ Some charts still use hardcoded data (documented as acceptable for MVP)

3. **Real-time Sync**
   - ✅ Verify WebSocket reconnects after disconnect
   - ✅ Verify data doesn't duplicate on reconnect

---

## 📞 Testing Quick Reference

### Start All Services

```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Database GUI (optional)
cd backend && npm run db:studio
```

### Demo Credentials

```
Student: siswa@neuroadaptive.com / Demo1234!
Teacher: guru@neuroadaptive.com / Demo1234!
Admin: admin@neuroadaptive.com / Demo1234!
```

### Verify Services

```bash
# Backend health
curl http://localhost:3001/health

# Frontend loaded
curl http://localhost:3000

# WebSocket available
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:3001/socket.io/?transport=websocket
```

---

**Created**: August 29, 2026  
**Last Updated**: August 29, 2026  
**Status**: Ready for manual testing

