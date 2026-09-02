# Performance Optimization Guide

## Overview
This document describes the performance optimization strategies implemented in the Headband infrastructure, targeting <30ms ML inference, <5ms cache ops, <10ms DB ops, and <100ms API response (p95).

---

## Performance Targets & Status

| Component | Target | Implementation | Status |
|-----------|--------|-----------------|--------|
| ML Inference | <30ms | ONNX Runtime + GPU (if available) | ✅ Phase 3 |
| Cache Operations | <5ms | ElastiCache Redis cluster mode | ✅ Deployed |
| Database Operations | <10ms | RDS optimized parameters + read replicas | ✅ Deployed |
| API Response (p95) | <100ms | ALB + CloudFront CDN | ✅ Deployed |
| Page Load Time | <2s | CloudFront + gzip/brotli compression | ✅ Deployed |
| System Availability | 99.95% | Multi-AZ + auto-scaling | ✅ Deployed |
| Concurrent Users | 10k+ | EKS auto-scaling (3-10 nodes) | ✅ Ready |

---

## CDN & Caching Strategy

### CloudFront Distribution Configuration

#### Cache Behaviors

| Path Pattern | TTL | Methods | Compression | Use Case |
|--------------|-----|---------|-------------|----------|
| `/api/*` | 0s (no cache) | All (GET-DELETE) | gzip/brotli | Dynamic API responses |
| `/static/*` | 1 year (31536000s) | GET, HEAD | gzip/brotli | Static assets (CSS, JS, images) |
| `/` (default) | 1 hour (3600s) | GET, HEAD, OPTIONS | gzip/brotli | HTML pages + SPA |

### Cache Headers

#### Static Assets (`/static/*`)
```
Cache-Control: max-age=31536000, public, immutable
```
- Immutable assets get 1-year cache
- Example: `/static/app-abcd1234.js`

#### HTML & Dynamic Content (`/`)
```
Cache-Control: max-age=3600, public
```
- 1 hour cache for HTML pages
- Allows revalidation after 1 hour

#### API Responses (`/api/*`)
```
Cache-Control: no-cache, max-age=0
```
- No CloudFront caching
- Backend determines caching via `Cache-Control` headers

### Compression Strategy

#### Gzip Compression
- Default: 80% of requests benefit from gzip
- Compresses: HTML, CSS, JS, JSON, XML
- Reduction: ~70% for text content

#### Brotli Compression
- Modern browsers support (>95% coverage)
- Better compression than gzip: ~20% additional reduction
- Compute cost: negligible for CDN

#### Incompressible Content
- Images (JPEG, PNG, WebP already compressed)
- Videos (MP4, WebM already compressed)
- PDFs (usually pre-compressed)

---

## Database Optimization

### RDS Performance Tuning

#### Parameter Group Settings (`rds.tf`)

```hcl
# Memory allocation
shared_buffers = 262144 (2GB for t3.medium)
effective_cache_size = 786432 (6GB)

# Query optimization
work_mem = 16384 (16MB per operation)
maintenance_work_mem = 65536 (64MB)

# Connection pooling
max_connections = 200
```

#### Performance Insights
- **Enabled**: For production environments
- **Metrics**: Database load, wait events, SQL command latency
- **Retention**: 7 days
- **Dashboard**: AWS Console → RDS → Performance Insights

#### Query Optimization (Backend)
```sql
-- Index for common queries
CREATE INDEX idx_user_id_created_at ON user_sessions(user_id, created_at DESC);
CREATE INDEX idx_session_active ON user_sessions(active) WHERE active = true;
```

#### Read Replicas
- **Deployment**: Production only (`var.environment == "production"`)
- **Purpose**: Offload reporting/analytics queries
- **Instance Class**: t3.small (smaller than primary)
- **Use Case**: Heavy SELECT queries from analytics service

### Connection Pooling Strategy

#### Backend Application
```typescript
// PgBouncer configuration (recommended)
pool_mode = transaction
max_client_conn = 100
default_pool_size = 25
```

#### RDS Multi-AZ Failover
- **Automatic Failover**: Enabled for production
- **Failover Time**: ~1-2 minutes
- **Connection Retry**: Application handles with exponential backoff

