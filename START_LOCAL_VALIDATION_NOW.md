# 🚀 START LOCAL VALIDATION NOW

**Status**: All code is ready. You can begin testing immediately.

---

## ✅ Prerequisites (Verify You Have These)

Before starting, ensure installed:

```
✓ Docker Desktop (Windows)      https://www.docker.com/products/docker-desktop
✓ Docker Compose (included)     Should auto-install with Docker Desktop
✓ Node.js 18+                   https://nodejs.org/
✓ Git                           https://git-scm.com/
✓ Postman or curl              For API testing
✓ Browser (Chrome/Firefox)      For dashboard testing
```

**Check installation**:
```powershell
docker --version
docker-compose --version
node --version
git --version
```

If all show versions, you're ready ✅

---

## 🎯 Quick Validation (15 minutes)

### STEP 1: Start Services (2 min)

```powershell
cd "c:\CODING PROJECT\Headband-CloudLearning-App"

# Clean previous state
docker-compose down -v

# Build and start all services
docker-compose up -d
```

**Wait 30 seconds** for services to initialize.

**Verify services started**:
```powershell
docker-compose ps
```

Should show all containers with status "Up":
```
NAME          STATUS
postgres      Up
redis         Up
elasticsearch Up
kibana        Up
backend       Up
frontend      Up
```

If any show "Exit" or "Exited", check logs:
```powershell
docker-compose logs backend
```

---

### STEP 2: Test Dashboard (3 min)

1. **Open browser**:
```
http://localhost:3001/dashboard/student
```

2. **Login** (if prompted):
   - Email: `siswa@neuroadaptive.com`
   - Password: `Demo1234!`

3. **Start a learning session**:
   - Click "Mulai Sesi Belajar" (Start Learning Session)
   - Watch for focus gauge to update (0-100 scale)

4. **Verify** (you should see):
   - ✅ Focus gauge animating
   - ✅ Recommendations appearing below
   - ✅ Learning content cards with badges
   - ✅ Real-time updates every 30 seconds

**Success indicator**: Focus score appears and updates smoothly

---

### STEP 3: Test Recommendations API (3 min)

```powershell
# Get JWT token first (using demo credentials)
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"siswa@neuroadaptive.com","password":"Demo1234!"}'

$token = ($loginResponse.Content | ConvertFrom-Json).access_token

# Test adaptive recommendations
Invoke-WebRequest -Uri "http://localhost:3000/learning/recommendations/adaptive" `
  -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

**Expected response**:
```json
[
  {
    "score": 87.5,
    "title": "Calculus: Derivatives",
    "reason": "Topik penting...",
    "eegMatch": 92,
    "learningMatch": 85,
    "difficultyMatch": 75
  }
]
```

**Success indicator**: You get scored recommendations with reasons

---

### STEP 4: Test Interventions (3 min)

```powershell
# Check intervention stats
Invoke-WebRequest -Uri "http://localhost:3000/interventions/stats" `
  -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

**Expected response**:
```json
{
  "totalInterventions": 3,
  "autoInterventions": 2,
  "pendingCount": 3,
  "byType": {
    "AUTO_SUPPORT": 1,
    "AUTO_BREAK": 1
  }
}
```

**Success indicator**: Stats show interventions were created

---

### STEP 5: Test Email (2 min)

```powershell
# Send test email
Invoke-WebRequest -Uri "http://localhost:3000/notifications/test-email" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"}
```

**If SMTP configured**, you'll get:
```json
{"sent": true, "email": "siswa@neuroadaptive.com"}
```

**If SMTP not configured** (normal), check logs:
```powershell
docker-compose logs backend | Select-String "Email service not configured"
```

This is fine - the system gracefully handles missing SMTP.

**Success indicator**: No errors, system handles gracefully

---

## 📊 Validation Checklist

After completing steps 1-5, verify all checkboxes:

```
LOCAL VALIDATION CHECKLIST
================================

☐ Step 1: All Docker services started successfully
☐ Step 2: Dashboard loads and shows focus gauge
☐ Step 2: Recommendations appear on dashboard
☐ Step 2: Content cards display with type/difficulty
☐ Step 3: API returns scored recommendations
☐ Step 3: Recommendations have reasons/explanations
☐ Step 4: Interventions stats show in database
☐ Step 4: Stats include AUTO_SUPPORT/AUTO_BREAK
☐ Step 5: Email endpoint responds (success or graceful)
☐ All: No critical errors in logs

If all ☐ checked: VALIDATION PASSED ✅
```

---

## 🔧 If Something Fails

### Dashboard won't load
```powershell
# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend
```

### Recommendations empty
```powershell
# Seed database with content
docker-compose exec backend npm run db:seed

# Restart backend
docker-compose restart backend
```

### API returns 401 (unauthorized)
```powershell
# Get fresh token
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"siswa@neuroadaptive.com","password":"Demo1234!"}'

$token = ($loginResponse.Content | ConvertFrom-Json).access_token
echo $token  # Copy this token for next request
```

### Services won't start
```powershell
# Check Docker is running
docker ps

# If not, start Docker Desktop manually

# Then retry:
docker-compose down
docker-compose up -d
```

---

## ✅ After Validation Passes

### If LOCAL validation succeeds:

**Next: INFRASTRUCTURE validation** (45 min)
```
Read: INFRASTRUCTURE_VALIDATION.md
Task: Set up AWS credentials and test Terraform
```

**Then: PRODUCTION deployment** (90 min)
```
Read: PRODUCTION_DEPLOYMENT.md
Task: Deploy to AWS EKS cluster
```

**Finally: GO LIVE** (30 min)
```
Read: GO_LIVE_CHECKLIST.md
Task: Final verification before production
```

---

## 📞 Quick Reference

| Component | URL | Login |
|-----------|-----|-------|
| Dashboard | http://localhost:3001 | siswa@neuroadaptive.com / Demo1234! |
| Backend API | http://localhost:3000 | Same (gets JWT token) |
| Kibana Logs | http://localhost:5601 | No auth |
| Postgres | localhost:5432 | user: headband / pass: headband_password_dev |
| Redis | localhost:6379 | No auth |

---

## 🎯 What Success Looks Like

✅ **Dashboard**: Shows real EEG data updating live  
✅ **Recommendations**: Scored and ranked intelligently  
✅ **Interventions**: Auto-triggered based on EEG state  
✅ **Emails**: Sending (or gracefully skipped if SMTP not set)  
✅ **Logs**: No critical errors  

**= PRODUCTION READY FOR DEPLOYMENT**

---

## ⏱️ Time Estimate

| Task | Time | Status |
|------|------|--------|
| Start services | 2 min | ⏳ |
| Test dashboard | 3 min | ⏳ |
| Test API | 3 min | ⏳ |
| Test interventions | 2 min | ⏳ |
| Test email | 2 min | ⏳ |
| **TOTAL** | **15 min** | ⏳ |

---

**Status**: READY TO BEGIN LOCAL VALIDATION  
**Next Action**: Run STEP 1 above  
**Support**: Check logs if anything fails  

🚀 **You are cleared to proceed with local validation.**

---

**Generated**: August 29, 2026  
**Version**: 1.0.0  
**Session Status**: VALIDATION HANDOFF COMPLETE
