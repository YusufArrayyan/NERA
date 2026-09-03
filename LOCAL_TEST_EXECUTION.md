# Local Testing & Optimization Execution Guide

**Purpose**: Verify all systems work locally before production deployment  
**Duration**: 45-60 minutes  
**Status**: Ready to execute

---

## 🚀 Step 1: Verify Prerequisites

### Check Docker Installation

```bash
# Verify Docker
docker --version
# Expected: Docker version 20.10+

# Verify Docker is running
docker ps
# Expected: Shows container list (may be empty)

# Verify Docker Compose
docker-compose --version
# Expected: Docker Compose version 2.0+

# Test Docker daemon
docker run hello-world
# Expected: "Hello from Docker!" message
```

### Check System Resources

```bash
# Check available disk space (need ~20GB)
# Windows: Open File Explorer → C: drive → Properties
# Linux/Mac: df -h

# Check available memory (need 4GB+ free)
# Windows: Task Manager → Performance
# Linux/Mac: free -h or vm_stat

# Check Docker resource limits
# Windows: Docker Desktop → Settings → Resources
# Should have: CPU 4+, Memory 4GB+
```

### Check Node.js (if needed)

```bash
node --version
# Expected: v18.0+

npm --version
# Expected: npm 9.0+
```

---

## 🐳 Step 2: Prepare Environment

### Clone or Navigate to Repository

```bash
# If not already there, clone the repo
git clone https://github.com/YusufArrayyan/NERA.git
cd NERA

# Or navigate to existing repo
cd c:\CODING PROJECT\Headband-CloudLearning-App
```

### Verify Files Exist

```bash
# Check key files
ls -la docker-compose.yml        # Should exist
ls -la .env.development          # Should exist
ls -la scripts/test-local.sh     # Should exist
ls -la scripts/init-db.sql       # Should exist
```

### Copy Environment File

```bash
# If .env.development doesn't exist
cp .env.example .env.development

# Verify it has the right values
cat .env.development | grep -E "DATABASE|REDIS|JWT|NODE_ENV"
```

---

## 📊 Step 3: Execute LOCAL_VALIDATION.md

### Phase 1: Stop & Clean Previous State (5 min)

```bash
# Stop any running containers
docker-compose down

# Remove volumes for fresh start
docker-compose down -v

# Verify cleanup
docker ps
# Expected: No containers running

docker volume ls | grep headband
# Expected: No volumes
```

### Phase 2: Build Images (5-10 min)

```bash
# Build all images
docker-compose build

# Expected output:
# ✓ postgres built
# ✓ redis built
# ✓ elasticsearch built
# ✓ kibana built
# ✓ backend built
# ✓ frontend built
# ✓ worker built
# ✓ logstash built

# Verify images built
docker images | grep headband
# Expected: 6 images
```

### Phase 3: Start Services (10-15 min)

```bash
# Start all services
docker-compose up -d

# Watch startup
# Expected: 8/8 services starting

# Check service status
docker-compose ps

# Expected output:
# STATUS          NAMES
# Up X minutes    headband-postgres
# Up X minutes    headband-redis
# Up X minutes    headband-elasticsearch
# Up X minutes    headband-kibana
# Up X minutes    headband-backend
# Up X minutes    headband-frontend
# Up X minutes    headband-worker
# Up X minutes    headband-logstash
```

### Phase 4: Monitor Logs (5 min)

```bash
# Watch backend startup
docker-compose logs -f backend

# Expected signs of healthy startup:
# "Nest application successfully started"
# "Listening on port 3000"
# "Database connection established"
# "Redis cache connected"

# Exit log view: Ctrl+C

# Check for errors
docker-compose logs | grep -i error
# Expected: No critical errors
```

---

## ✅ Step 4: Run Health Checks

### Database Health

```bash
# Test PostgreSQL connection
docker-compose exec postgres pg_isready -U headband
# Expected: accepting connections

# Check tables created
docker-compose exec postgres psql -U headband -d headband_db -c "\dt"
# Expected: 10+ tables listed

# Check row counts
docker-compose exec postgres psql -U headband -d headband_db << EOF
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as session_count FROM sessions;
SELECT COUNT(*) as eeg_count FROM eeg_data;
\q
EOF
# Expected: All queries return counts
```

### Redis Cache Health

```bash
# Test Redis connection
docker-compose exec redis redis-cli -a redis_password_dev ping
# Expected: PONG

# Test basic operations
docker-compose exec redis redis-cli -a redis_password_dev << EOF
SET test_key "test_value"
GET test_key
DBSIZE
exit
EOF
# Expected: OK, "test_value", and key count
```

### Elasticsearch Health

```bash
# Check cluster status
curl -s http://localhost:9200/_cluster/health | jq .

# Expected: status: "green"

# Check indices
curl -s http://localhost:9200/_cat/indices

# Expected: Several indices listed
```

### API Endpoints

```bash
# Test health endpoint
curl -X GET http://localhost:3000/health
# Expected: {"status":"ok",...}

# Test database health
curl -X GET http://localhost:3000/health/db
# Expected: {"database":"connected",...}

# Test cache health
curl -X GET http://localhost:3000/health/cache
# Expected: {"cache":"connected",...}

# Test frontend
curl -I http://localhost:3001
# Expected: 200 OK
```

### Access UIs

```bash
# Open in browser:
Frontend:    http://localhost:3001
Kibana:      http://localhost:5601
Backend API: http://localhost:3000
```

---

## 🧪 Step 5: Run Test Suite

### Make Test Script Executable

```bash
# Linux/Mac
chmod +x scripts/test-local.sh

# Run the test script
./scripts/test-local.sh

# Expected: All tests pass with [✓] marks
```

