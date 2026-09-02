#!/bin/bash
# Smoke tests for staging/production deployments

set -e

URL="${1:-http://localhost:3000}"
TIMEOUT=300
START_TIME=$(date +%s)

echo "🧪 Running smoke tests against $URL"

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local expected_status=${3:-200}
    
    echo -n "Testing $method $endpoint ... "
    
    response=$(curl -s -w "\n%{http_code}" -X $method "$URL$endpoint" -H "Accept: application/json" || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo "✅ OK ($http_code)"
        return 0
    else
        echo "❌ FAILED (expected $expected_status, got $http_code)"
        echo "Response: $body"
        return 1
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local timeout=$2
    local elapsed=0
    
    echo "⏳ Waiting for service to be ready (timeout: ${timeout}s)..."
    
    while [ $elapsed -lt $timeout ]; do
        if check_endpoint "/health" "GET" "200" 2>/dev/null; then
            echo "✅ Service is ready"
            return 0
        fi
        
        sleep 5
        elapsed=$((elapsed + 5))
        echo "Still waiting... ($elapsed/$timeout)"
    done
    
    echo "❌ Service did not become ready within $timeout seconds"
    return 1
}

# Main test execution
echo ""
echo "📋 Smoke Test Suite"
echo "===================="
echo ""

# Wait for service to be healthy
wait_for_service "$URL" $TIMEOUT || exit 1

echo ""
echo "🔍 Testing endpoints..."
echo ""

# Test API endpoints
tests_passed=0
tests_failed=0

check_endpoint "/health" "GET" "200" && ((tests_passed++)) || ((tests_failed++))
check_endpoint "/api/health" "GET" "200" && ((tests_passed++)) || ((tests_failed++))
check_endpoint "/api/users" "GET" "200" && ((tests_passed++)) || ((tests_failed++))
check_endpoint "/" "GET" "200" && ((tests_passed++)) || ((tests_failed++))

echo ""
echo "📊 Test Results"
echo "==============="
echo "✅ Passed: $tests_passed"
echo "❌ Failed: $tests_failed"
echo ""

if [ $tests_failed -eq 0 ]; then
    echo "🎉 All smoke tests passed!"
    exit 0
else
    echo "⚠️  Some smoke tests failed"
    exit 1
fi
