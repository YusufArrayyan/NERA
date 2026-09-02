#!/bin/bash

###############################################################################
# Local Development Health Check & Smoke Tests
# Tests all services in docker-compose environment
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

###############################################################################
# Helper Functions
###############################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
  ((PASSED++))
}

log_error() {
  echo -e "${RED}[✗]${NC} $1"
  ((FAILED++))
}

log_header() {
  echo ""
  echo -e "${BLUE}=== $1 ===${NC}"
  echo ""
}

wait_for_service() {
  local service=$1
  local host=$2
  local port=$3
  local timeout=60
  local elapsed=0

  echo "Waiting for $service ($host:$port)..."
  
  while ! nc -z $host $port 2>/dev/null; do
    if [ $elapsed -ge $timeout ]; then
      log_error "$service failed to start within ${timeout}s"
      return 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  
  log_success "$service is reachable"
  return 0
}

###############################################################################
# Service Health Checks
###############################################################################

check_postgres() {
  log_header "PostgreSQL Health Check"
  
  if wait_for_service "PostgreSQL" "localhost" "5432"; then
    if PGPASSWORD=headband_password_dev psql -h localhost -U headband -d headband_db -c "SELECT 1" > /dev/null 2>&1; then
      log_success "PostgreSQL connection successful"
      
      # Check tables exist
      TABLES=$(PGPASSWORD=headband_password_dev psql -h localhost -U headband -d headband_db -c "\dt" | wc -l)
      if [ $TABLES -gt 5 ]; then
        log_success "Database tables created ($TABLES tables found)"
      else
        log_error "Database tables not initialized"
      fi
    else
      log_error "PostgreSQL connection failed"
    fi
  fi
}

check_redis() {
  log_header "Redis Health Check"
  
  if wait_for_service "Redis" "localhost" "6379"; then
    if redis-cli -a redis_password_dev ping > /dev/null 2>&1; then
      log_success "Redis connection successful"
      
      # Check Redis is working
      redis-cli -a redis_password_dev SET test_key "test_value" > /dev/null 2>&1
      VALUE=$(redis-cli -a redis_password_dev GET test_key)
      if [ "$VALUE" == "test_value" ]; then
        log_success "Redis SET/GET working"
        redis-cli -a redis_password_dev DEL test_key > /dev/null 2>&1
      else
        log_error "Redis SET/GET failed"
      fi
    else
      log_error "Redis connection failed"
    fi
  fi
}

check_elasticsearch() {
  log_header "Elasticsearch Health Check"
  
  if wait_for_service "Elasticsearch" "localhost" "9200"; then
    HEALTH=$(curl -s http://localhost:9200/_cluster/health | jq '.status' 2>/dev/null || echo "error")
    
    if [ "$HEALTH" == '"green"' ] || [ "$HEALTH" == '"yellow"' ]; then
      log_success "Elasticsearch cluster is healthy"
      
      # Check if we can write data
      curl -s -X POST http://localhost:9200/test-index/_doc \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}' > /dev/null 2>&1
      
      if curl -s http://localhost:9200/test-index/_count | grep -q '"count"'; then
        log_success "Elasticsearch indexing working"
      else
        log_error "Elasticsearch indexing failed"
      fi
    else
      log_error "Elasticsearch cluster unhealthy (status: $HEALTH)"
    fi
  fi
}

check_kibana() {
  log_header "Kibana Health Check"
  
  if wait_for_service "Kibana" "localhost" "5601"; then
    STATUS=$(curl -s http://localhost:5601/api/status 2>/dev/null | jq '.state' || echo "error")
    
    if [ "$STATUS" == '"green"' ] || [ "$STATUS" == '"yellow"' ]; then
      log_success "Kibana is healthy"
    else
      log_error "Kibana unhealthy (state: $STATUS)"
    fi
  fi
}

check_backend() {
  log_header "Backend API Health Check"
  
  if wait_for_service "Backend" "localhost" "3000"; then
    # Health check
    HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null | jq '.status' || echo "error")
    
    if [ "$HEALTH" == '"healthy"' ]; then
      log_success "Backend health check passed"
    else
      log_error "Backend health check failed"
    fi
    
    # Readiness check
    READY=$(curl -s http://localhost:3000/ready 2>/dev/null | jq '.ready' || echo "error")
    
    if [ "$READY" == "true" ]; then
      log_success "Backend readiness check passed"
    else
      log_error "Backend readiness check failed"
    fi
    
    # Swagger docs
    if curl -s http://localhost:3000/api > /dev/null 2>&1; then
      log_success "Backend Swagger docs accessible"
    else
      log_warning "Backend Swagger docs not accessible"
    fi
  fi
}

check_frontend() {
  log_header "Frontend Web App Health Check"
  
  if wait_for_service "Frontend" "localhost" "3001"; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ 2>/dev/null)
    
    if [ "$STATUS" == "200" ] || [ "$STATUS" == "307" ]; then
      log_success "Frontend is serving requests (HTTP $STATUS)"
    else
      log_error "Frontend returned HTTP $STATUS"
    fi
  fi
}

###############################################################################
# API Smoke Tests
###############################################################################

test_auth_endpoints() {
  log_header "API: Authentication Endpoints"
  
  # Test health endpoint
  RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/health)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  
  if [ "$HTTP_CODE" == "200" ]; then
    log_success "GET /health (HTTP 200)"
  else
    log_error "GET /health (HTTP $HTTP_CODE)"
  fi
  
  # Test ready endpoint
  RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/ready)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  
  if [ "$HTTP_CODE" == "200" ]; then
    log_success "GET /ready (HTTP 200)"
  else
    log_error "GET /ready (HTTP $HTTP_CODE)"
  fi
}

