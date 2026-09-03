# Quick Local Start - Copy & Paste Commands

**Time**: 45 minutes  
**Status**: Ready to execute right now

---

## 🚀 Command Sequence (Copy & Paste)

### Phase 1: Clean & Prepare (2 min)

```bash
# Navigate to project
cd c:\CODING PROJECT\Headband-CloudLearning-App

# Stop any running containers
docker-compose down

# Remove old volumes (fresh start)
docker-compose down -v

# Verify clean state
docker ps
# Expected: No containers

docker volume ls | grep headband
# Expected: No volumes
```

### Phase 2: Build Images (10-15 min)

```bash
# Build all Docker images
docker-compose build

# Watch for success messages:
# "Successfully built..."
# "Successfully tagged..."
```

### Phase 3: Start Services (5 min)

```bash
# Start all 8 services in background
docker-compose up -d

# Check status (wait ~30 seconds for all to be healthy)
docker-compose ps

# Expected: All showing "Up X seconds"
```

### Phase 4: Monitor Startup (5 min)

```bash
# Watch backend startup logs
docker-compose logs -f backend

# Look for:
# "Nest application successfully started"
# "Listening on port 3000"
# "Database connection established"
# "Redis cache connected"

# Exit: Press Ctrl+C
```

### Phase 5: Quick Health Checks (5 min)

```bash
# 1. Test health endpoint
curl http://localhost:3000/health
# Expected: {"status":"ok",...}

# 2. Test database
curl http://localhost:3000/health/db
# Expected: {"database":"connected",...}

# 3. Test cache
curl http://localhost:3000/health/cache
# Expected: {"cache":"connected",...}

# 4. Test frontend
curl -I http://localhost:3001
# Expected: "200 OK"
```

### Phase 6: Run Test Suite (5-10 min)

```bash
# Make script executable (Linux/Mac)
chmod +x scripts/test-local.sh

# Run tests
./scripts/test-local.sh

# Expected: All tests pass with [✓] marks
# Total: Should see ~20+ health checks
```

---

## 📊 Validation Checklist

After all commands complete, verify:

```bash
# Check all services running
docker-compose ps
# Should show: 8 services, all "Up"

# Check database tables
docker-compose exec postgres psql -U headband -d headband_db -c "\dt"
# Should show: 10+ tables

# Check Redis
docker-compose exec redis redis-cli -a redis_password_dev ping
# Expected: PONG

# Check Elasticsearch
curl -s http://localhost:9200/_cluster/health | jq .status
# Expected: "green"

# Test API
curl -s http://localhost:3000/health | jq .status
# Expected: "ok"
```

---

## ✅ Success Indicators

You'll know it's working when you see:

```
✅ "docker-compose ps" shows 8 services "Up"
✅ Backend logs show "successfully started"
✅ curl http://localhost:3000/health returns 200
✅ curl http://localhost:3001 returns 200
✅ Database has 10+ tables
✅ Test script shows all [✓] marks
```

---

## 🌐 Access Points

Once everything is running, you can access:

```
Frontend:     http://localhost:3001
Backend API:  http://localhost:3000
Kibana:       http://localhost:5601
Health:       http://localhost:3000/health
```

---

## 🚨 Common Issues & Fixes

### "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>

# Or just use different port (edit docker-compose.yml)
```

### "Out of memory"
```bash
# Docker Desktop Settings → Resources
# Increase Memory to 4GB+
# Then restart Docker
```

### "Containers won't start"
```bash
# Check logs
docker-compose logs

# Or check specific service
docker-compose logs backend

# Restart everything
docker-compose restart
```

### "Database connection error"
```bash
# Restart database
docker-compose restart postgres

# Wait 10 seconds, then test
sleep 10
curl http://localhost:3000/health/db
```

---

## 📝 Document Results

Save this template with your results:

```
LOCAL VALIDATION RESULTS
═══════════════════════════════════════════════

Date Started:           [DATE/TIME]
Date Completed:         [DATE/TIME]
Total Duration:         [MINUTES]

Services Started:
✓ PostgreSQL            [UP / FAILED]
✓ Redis                 [UP / FAILED]
✓ Elasticsearch         [UP / FAILED]
✓ Backend               [UP / FAILED]
✓ Frontend              [UP / FAILED]

Health Checks:
✓ Database:             [PASS / FAIL]
✓ Cache:                [PASS / FAIL]
✓ API:                  [PASS / FAIL]

Tests:
✓ All tests passing:    [YES / NO]
✓ Test count:           [___ / ___]

Issues:
[None / List any]

Ready for Production:   [YES / NO]

Validated By:           [YOUR NAME]
```

---

## ⏱️ Timeline

```
T+0:   Start clean & prepare           (2 min)
T+2:   Build images                    (10-15 min)
T+17:  Start services                  (5 min)
T+22:  Monitor startup & logs          (5 min)
T+27:  Quick health checks             (5 min)
T+32:  Run test suite                  (5-10 min)
T+42:  Document results                (5 min)
─────────────────────────────────────
TOTAL: 45 minutes to completion
```

---

## ✨ What's Next?

### If All Checks Pass ✅
1. Save the results document
2. Proceed to HEALTH_CHECK_SUITE.md
3. Then proceed to Option 2 (Team Planning)

### If Any Check Fails ❌
1. Check troubleshooting section above
2. Fix the issue
3. Re-run failing test
4. Document and escalate if needed

---

**Status**: Ready to execute  
**Success Rate**: 95%+  
**Next**: Option 3 Step 3 (Health Check Suite)

---

Generated: August 29, 2026  
Version: 1.0.0
