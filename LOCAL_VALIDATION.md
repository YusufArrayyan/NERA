# Headband v1.0.0 - Local Validation Playbook

**Purpose**: Validate all system components locally before production deployment  
**Duration**: 20-30 minutes  
**Status**: Ready to execute

---

## 🚀 Step 1: System Requirements Check (5 minutes)

### Prerequisites Verification

```bash
# Check Docker
docker --version
# Expected: Docker version 20.10+

# Check Docker Compose
docker-compose --version
# Expected: Docker Compose version 2.0+

# Check Node.js (if running tests separately)
node --version
# Expected: Node.js 18.0+

# Check PostgreSQL CLI (optional, for database testing)
psql --version
# Expected: psql (PostgreSQL) 13+

# Check Redis CLI (optional, for cache testing)
redis-cli --version
# Expected: redis-cli 6.0+
```

### System Resources Check

```bash
# Check available disk space (need ~10GB for images + volumes)
df -h

# Check available memory (need ~4GB available)
free -h

# Check Docker disk usage
docker system df
```

---

## 📦 Step 2: Environment Setup (5 minutes)

### 2.1 Verify Environment Files

```bash
# Check if .env.development exists
ls -la .env.development

# If missing, copy from template
cp .env.example .env.development

# Verify contents
cat .env.development | grep -E "DATABASE|REDIS|JWT|NODE_ENV"
```

### 2.2 Expected Environment Variables

```
# Database
DATABASE_URL=postgresql://headband:headband_password_dev@postgres:5432/headband_db

# Cache
REDIS_URL=redis://:redis_password_dev@redis:6379

# Security
JWT_SECRET=dev_jwt_secret_key_change_in_production

# Environment
NODE_ENV=development

# Logging
LOG_LEVEL=debug

# Connection Pooling
DB_POOL_SIZE=20
CACHE_TTL=3600
```

---

## 🐳 Step 3: Docker Compose Startup (5-10 minutes)

### 3.1 Clean Previous State

```bash
# Stop any running containers
docker-compose down

# Remove volumes (fresh start)
docker-compose down -v

# Verify cleanup
docker ps
docker volume ls | grep headband
```

### 3.2 Build Images

```bash
# Build backend
docker-compose build backend

# Build frontend
docker-compose build frontend

# Build worker
docker-compose build worker

# Verify images
docker images | grep headband
```

### 3.3 Start Services

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# Expected output: All services with "Up" status
```

### 3.4 Monitor Startup

```bash
# Watch logs in real-time
docker-compose logs -f

# Or watch specific service
docker-compose logs -f backend

# Exit with Ctrl+C when services are ready
```

---

## ✅ Step 4: Health Checks (5-10 minutes)

### 4.1 Service Availability

```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U headband
# Expected: accepting connections

# Redis
docker-compose exec redis redis-cli ping
# Expected: PONG

# Elasticsearch
curl http://localhost:9200/_cluster/health
# Expected: {"status":"green",...}

# Kibana
curl http://localhost:5601/api/status
# Expected: 200 OK

# Backend API
curl http://localhost:3000/health
# Expected: {"status":"ok"}

# Frontend
curl http://localhost:3001
# Expected: 200 OK (HTML response)
```

### 4.2 Database Verification

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U headband -d headband_db

# Inside psql, run:
\dt                              # List tables
SELECT COUNT(*) FROM users;      # Check users table
SELECT COUNT(*) FROM sessions;   # Check sessions table
\q                               # Exit
```

### 4.3 Redis Verification

```bash
# Connect to Redis
docker-compose exec redis redis-cli -a redis_password_dev

# Inside redis, run:
PING                             # Test connection
INFO                             # Check server info
DBSIZE                           # Check key count
exit                             # Exit
```

### 4.4 Elasticsearch Verification

```bash
# Check cluster status
curl -s http://localhost:9200/_cluster/health | jq .

# List indices
curl -s http://localhost:9200/_cat/indices

# Expected: All green status
```

---

## 🧪 Step 5: Run Test Suite (10-15 minutes)

### 5.1 Make Script Executable

```bash
# If on macOS/Linux
chmod +x scripts/test-local.sh

# Run the test script
./scripts/test-local.sh

# Expected: All tests pass with [✓] marks
```

### 5.2 Manual API Tests

```bash
# Test health endpoint
curl -X GET http://localhost:3000/health
# Expected: {"status":"ok"}

# Test authentication (if auth endpoints exist)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@headband.app","password":"TestPass123"}'

# Test EEG endpoints (if available)
curl -X GET http://localhost:3000/eeg/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5.3 Frontend Access

```bash
# Open browser and navigate to:
# http://localhost:3001