test_user_endpoints() {
  log_header "API: User Endpoints"
  
  # Test get users (should require auth)
  RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/users)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  
  # Should be 401 Unauthorized without token
  if [ "$HTTP_CODE" == "401" ]; then
    log_success "GET /api/users requires authentication (HTTP 401)"
  else
    log_warning "GET /api/users returned HTTP $HTTP_CODE (expected 401)"
  fi
}

test_database_connectivity() {
  log_header "API: Database Connectivity"
  
  # Check if database endpoint is working
  RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/health/db)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  
  if [ "$HTTP_CODE" == "200" ]; then
    log_success "Backend → Database connection working"
  else
    log_error "Backend → Database connection failed (HTTP $HTTP_CODE)"
  fi
}

test_cache_connectivity() {
  log_header "API: Cache Connectivity"
  
  # Check if cache endpoint is working
  RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/health/cache)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  
  if [ "$HTTP_CODE" == "200" ]; then
    log_success "Backend → Cache connection working"
  else
    log_error "Backend → Cache connection failed (HTTP $HTTP_CODE)"
  fi
}

###############################################################################
# Integration Tests
###############################################################################

test_end_to_end() {
  log_header "End-to-End Integration Test"
  
  # Test frontend → backend connectivity
  BACKEND_URL="http://localhost:3000"
  FRONTEND_RESPONSE=$(curl -s -X POST http://localhost:3001/api/health \
    -H "Content-Type: application/json" 2>/dev/null || echo "failed")
  
  if [ "$FRONTEND_RESPONSE" != "failed" ]; then
    log_success "Frontend → Backend communication working"
  else
    log_warning "Frontend → Backend communication may have issues"
  fi
}

###############################################################################
# Performance Tests
###############################################################################

test_response_times() {
  log_header "Response Time Tests"
  
  # Test backend latency
  START=$(date +%s%N | cut -b1-13)
  curl -s http://localhost:3000/health > /dev/null
  END=$(date +%s%N | cut -b1-13)
  LATENCY=$((END - START))
  
  if [ $LATENCY -lt 100 ]; then
    log_success "Backend latency: ${LATENCY}ms (excellent)"
  elif [ $LATENCY -lt 500 ]; then
    log_success "Backend latency: ${LATENCY}ms (good)"
  else
    log_warning "Backend latency: ${LATENCY}ms (slow)"
  fi
  
  # Test Redis latency
  START=$(date +%s%N | cut -b1-13)
  redis-cli -a redis_password_dev PING > /dev/null 2>&1
  END=$(date +%s%N | cut -b1-13)
  LATENCY=$((END - START))
  
  if [ $LATENCY -lt 10 ]; then
    log_success "Redis latency: ${LATENCY}ms (excellent)"
  else
    log_warning "Redis latency: ${LATENCY}ms"
  fi
}

###############################################################################
# Main Test Flow
###############################################################################

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║   Headband Local Development - Health & Validation Tests       ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  
  # Check if services are running
  if ! docker ps | grep -q headband-postgres; then
    echo -e "${RED}Error: Docker containers not running${NC}"
    echo "Run: docker-compose up -d"
    exit 1
  fi
  
  # Check if required tools are available
  for tool in curl jq nc redis-cli psql; do
    if ! command -v $tool &> /dev/null; then
      log_warning "Tool not found: $tool (some tests may be skipped)"
    fi
  done
  
  # Run service checks
  check_postgres
  check_redis
  check_elasticsearch
  check_kibana
  check_backend
  check_frontend
  
  # Run API tests
  test_auth_endpoints
  test_user_endpoints
  test_database_connectivity
  test_cache_connectivity
  
  # Run integration tests
  test_end_to_end
  
  # Run performance tests
  test_response_times
  
  # Summary
  log_header "Test Summary"
  
  echo -e "  ${GREEN}Passed: $PASSED${NC}"
  echo -e "  ${RED}Failed: $FAILED${NC}"
  echo ""
  
  if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Development environment is ready.${NC}"
    return 0
  else
    echo -e "${RED}✗ $FAILED test(s) failed. Check the errors above.${NC}"
    return 1
  fi
}

# Run main
main "$@"
