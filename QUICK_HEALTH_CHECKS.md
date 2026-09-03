# Quick Health Checks - Copy & Paste

**Time**: 20 minutes  
**Status**: Run after docker-compose up completes  

---

## 🎯 Quick Validation (5 min)

```bash
# Test Backend Health
curl http://localhost:3000/health

# Test Database
curl http://localhost:3000/health/db

# Test Cache
curl http://localhost:3000/health/cache

# Test Frontend
curl -I http://localhost:3001

# Expected: All return 200 OK
```

---

## 📊 Database Checks (3 min)

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U headband -d headband_db -c "\dt"
# Expected: 10+ tables listed

# Count records
docker-compose exec postgres psql -U headband -d headband_db << EOF
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM eeg_data;
\q
EOF
```

---

## 💾 Cache Checks (2 min)

```bash
# Test Redis
docker-compose exec redis redis-cli -a redis_password_dev ping
# Expected: PONG

# Basic operations
docker-compose exec redis redis-cli -a redis_password_dev << EOF
SET test_key "test_value"
GET test_key
DBSIZE
exit
EOF
```

---

## 🔍 Elasticsearch Checks (2 min)

```bash
# Cluster status
curl -s http://localhost:9200/_cluster/health | jq .status
# Expected: "green"

# Indices
curl -s http://localhost:9200/_cat/indices
# Expected: Several indices listed
```

---

## ✅ Integration Test (5 min)

```bash
# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@headband.app",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
# Expected: 201 Created

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@headband.app",
    "password": "TestPass123!"
  }'
# Expected: 200 OK with tokens

# Store token
TOKEN="your_jwt_token_from_above"

# Access protected endpoint
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with user profile
```

---

## 📋 Success Checklist

- [ ] Backend health: 200 OK
- [ ] Database health: 200 OK
- [ ] Cache health: 200 OK
- [ ] Frontend: 200 OK
- [ ] PostgreSQL: 10+ tables
- [ ] Redis: PONG
- [ ] Elasticsearch: green
- [ ] User registration: 201
- [ ] User login: 200 OK
- [ ] Protected endpoint: 200 OK

---

## 🚀 All Passing?

✅ **YES** → Proceed to Step 4 (Document Results)  
❌ **NO** → Check logs: `docker-compose logs`

---

Generated: August 29, 2026
