# 🔄 Mock Data Removal & Real API Integration Guide

**Purpose**: Document remaining mock data usage and plan for complete API integration  
**Date**: August 29, 2026  
**Status**: In Progress - AuthContext Fixed

---

## ✅ Completed Fixes

### 1. AuthContext - FIXED ✅

**File**: `frontend/src/contexts/AuthContext.tsx`

**Changes Made**:
- ✅ Removed auto-login mock mode
- ✅ Now calls `ApiClient.getCurrentUser()` to verify token on mount
- ✅ Login function uses real `ApiClient.login()` without fallback
- ✅ Logout function calls `ApiClient.logout()` 
- ✅ Proper error handling - throws errors instead of falling back to mock

**Before**:
```typescript
// MOCK MODE: Auto-login as demo student
const mockUser = { ... };
setUser(mockUser);
```

**After**:
```typescript
// Verify token with backend
ApiClient.getCurrentUser()
  .then((userData) => {
    setUser(userData);
  })
  .catch(() => {
    // Token invalid - user must login
    setUser(null);
  });
```

---

## 🚧 Remaining Mock Data Usage

### 2. StudentDashboardStitch - TO FIX

**File**: `frontend/src/components/StudentDashboardStitch.tsx`

**Current Issue**:
```typescript
ApiClient.getUserAnalytics(period).catch(() => mockAnalytics)
```

**Recommended Fix**:
```typescript
// Remove .catch() fallback
const [analyticsData, badgesData, levelData, streakData] = await Promise.all([
  ApiClient.getUserAnalytics(period),
  ApiClient.getUserBadges(),
  ApiClient.getUserLevel(),
  ApiClient.getUserStreak(),
]);

// Show empty state instead of mock data on error
const data = analytics || {
  avgFocus: 0,
  totalMinutes: 0,
  totalSessions: 0,
  avgStress: 0,
  dailyData: [],
};
```

**Impact**: Users will see empty dashboard if backend is down, prompting them to start backend

---

### 3. TeacherDashboardStitchV2 - TO FIX

**File**: `frontend/src/components/TeacherDashboardStitchV2.tsx`

**Current Issue**:
```typescript
const analytics = await ApiClient.getClassAnalytics().catch(() => mockStudents);
```

**Recommended Fix**:
```typescript
try {
  const analytics = await ApiClient.getClassAnalytics();
  setClassAnalytics(analytics);
} catch (error) {
  console.error('Failed to load class data:', error);
  setError('Tidak dapat memuat data kelas. Pastikan backend berjalan.');
  setClassAnalytics([]);
}
```

**Add Error UI**:
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
    ⚠️ {error}
  </div>
)}

{classAnalytics.length === 0 && !loading && (
  <div className="text-center py-12">
    <p className="text-gray-600">Belum ada data siswa</p>
    <p className="text-sm text-gray-500 mt-2">Mulai backend atau tambahkan siswa</p>
  </div>
)}
```

---

### 4. JournalPageStitch - TO FIX

**File**: `frontend/src/components/JournalPageStitch.tsx`

**Current Issue**:
```typescript
const entries = await ApiClient.getJournalEntries(20).catch(() => mockEntries);
```

**Recommended Fix**:
```typescript
try {
  const entries = await ApiClient.getJournalEntries(20);
  setJournalEntries(entries);
} catch (error) {
  console.error('Failed to load journal entries:', error);
  setJournalEntries([]);
  setError('Gagal memuat jurnal. Periksa koneksi backend.');
}
```

---

### 5. HardwareCalibrationStitchV2 - TO FIX

**File**: `frontend/src/components/HardwareCalibrationStitchV2.tsx`

**Current Issue**:
```typescript
const status = await ApiClient.getEEGStatus().catch(() => mockDeviceStatus);
```

**Recommended Fix**:
```typescript
try {
  const status = await ApiClient.getEEGStatus();
  setDeviceStatus(status);
} catch (error) {
  console.error('Failed to load device status:', error);
  setDeviceStatus({
    connected: false,
    deviceId: null,
    batteryLevel: 0,
    signalQuality: 0,
  });
  setError('Perangkat tidak terhubung. Pastikan backend dan simulator berjalan.');
}
```

---

### 6. CoursesPageStitch - TO FIX

**File**: `frontend/src/components/CoursesPageStitch.tsx`

**Current Issue**:
```typescript
const data = await ApiClient.getCourses().catch(() => mockCourses);
```

**Recommended Fix**:
```typescript
try {
  const data = await ApiClient.getCourses();
  setCourses(data);
} catch (error) {
  console.error('Failed to load courses:', error);
  setCourses([]);
  setError('Gagal memuat kursus. Periksa koneksi backend.');
}
```

---

### 7. AnalyticsPageStitch - TO FIX

**File**: `frontend/src/components/AnalyticsPageStitch.tsx`

**Current Issue**:
```typescript
const data = await ApiClient.getUserAnalytics(period).catch(() => mockData);
```

**Recommended Fix**: Same as StudentDashboardStitch - remove fallback, show empty state

---

### 8. Charts with Hardcoded Data - KEEP AS-IS ⚠️

**Files**:
- `frontend/src/components/StudentAnalyticsDashboard.tsx` (attendance heatmap)
- `frontend/src/components/TeacherDashboard.tsx` (attention heatmap)
- `frontend/src/components/CognitiveJournalPage.tsx` (EEG visualization)
- `frontend/src/app/dashboard/teacher/stats/page.tsx` (graph bars)
- `frontend/src/app/dashboard/student/stats/page.tsx` (graph bars)
- `frontend/src/components/AnalyticsPage.tsx` (focus heatmap)

**Reason**: These are UI demonstration data for charts/visualizations. Will be replaced when:
1. Backend analytics endpoints return chart-ready data
2. Real-time EEG streaming is integrated
3. Historical data accumulates

**For MVP**: Keep these as placeholder visualizations

---

## 🎯 Implementation Strategy

### Phase 1: Critical Auth & Dashboard (CURRENT)

Priority: **HIGH** - Users must login properly

- [x] AuthContext - Remove auto-login, use real API
- [ ] StudentDashboardStitch - Remove mock fallbacks
- [ ] TeacherDashboardStitchV2 - Remove mock fallbacks

**Goal**: Users must start backend to use app

### Phase 2: Feature Pages

Priority: **MEDIUM** - Individual features

- [ ] JournalPageStitch - Remove mock entries
- [ ] CoursesPageStitch - Remove mock courses
- [ ] AnalyticsPageStitch - Remove mock analytics
- [ ] HardwareCalibrationStitchV2 - Remove mock device status

**Goal**: All pages show real data or empty states

### Phase 3: UI Enhancements

Priority: **LOW** - Polish

- [ ] Replace chart placeholder data with real analytics
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Add retry mechanisms

**Goal**: Professional error handling and loading states

---

## 🔧 Standard Error Handling Pattern

### Component State

```typescript
const [data, setData] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### API Call