---

## Redis Caching Strategy

### Multi-Tier Caching

#### L1: Application Memory Cache
- **Purpose**: Hot data in-memory cache
- **TTL**: 5-10 minutes
- **Size**: Configurable per service
- **Implementation**: Node.js built-in `Map` with TTL

#### L2: Redis Cache
- **Purpose**: Distributed cache across replicas
- **TTL**: 30 minutes (user sessions), 1 hour (static data)
- **Cluster Mode**: Enabled for production (16,384 slots)
- **Replication**: 3 nodes (production), 2 nodes (staging)

#### L3: Database
- **Purpose**: Source of truth
- **TTL**: N/A (permanent)

### Cache Invalidation Strategy

```typescript
// Tag-based invalidation
cache.set('user:123', userData, { tags: ['user', 'profile'] })
cache.invalidateByTag('user') // Invalidates all user-related caches

// Event-driven invalidation
user.on('update', () => cache.invalidate('user:' + user.id))

// TTL-based invalidation (automatic)
cache.set('session:abc', sessionData, { ttl: 1800 }) // 30 minutes
```

### Redis Configuration

#### Parameter Group Settings (`elasticache.tf`)

```hcl
# Memory management
maxmemory-policy = allkeys-lru  # Evict least recently used keys

# Monitoring
slowlog-log-slower-than = 10000  # 10ms threshold
slowlog-max-len = 128

# Connection
tcp-keepalive = 300  # 5 minutes
```

#### Persistence
- **RDB Snapshots**: 5 snapshots retained (production)
- **Snapshot Window**: 03:00-05:00 UTC
- **AOF Persistence**: Disabled (trade-off: speed over durability)

#### High Availability
- **Multi-AZ**: Enabled for production
- **Automatic Failover**: Replica promotion on primary failure
- **Failover Time**: <30 seconds
- **Auth Token**: 32-character random, rotated via strategy

---

## Application Layer Optimization

### API Response Time Targets

#### Endpoint Categories

| Category | Target p95 | Implementation |
|----------|-----------|-----------------|
| Health Check | <5ms | In-memory check |
| Cache Hit | <10ms | Redis L2 + network latency |
| DB Query | <50ms | Indexed queries + connection pool |
| ML Inference | <100ms | Optimized ONNX model |
| Composite API | <100ms | Parallel requests + caching |

### Request Pipeline

```
Client Request
    ↓
CloudFront CDN (check cache)
    ↓
ALB (HTTPS termination + routing)
    ↓
Backend Pod (Kubernetes)
    ↓
Redis Cache (check cache)
    ↓
PostgreSQL (query if needed)
    ↓
Response (back through layers with cache headers)
```

### Caching Headers Strategy

#### Backend Response Headers

```typescript
// Static content
res.set('Cache-Control', 'public, max-age=31536000, immutable');
res.set('ETag', generateHash(content));

// Dynamic content
res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
res.set('ETag', generateHash(content));

// API responses
res.set('Cache-Control', 'private, no-cache');
res.set('Vary', 'Authorization');
```

#### CloudFront Cache Keys
- **Host**: Separate cache per domain
- **Query String**: Included in cache key for `/api/*`
- **Headers**: Authorization header NOT cached
- **Cookies**: Included in cache key (session tracking)

---

## Frontend Asset Optimization

### Build Output

#### Next.js Build Configuration
```javascript
// next.config.js
export const config = {
  compress: true,           // Enable gzip
  swcMinify: true,         // Minify with SWC
  productionBrowserSourceMaps: false,
  generateEtags: true,
}
```

#### Asset Splitting
- **Main Bundle**: ~150KB (gzipped)
- **Vendor Bundle**: ~300KB (gzipped)
- **Code Splitting**: Route-based chunks (~50KB each)

#### Image Optimization
```typescript
// Use Next.js Image component
<Image 
  src="/image.jpg" 
  alt="description"
  width={1200}
  height={600}
  priority={false}
  loading="lazy"
/>
```