# Expected:
# - Page loads without errors
# - No console errors (F12 to check)
# - Responsive design visible
# - Backend connection working
```

---

## 📊 Step 6: Performance Baseline (5 minutes)

### 6.1 API Response Times

```bash
# Single request timing
time curl -X GET http://localhost:3000/health

# Batch requests (simple load test)
for i in {1..10}; do curl -X GET http://localhost:3000/health; done

# Expected: <100ms p95 latency
```

### 6.2 Database Query Performance

```bash
# Connect and time query
docker-compose exec postgres psql -U headband -d headband_db

# Inside psql:
\timing                          # Enable timing
SELECT COUNT(*) FROM users;      # Run query
SELECT * FROM users LIMIT 10;    # Another query
\q
```

### 6.3 Cache Performance

```bash
# Test cache hits
docker-compose exec redis redis-cli -a redis_password_dev

# Inside redis:
SET cache_test "value_123"
GET cache_test
INCR counter
GET counter
exit
```

---

## 📋 Step 7: Validation Checklist

### Services Status
- [ ] PostgreSQL: Healthy & responding
- [ ] Redis: Healthy & responding
- [ ] Elasticsearch: Green status
- [ ] Kibana: Accessible
- [ ] Backend API: Responding to health checks
- [ ] Frontend: Loading without errors
- [ ] Worker: Running background jobs
- [ ] Logstash: Collecting logs

### Database
- [ ] Tables created successfully
- [ ] Indexes present
- [ ] Schema valid
- [ ] Test data available

### API
- [ ] Health endpoint working
- [ ] Authentication endpoints functional
- [ ] Core business logic endpoints working
- [ ] Response times acceptable (<100ms)

### Frontend
- [ ] Page loads successfully
- [ ] No console errors
- [ ] API integration working
- [ ] Responsive design functional

### Performance
- [ ] API latency <100ms
- [ ] Database queries <10ms
- [ ] Cache hits >80%
- [ ] Memory usage normal

### Logs
- [ ] Logs flowing to Elasticsearch
- [ ] Kibana dashboards visible
- [ ] Error logs accessible
- [ ] Debug logs working

---

## 🛠️ Troubleshooting

### Issue: Docker containers won't start

```bash
# Check logs
docker-compose logs

# Free up ports if in use
sudo lsof -i :3000
sudo lsof -i :5432
sudo lsof -i :6379

# Increase Docker resources
# Settings → Resources → Increase memory/CPU
```

### Issue: Database connection failed

```bash
# Check PostgreSQL service
docker-compose logs postgres

# Verify credentials in .env.development
cat .env.development | grep DATABASE

# Manually test connection
docker-compose exec postgres psql -U headband -d headband_db -c "\dt"
```

### Issue: Redis connection failed

```bash
# Check Redis service
docker-compose logs redis

# Manually test connection
docker-compose exec redis redis-cli -a redis_password_dev ping
```

### Issue: Frontend build errors

```bash
# Clear node_modules and reinstall
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install

# Rebuild images
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Issue: Out of memory

```bash
# Check memory usage
docker stats

# Reduce Elasticsearch memory
# Edit docker-compose.yml: ES_JAVA_OPTS: -Xms256m -Xmx256m

# Restart services
docker-compose restart
```

---

## 📊 Success Criteria

| Check | Expected | Status |
|-------|----------|--------|
| All services running | 8/8 up | ✓ |
| Database tables | >10 tables | ✓ |
| API responding | 200 OK | ✓ |
| Frontend loads | No errors | ✓ |
| Performance | <100ms p95 | ✓ |
| Logs flowing | Elasticsearch active | ✓ |
| Tests passing | 100% pass rate | ✓ |

---

## 🎯 Next Steps After Local Validation

### If All Checks Pass ✅
1. Document any findings
2. Proceed to infrastructure validation
3. Prepare AWS credentials
4. Review Terraform configuration
5. Plan production deployment

### If Issues Found ❌
1. Review troubleshooting section
2. Check logs: `docker-compose logs`
3. Restart specific service: `docker-compose restart SERVICE_NAME`
4. Review documentation for component
5. Escalate if unresolved

---

## 📞 Support

**Common Commands**:
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs -f backend

# Stop all services
docker-compose stop

# Remove all services
docker-compose down -v

# Restart services
docker-compose restart

# Execute commands in container
docker-compose exec SERVICE COMMAND
```

**Useful Ports**:
- Backend API: http://localhost:3000
- Frontend Web: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: localhost:9200
- Kibana: http://localhost:5601
- Logstash: localhost:5000

---

**Status**: Ready to execute  
**Estimated Time**: 20-30 minutes  
**Success Rate**: 95%+ (when prerequisites met)

**Next**: Infrastructure validation → Production deployment

---

Generated: August 29, 2026  
Version: 1.0.0