```typescript
const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await ApiClient.getData();
    setData(response);
  } catch (err) {
    console.error('Failed to load data:', err);
    setError('Gagal memuat data. Pastikan backend berjalan di http://localhost:3001');
  } finally {
    setLoading(false);
  }
};
```

### UI Rendering

```tsx
{loading && <LoadingSpinner />}

{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
    ⚠️ {error}
    <button onClick={loadData} className="ml-4 text-sm underline">
      Coba Lagi
    </button>
  </div>
)}

{!loading && !error && data?.length === 0 && (
  <div className="text-center py-12 text-gray-600">
    <p>Belum ada data</p>
    <p className="text-sm mt-2">Mulai sesi pertama Anda</p>
  </div>
)}

{!loading && !error && data && (
  <div>
    {/* Render actual data */}
  </div>
)}
```

---

## 📊 Testing Checklist

### Backend Running (Happy Path)

Test with `cd backend && npm run start:dev`:

- [x] Login works with real credentials (siswa@neuroadaptive.com / Demo1234!)
- [ ] Student dashboard loads real analytics
- [ ] Teacher dashboard shows real student list
- [ ] Journal page loads real entries (or empty state)
- [ ] Courses page loads real courses from DB
- [ ] EEG status shows simulator connected
- [ ] All API calls succeed

### Backend Down (Error Path)

Test with backend stopped:

- [x] Login shows error "Unable to connect to server"
- [ ] Dashboard shows error "Gagal memuat data. Pastikan backend berjalan"
- [ ] All pages show appropriate error messages
- [ ] "Coba Lagi" buttons work
- [ ] No infinite loading spinners
- [ ] No console errors about undefined data

---

## 🚀 Migration Commands

### Step 1: Start Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run start:dev
```

**Verify**: Backend running at `http://localhost:3001`

### Step 2: Test Login

```bash
# Try logging in via frontend
Email: siswa@neuroadaptive.com
Password: Demo1234!
```

**Expected**: Redirect to `/dashboard/student` with real data

### Step 3: Apply Fixes

```bash
cd frontend

# Remove mock data from components
# Follow patterns in this guide

npm run build
npm run dev
```

### Step 4: Verify Each Page

- Dashboard: Real analytics or empty state
- Journal: Real entries or empty state
- Courses: Real courses from DB
- EEG: Simulator status or "not connected"

---

## 📝 Code Review Checklist

Before merging fixes:

- [ ] No `.catch(() => mockData)` patterns remain in API calls
- [ ] All API calls have proper try-catch blocks
- [ ] Error states show helpful messages (mention backend URL)
- [ ] Empty states have clear instructions
- [ ] Loading states don't hang indefinitely
- [ ] Console logs cleaned up (no "Failed to load..." on every mount)
- [ ] Backend connection instructions in error messages

---

## 🎯 Success Criteria

**MVP Ready** when:

1. ✅ Users must login with real backend
2. ✅ All dashboards show real data or empty states (no mock fallbacks)
3. ✅ Clear error messages when backend unavailable
4. ✅ "Start Backend" instructions visible in errors
5. ✅ No hardcoded demo tokens accepted

**Current Status**: 20% Complete (AuthContext fixed)

---

## 📞 Quick Reference

### Demo Backend Credentials

```
Student:
  Email: siswa@neuroadaptive.com
  Password: Demo1234!

Teacher:
  Email: guru@neuroadaptive.com
  Password: Demo1234!

Admin:
  Email: admin@neuroadaptive.com
  Password: Demo1234!
```

### Backend Commands

```bash
# Start backend
cd backend && npm run start:dev

# Check health
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"siswa@neuroadaptive.com","password":"Demo1234!"}'
```

### Frontend Environment

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

---

**Created**: August 29, 2026  
**Last Updated**: August 29, 2026  
**Status**: AuthContext fixed, 7 components remaining

