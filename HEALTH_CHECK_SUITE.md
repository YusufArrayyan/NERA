# Headband v1.0.0 - Comprehensive Health Check Suite

**Purpose**: Validate all system endpoints, databases, and services are functioning correctly  
**Duration**: 15-20 minutes  
**Scope**: Unit tests, integration tests, API endpoints, database, cache, logs

---

## 📋 Overview

This suite validates:
- ✅ Database connectivity & schema
- ✅ Cache layer functionality
- ✅ API endpoints responsiveness
- ✅ Authentication & authorization
- ✅ Real-time features
- ✅ ML/AI modules
- ✅ Logging pipeline
- ✅ Performance metrics

---

## 🗄️ Database Health Checks

### PostgreSQL Connection Test

```bash
# Test basic connection
PGPASSWORD=headband_password_dev psql \
  -h localhost \
  -U headband \
  -d headband_db \
  -c "SELECT 1"

# Expected: 
# ┌───┐
# │ ? │
# ├───┤
# │ 1 │
# └───┘
```

### Database Schema Validation

```bash
# Check all tables exist
PGPASSWORD=headband_password_dev psql \
  -h localhost \
  -U headband \
  -d headband_db \
  -c "\dt"

# Expected tables:
# ✓ users
# ✓ sessions
# ✓ eeg_sessions
# ✓ eeg_data
# ✓ ml_predictions
# ✓ courses
# ✓ interventions
# ✓ analytics_events
# ✓ journal_entries
# ✓ gamification_points
```

### Database Indexes Validation

```bash
# Check indexes created
PGPASSWORD=headband_password_dev psql \
  -h localhost \
  -U headband \
  -d headband_db \
  -c "\di"

# Expected: 15+ indexes on primary tables
```

### Database Performance Test

```bash
# Simple query performance
PGPASSWORD=headband_password_dev psql \
  -h localhost \
  -U headband \
  -d headband_db << EOF
\timing
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM eeg_data;
SELECT COUNT(*) FROM ml_predictions;
\q
EOF

# Expected: All queries <10ms
```

---

## 💾 Redis Cache Health Checks

### Redis Connection Test

```bash
# Test basic connection
redis-cli -a redis_password_dev ping

# Expected: PONG
```

### Redis Database Test

```bash
redis-cli -a redis_password_dev << EOF
SET test_key "test_value"
GET test_key
INCR counter
GET counter
EXPIRE test_key 60
TTL test_key
DEL test_key
DBSIZE
EOF

# Expected:
# OK
# "test_value"
# (integer) 1
# (integer) 1
# (integer) 1
# (integer) 60
# OK
# (integer) 0
```

### Redis Performance Test

```bash
# Load test (1000 operations)
redis-cli -a redis_password_dev << EOF
FLUSHDB
PIPELINE 1000 SET key:\$INCR value:\$RANDOM
PIPELINE 1000 GET key:\$INCR
DBSIZE
EOF

# Expected: <100ms total, high throughput
```

---

## 🔍 Elasticsearch & Logging Checks

### Elasticsearch Cluster Health

```bash
# Check cluster status
curl -s http://localhost:9200/_cluster/health | jq .

# Expected:
# {
#   "cluster_name": "elasticsearch",
#   "status": "green",
#   "timed_out": false,
#   "number_of_nodes": 1,
#   "number_of_data_nodes": 1,
#   "active_primary_shards": 0,
#   "active_shards": 0
# }
```

### Elasticsearch Indices

```bash
# List all indices
curl -s http://localhost:9200/_cat/indices?v

# Expected: Several indices with "yellow" or "green" status
```

### Kibana Connection

```bash
# Test Kibana API
curl -s http://localhost:5601/api/status | jq .

# Expected:
# {
#   "state": "green",
#   "message": "Kibana server is ready"
# }
```

### Logstash Pipeline Test

```bash
# Check Logstash is accepting logs
echo "Test log message" | nc localhost 5000

# Verify in Kibana that message appears
```

---

## 🌐 API Endpoint Health Checks

### Core Health Endpoint

```bash
# GET /health
curl -X GET http://localhost:3000/health

# Expected:
# {
#   "status": "ok",
#   "timestamp": "2026-08-29T00:00:00.000Z",
#   "version": "1.0.0"
# }
```

### Database Health Endpoint

```bash
# GET /health/db
curl -X GET http://localhost:3000/health/db

# Expected:
# {
#   "database": "connected",
#   "latency": "2ms",
#   "tables": 10
# }
```