#### WebP Format
- CloudFront automatically serves WebP to supporting browsers
- PNG/JPEG fallback for older browsers
- Reduction: ~25% smaller than JPEG

---

## Monitoring Performance Metrics

### CloudWatch Metrics

#### ALB Metrics
- **TargetResponseTime**: p50, p95, p99
- **RequestCount**: Requests per minute
- **TargetConnectionTime**: Time to establish connection
- **ProcessedBytes**: Data processed

#### Query to Monitor API Latency
```
cloudwatch:GetMetricStatistics --metric-name TargetResponseTime \
  --namespace AWS/ApplicationELB \
  --dimensions Name=LoadBalancer,Value=<ALB_ARN_SUFFIX> \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 60 \
  --statistics p95
```

### Application Metrics

#### Backend Instrumentation
```typescript
// Express middleware for latency tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});
```

#### Prometheus Metrics (optional)
```typescript
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});
```

---

## Load Testing

### Performance Targets

#### Concurrent User Capacity
- **Target**: 10,000+ concurrent users
- **Peak Throughput**: 100,000 requests/minute
- **Test Tool**: k6, JMeter, or Locust

#### Test Scenario
```bash
# Run load test
k6 run load-test.js \
  --vus 1000 \              # 1000 virtual users
  --duration 5m \            # 5 minute duration
  --ramp-up 30s             # 30 second ramp-up
```

#### Success Criteria
- p95 latency < 100ms
- p99 latency < 500ms
- Error rate < 0.1%
- Cache hit ratio > 80%

---

## Cost Optimization

### Infrastructure Sizing

| Component | Size | Cost/Month (Estimate) | Notes |
|-----------|------|----------------------|-------|
| EKS Cluster | t3.medium (3 nodes) | $45 | Auto-scales to 10 nodes peak |
| RDS | t3.medium + gp3 storage | $60 | Multi-AZ enabled |
| ElastiCache | t3.medium (3 nodes) | $50 | Multi-AZ failover |
| ALB | 1 ALB + 1,000 req/min | $25 | Estimated usage |
| CloudFront | 100GB data transfer | $8 | Estimated global traffic |
| **Total** | | **~$188** | Development estimate |

### Cost Reduction Strategies
1. **Reserved Instances**: 30% savings for 1-year commitment
2. **Spot Instances**: 70% savings (production-not recommended)
3. **Right-Sizing**: Monitor CloudWatch metrics, adjust as needed
4. **Data Transfer**: Minimize cross-region replication

---

## Troubleshooting Performance Issues

### High API Latency (>100ms p95)

1. **Check CloudWatch Metrics**
   ```bash
   aws cloudwatch get-metric-statistics \
     --metric-name TargetResponseTime \
     --namespace AWS/ApplicationELB \
     --statistics Average,Maximum
   ```

2. **Review Database Performance**
   - RDS Performance Insights → Active Sessions
   - Check for slow queries (>1s)

3. **Monitor Cache Hit Ratio**
   ```bash
   redis-cli INFO stats | grep keyspace_hits
   ```

4. **Analyze Network Latency**
   - Check ALB Target Health
   - Verify security group rules

### High Database CPU (>80%)

1. **Identify Slow Queries**
   ```sql
   SELECT query, calls, total_time
   FROM pg_stat_statements
   ORDER BY total_time DESC
   LIMIT 10;
   ```

2. **Optimize Queries**
   - Add missing indexes
   - Use query plans (`EXPLAIN ANALYZE`)
   - Consider read replica for reporting

3. **Increase Connection Pool**
   - Adjust PgBouncer settings
   - Monitor connection count

### Cache Evictions on Redis

1. **Monitor Redis Memory**
   ```bash
   redis-cli INFO memory | grep used_memory_peak
   ```

2. **Increase Node Type**
   - Scale from t3.small to t3.medium
   - Or add more nodes (cluster mode)

3. **Optimize Cache Keys**
   - Reduce key size (~100 bytes each)
   - Implement TTL pruning

---

## References
- [AWS CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [RDS Performance Insights](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html)
- [ElastiCache Best Practices](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html)
- [Next.js Performance](https://nextjs.org/learn-pages-router/seo/rendering-strategies)