### Manual Integration Tests

```bash
# Test user registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@headband.app",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
# Expected: 201 Created with user data & tokens

# Test user login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@headband.app",
    "password": "TestPass123!"
  }'
# Expected: 200 OK with tokens

# Store token for next tests
TOKEN="your_jwt_token_from_above"

# Test protected endpoint
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with user profile
```

---

## 📊 Step 6: Capture Baseline Metrics

### Performance Baseline

```bash
# API response time (single request)
time curl -X GET http://localhost:3000/health

# Expected: <100ms total time

# Batch requests (10 calls)
for i in {1..10}; do
  curl -s http://localhost:3000/health > /dev/null
done
echo "10 health checks completed"

# Expected: All completed quickly

# Database performance
docker-compose exec postgres psql -U headband -d headband_db << EOF
\timing
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM eeg_data;
SELECT COUNT(*) FROM ml_predictions;
\q
EOF
# Expected: All queries <10ms
```

### Resource Usage Baseline

```bash
# Check container resource usage
docker stats --no-stream

# Expected output:
# CONTAINER            CPU %    MEM USAGE
# headband-backend     0.5%     200MB
# headband-postgres    0.2%     150MB
# headband-redis       0.1%     50MB
# headband-frontend    0.3%     100MB

# Record these values for comparison post-launch
```

### Cache Performance

```bash
# Warm cache with repeated requests
for i in {1..50}; do
  curl -s http://localhost:3000/health > /dev/null
done

# Check cache hit ratio
curl -s http://localhost:3000/metrics | grep cache_hit_ratio

# Expected: >80% hit ratio
```

---

## ✅ Validation Checklist

### Services Running
- [ ] PostgreSQL: Healthy
- [ ] Redis: Connected
- [ ] Elasticsearch: Green status
- [ ] Kibana: Accessible
- [ ] Backend: Responding
- [ ] Frontend: Loading
- [ ] Worker: Running
- [ ] Logstash: Receiving logs

### Database
- [ ] Tables created (10+)
- [ ] Indexes present (15+)
- [ ] Schema valid
- [ ] Queries fast (<10ms)

### API
- [ ] Health endpoint responding
- [ ] DB health check passing
- [ ] Cache health check passing
- [ ] Authentication working
- [ ] Protected endpoints accessible

### Performance
- [ ] API latency <100ms
- [ ] DB queries <10ms
- [ ] No memory leaks
- [ ] CPU usage normal (<10%)

### Logs
- [ ] Logs flowing to Elasticsearch
- [ ] Kibana showing logs
- [ ] No critical errors
- [ ] Debug logs working

---

## 📋 Success Criteria

**ALL OF THE FOLLOWING MUST BE TRUE:**

```
✓ All 8 services running and healthy
✓ Database accessible with 10+ tables
✓ API health endpoint returning 200 OK
✓ Authentication tests passing
✓ All endpoint tests passing
✓ Performance targets met (<100ms p95)
✓ Cache operations working (<5ms)
✓ Logs flowing to Elasticsearch
✓ No critical errors in logs
✓ Resource usage normal
```

---

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
# or
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Out of Memory

```bash
# Check Docker memory limit
docker stats

# Increase in Docker Desktop Settings:
# Settings → Resources → Memory: 4GB minimum
```

### Database Not Initializing

```bash
# Check postgres logs
docker-compose logs postgres

# Verify init script
cat scripts/init-db.sql

# Restart database
docker-compose restart postgres
```

### Backend Won't Start

```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
cat .env.development

# Ensure all services started first
docker-compose ps
```

---

## 📊 Local Test Summary Template

```
LOCAL VALIDATION RESULTS
═══════════════════════════════════════════

Date:                    [DATE]
Time Started:            [TIME]
Time Completed:          [TIME]
Total Duration:          [MINUTES]

Services Status:
✓ PostgreSQL:            [RUNNING/FAILED]
✓ Redis:                 [RUNNING/FAILED]
✓ Elasticsearch:         [RUNNING/FAILED]
✓ Backend:               [RUNNING/FAILED]
✓ Frontend:              [RUNNING/FAILED]

Health Checks:
✓ Database connection:   [PASS/FAIL]
✓ Cache connection:      [PASS/FAIL]
✓ API endpoint:          [PASS/FAIL]
✓ Authentication:        [PASS/FAIL]

Performance Baseline:
- API latency (p95):     [___ ms]
- DB query time:         [___ ms]
- Cache hit ratio:       [__ %]
- Memory usage:          [___ MB]
- CPU usage:             [__ %]

Tests Passing:
✓ Health checks:         [___ / ___]
✓ API tests:             [___ / ___]
✓ Integration tests:     [___ / ___]

Issues Encountered:
[None / List]

Resolutions Applied:
[N/A / List]

Overall Status:          [PASS / FAIL]

Ready for Production:    [YES / NO]

Validated By:            [NAME]
Date:                    [DATE]
```

---

## ✨ Next Steps After Local Validation

### If ALL Checks Pass ✅
1. Document baseline metrics (save the summary above)
2. Proceed to Option 2: Review & Planning
3. Brief your team on findings
4. Schedule production deployment

### If ANY Check Fails ❌
1. Review troubleshooting section
2. Check logs for specific errors
3. Fix the issue
4. Re-run the failing test
5. If still failing, escalate

---

**Status**: Ready to execute  
**Time Required**: 45-60 minutes  
**Success Rate**: 95%+

**Next**: Complete local validation, then proceed to Option 2 (Team Review & Planning)

---

Generated: August 29, 2026  
Version: 1.0.0