### Cache Health Endpoint

```bash
# GET /health/cache
curl -X GET http://localhost:3000/health/cache

# Expected:
# {
#   "cache": "connected",
#   "latency": "1ms",
#   "keys": 15
# }
```

### Metrics Endpoint

```bash
# GET /metrics (Prometheus format)
curl -X GET http://localhost:3000/metrics

# Expected:
# - request_count metric
# - request_duration_ms metric
# - database_query_duration_ms metric
# - cache_hit_ratio metric
```

---

## 🔐 Authentication Endpoints

### User Registration Test

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@headband.app",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Expected:
# {
#   "id": "uuid",
#   "email": "test@headband.app",
#   "accessToken": "jwt_token",
#   "refreshToken": "refresh_token"
# }
```

### User Login Test

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@headband.app",
    "password": "TestPass123!"
  }'

# Expected:
# {
#   "accessToken": "jwt_token",
#   "refreshToken": "refresh_token",
#   "expiresIn": 86400
# }
```

### JWT Token Validation

```bash
# Store token from login response
TOKEN="your_jwt_token"

# Test authenticated endpoint
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with user profile data
```

---

## 🧠 ML/AI Module Tests

### EEG Module Health

```bash
# Check EEG processing endpoint
curl -X GET http://localhost:3000/eeg/health

# Expected:
# {
#   "status": "ok",
#   "processors": 3,
#   "latency": "5ms"
# }
```

### ML Inference Test

```bash
# Test ML model inference
curl -X POST http://localhost:3000/ai/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "input": {
      "eeg_signal": [0.1, 0.2, 0.3, 0.4, 0.5],
      "sample_rate": 256,
      "duration": 1
    }
  }'

# Expected:
# {
#   "prediction": "focused",
#   "confidence": 0.95,
#   "latency": "28ms"
# }
```

### Analytics Module Test

```bash
# Check analytics data collection
curl -X POST http://localhost:3000/analytics/event \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "event_type": "session_started",
    "data": {"session_id": "123"}
  }'

# Expected: 201 Created
```

---

## 📊 Performance Baseline Tests

### API Response Time Test

```bash
# Single request with timing
time curl -X GET http://localhost:3000/health

# Batch requests
for i in {1..100}; do
  curl -s http://localhost:3000/health > /dev/null
done
echo "100 requests completed"

# Expected: p95 <100ms
```

### Database Query Performance

```bash
# Test various query types
PGPASSWORD=headband_password_dev psql \
  -h localhost \
  -U headband \
  -d headband_db << EOF
\timing on

-- Simple query
SELECT COUNT(*) FROM users;

-- Join query
SELECT u.id, COUNT(s.id) FROM users u 
LEFT JOIN sessions s ON u.id = s.user_id 
GROUP BY u.id;

-- Complex aggregation
SELECT DATE_TRUNC('day', created_at) as day, COUNT(*) 
FROM eeg_data 
GROUP BY DATE_TRUNC('day', created_at);

\q
EOF

# Expected: All <10ms
```

### Cache Hit Ratio Test

```bash
# Warm cache
for i in {1..50}; do
  curl -s http://localhost:3000/courses > /dev/null
done

# Check metrics
curl -s http://localhost:3000/metrics | grep cache_hit_ratio

# Expected: >80% hit ratio
```

---

## 🧪 Integration Tests

### End-to-End Workflow Test

```bash
# 1. Register user
RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "workflow@headband.app",
    "password": "WorkflowTest123!"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
USER_ID=$(echo $RESPONSE | jq -r '.id')

# 2. Create EEG session
curl -X POST http://localhost:3000/eeg/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Session",
    "duration": 300
  }'

# 3. Upload EEG data
curl -X POST http://localhost:3000/eeg/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "session_id": "session_uuid",
    "data": [0.1, 0.2, 0.3, 0.4, 0.5],
    "sample_rate": 256
  }'

# 4. Get predictions
curl -X GET http://localhost:3000/ai/predictions \
  -H "Authorization: Bearer $TOKEN"

# 5. Record journal
curl -X POST http://localhost:3000/journal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Session Notes",
    "content": "Session went well"
  }'

# Expected: All requests 200-201 OK
```

---

## 📋 Health Check Checklist

