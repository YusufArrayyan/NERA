#!/bin/bash
# Verify production deployment health

set -e

URL="${1:-https://api.headband.app}"
TIMEOUT=60

echo "🔍 Verifying Production Deployment"
echo "===================================="
echo ""
echo "Target: $URL"
echo ""

# Function to check endpoint with retries
check_with_retry() {
    local endpoint=$1
    local max_retries=5
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        echo -n "  Checking $endpoint (attempt $((retry+1))/$max_retries) ... "
        
        response=$(curl -s -w "\n%{http_code}" "$URL$endpoint" 2>&1 || echo -e "\n000")
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)
        
        if [ "$http_code" -eq 200 ]; then
            echo "✅ OK"
            return 0
        fi
        
        echo "⏳ (HTTP $http_code)"
        retry=$((retry+1))
        [ $retry -lt $max_retries ] && sleep 5
    done
    
    echo "❌ Failed after $max_retries attempts"
    return 1
}

# Verification checks
echo "🔐 Health Checks:"
check_with_retry "/health" || exit 1
check_with_retry "/api/health" || exit 1

echo ""
echo "📡 API Checks:"
check_with_retry "/api/users" || exit 1
check_with_retry "/api/status" || exit 1

echo ""
echo "🌐 Frontend Checks:"
check_with_retry "/" || exit 1

echo ""
echo "✅ Checking metrics..."
metrics_endpoint="/metrics"
if curl -s "$URL$metrics_endpoint" 2>/dev/null | grep -q "up 1"; then
    echo "  ✅ Metrics available"
else
    echo "  ⚠️  Metrics endpoint not responding (non-critical)"
fi

echo ""
echo "✅ All verification checks passed!"
echo ""
echo "📊 Deployment Summary:"
echo "  URL: $URL"
echo "  Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "  Status: HEALTHY"