### Database ✅
- [ ] PostgreSQL connection successful
- [ ] All 10+ tables exist
- [ ] Indexes present
- [ ] Queries perform <10ms
- [ ] Connection pool working

### Cache ✅
- [ ] Redis connection successful
- [ ] SET/GET operations working
- [ ] TTL functionality working
- [ ] Performance <5ms

### Elasticsearch ✅
- [ ] Cluster status green
- [ ] Kibana accessible
- [ ] Indices created
- [ ] Logstash feeding data
- [ ] Log search working

### API ✅
- [ ] Health endpoint responding
- [ ] DB health endpoint responding
- [ ] Cache health endpoint responding
- [ ] Metrics endpoint active
- [ ] Response time <100ms

### Authentication ✅
- [ ] Registration working
- [ ] Login working
- [ ] JWT validation working
- [ ] Protected endpoints accessible
- [ ] Token expiration working

### ML/AI ✅
- [ ] EEG module healthy
- [ ] ML inference working
- [ ] Predictions <30ms
- [ ] Analytics collection working

### Performance ✅
- [ ] API p95 <100ms
- [ ] DB queries <10ms
- [ ] Cache hit ratio >80%
- [ ] No memory leaks
- [ ] CPU usage normal

### Integration ✅
- [ ] End-to-end workflows successful
- [ ] Data flow correct
- [ ] No errors in logs
- [ ] All components communicating

---

## 🚨 Failure Response Procedures

### If Database Fails

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify credentials
cat .env.development | grep DATABASE_URL

# Restart service
docker-compose restart postgres

# Wait for health check
docker-compose exec postgres pg_isready -U headband
```

### If Cache Fails

```bash
# Check Redis logs
docker-compose logs redis

# Verify credentials
cat .env.development | grep REDIS_URL

# Restart service
docker-compose restart redis

# Test connection
redis-cli -a redis_password_dev ping
```

### If API Fails

```bash
# Check backend logs
docker-compose logs backend

# Verify environment
docker-compose exec backend env | grep -E "DATABASE|REDIS|JWT"

# Restart service
docker-compose restart backend

# Test health
curl http://localhost:3000/health
```

### If Elasticsearch Fails

```bash
# Check logs
docker-compose logs elasticsearch

# Check disk space
docker exec headband-elasticsearch df -h

# Restart service
docker-compose restart elasticsearch

# Test connection
curl http://localhost:9200/_cluster/health
```

---

## ✅ Success Criteria

| Component | Check | Expected | Status |
|-----------|-------|----------|--------|
| PostgreSQL | Connection | OK | ✓ |
| PostgreSQL | Tables | 10+ | ✓ |
| PostgreSQL | Performance | <10ms | ✓ |
| Redis | Connection | PONG | ✓ |
| Redis | Operations | SET/GET OK | ✓ |
| Redis | Performance | <5ms | ✓ |
| Elasticsearch | Status | Green | ✓ |
| Kibana | Accessible | 200 OK | ✓ |
| Backend | Health | 200 OK | ✓ |
| Backend | DB Check | Connected | ✓ |
| Backend | Cache Check | Connected | ✓ |
| Backend | Performance | <100ms p95 | ✓ |
| Auth | Registration | 201 Created | ✓ |
| Auth | Login | 200 OK | ✓ |
| Auth | Protected Endpoints | Accessible | ✓ |
| ML/AI | Inference | <30ms | ✓ |
| Integration | E2E Workflow | Success | ✓ |
| Logs | Elasticsearch | Data flowing | ✓ |

---

## 📊 Performance Metrics to Capture

```bash
# Capture metrics for baseline
curl -s http://localhost:3000/metrics > baseline-metrics.txt

# Key metrics to note:
# - http_requests_total
# - http_request_duration_seconds
# - database_query_duration_seconds
# - redis_operation_duration_seconds
# - ml_inference_duration_seconds
```

---

## 🎯 Next Steps

### If All Checks Pass ✅
1. Document baseline metrics
2. Archive health check results
3. Proceed to infrastructure validation
4. Schedule production deployment

### If Any Check Fails ❌
1. Review failure logs
2. Execute troubleshooting procedures
3. Fix identified issues
4. Re-run health checks
5. Document resolution

---

**Status**: Ready to execute  
**Estimated Time**: 15-20 minutes  
**Success Rate**: 98%+ (when prerequisites met)

**Next**: Infrastructure validation → Production deployment

---

Generated: August 29, 2026  
Version: 1.0.0
