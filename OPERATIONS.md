# Headband Operations & Runbooks

Complete operations guide for deploying, monitoring, and maintaining Headband infrastructure.

## Table of Contents

1. [Deployment](#deployment)
2. [Monitoring & Alerting](#monitoring--alerting)
3. [Scaling](#scaling)
4. [Maintenance](#maintenance)
5. [Incident Response](#incident-response)
6. [Disaster Recovery](#disaster-recovery)
7. [Performance Tuning](#performance-tuning)
8. [Security Updates](#security-updates)

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, e2e)
- [ ] Code reviewed and approved
- [ ] Security scan completed (OWASP Top 10)
- [ ] Load tests pass with acceptable thresholds
- [ ] Database migrations reviewed
- [ ] Infrastructure code validated
- [ ] Runbooks updated
- [ ] Rollback plan documented

### Production Deployment

```bash
# 1. Terraform plan & apply
cd terraform
terraform plan -out=tfplan
terraform apply tfplan

# 2. Update kubeconfig
aws eks update-kubeconfig \
  --name headband-cluster \
  --region us-east-1

# 3. Deploy with Helm
helm upgrade --install headband ./helm \
  -n production \
  -f helm/values.yaml \
  --set backend.image.tag=v1.0.0 \
  --set frontend.image.tag=v1.0.0

# 4. Validate deployment
kubectl rollout status deployment/headband-backend -n production
kubectl rollout status deployment/headband-frontend -n production

# 5. Run smoke tests
./scripts/validate-deployment.sh production logging
```

### Blue-Green Deployment

```bash
# Deploy new version to green environment
helm install headband-green ./helm \
  -n production \
  -f helm/values.yaml \
  --set backend.image.tag=v1.1.0

# Test green environment
kubectl port-forward -n production svc/headband-green-backend 3000:3000

# Switch traffic to green
kubectl patch service headband -n production \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Keep blue for rollback
```

### Staging to Production

```bash
# Promote image from staging
docker tag \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/headband-backend:staging \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/headband-backend:v1.0.0

aws ecr push-image-manifest ...

# Deploy to production
helm upgrade headband ./helm -n production \
  --set backend.image.tag=v1.0.0
```

---

## Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Usage | >80% | Scale up nodes |
| Memory Usage | >85% | Restart pods, scale up |
| Disk Usage | >90% | Cleanup, expand storage |
| API Latency p95 | >500ms | Analyze queries, scale |
| Error Rate | >0.1% | Check logs, diagnose |
| Database Connections | >150/200 | Increase pool, optimize |

### CloudWatch Dashboards

```bash
# Access production dashboard
aws cloudwatch get-dashboard --dashboard-name headband-dashboard

# Create custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name headband-custom \
  --dashboard-body file://dashboard.json
```

### Prometheus Queries

```promql
# API latency p95
histogram_quantile(0.95, http_request_duration_seconds)

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Pod restarts
rate(kube_pod_container_status_restarts_total[15m])

# Database query duration
histogram_quantile(0.99, pg_statement_duration_seconds)
```

### SNS Alerts

```bash
# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT:headband-alerts \
  --protocol email \
  --notification-endpoint ops@headband.app

# Test alert
aws sns publish \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT:headband-alerts \
  --message "Test alert"
```

---

## Scaling

### Horizontal Scaling

```bash
# Manual scale
kubectl scale deployment/headband-backend --replicas=5 -n production

# Update HPA limits
kubectl patch hpa headband-backend-hpa -n production \
  -p '{"spec":{"maxReplicas":20}}'

# Check HPA status
kubectl get hpa -n production
kubectl describe hpa headband-backend-hpa -n production
```

### Vertical Scaling

```bash
# Update resource limits
kubectl set resources deployment headband-backend \
  -n production \
  --limits=cpu=2000m,memory=2Gi \
  --requests=cpu=1000m,memory=1Gi

# Verify changes
kubectl describe pod -n production \
  $(kubectl get pod -n production -l app=backend -o jsonpath='{.items[0].metadata.name}')
```

### Database Scaling

```bash
# RDS: Modify instance class
aws rds modify-db-instance \
  --db-instance-identifier headband-db \
  --db-instance-class db.t3.large \
  --apply-immediately

# RDS: Expand storage
aws rds modify-db-instance \
  --db-instance-identifier headband-db \
  --allocated-storage 200 \
  --apply-immediately

# Redis: Scale cluster
aws elasticache modify-replication-group \
  --replication-group-id headband-redis \
  --num-cache-clusters 5
```

---

## Maintenance

### Database Maintenance

```bash
# Backup database
aws rds create-db-snapshot \
  --db-instance-identifier headband-db \
  --db-snapshot-identifier headband-db-backup-$(date +%Y%m%d)

# Run VACUUM & ANALYZE
aws rds-describe-db-instances ... | ...
kubectl exec -n production postgres-pod -- \
  psql -U headband -d headband_db -c "VACUUM ANALYZE;"

# Check table sizes
kubectl exec -n production postgres-pod -- \
  psql -U headband -d headband_db -c "
    SELECT schemaname, tablename,
           pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
    FROM pg_tables 
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Log Rotation

```bash
# Configure log retention
kubectl patch configmap fluent-bit-config -n logging \
  -p '{"data":{"log.conf":"... retention_days: 30 ..."}}'

# Cleanup old logs
kubectl exec -n logging elasticsearch-0 -- \
  curl -X DELETE http://localhost:9200/app-logs-2024-01-*

# Check index sizes
curl http://localhost:9200/_cat/indices?v
```

### Certificate Renewal

```bash
# Check certificate expiry
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/ID \
  --query 'Certificate.NotAfter'

# Request new certificate
aws acm request-certificate \
  --domain-name headband.app \
  --subject-alternative-names "*.headband.app"

# Update ALB
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --certificates CertificateArn=arn:aws:acm:...
```

---

## Incident Response

### Service Degradation

**Symptoms**: Slow API responses, timeout errors

```bash
# 1. Check metrics
kubectl top pods -n production
kubectl top nodes

# 2. Check logs
kubectl logs -n production -l app=backend --tail=100 -f

# 3. Restart affected service
kubectl rollout restart deployment/headband-backend -n production

# 4. Scale up if under load
kubectl scale deployment/headband-backend --replicas=10 -n production

# 5. Analyze after recovery
kubectl logs -n production -l app=backend \
  --since=1h | grep ERROR | tail -50
```

### Database Connection Exhaustion

**Symptoms**: "Too many connections" errors

```bash
# 1. Check current connections
kubectl exec -n production postgres-pod -- \
  psql -U headband -d headband_db -c "
    SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# 2. Identify long-running queries
kubectl exec -n production postgres-pod -- \
  psql -U headband -d headband_db -c "
    SELECT pid, usename, query, query_start
    FROM pg_stat_activity
    WHERE state != 'idle'
    ORDER BY query_start;"

# 3. Kill idle connections
kubectl exec -n production postgres-pod -- \
  psql -U headband -d headband_db -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'idle'
    AND query_start < now() - interval '30 minutes';"

# 4. Increase connection pool
kubectl set env deployment/headband-backend \
  DB_POOL_SIZE=50 -n production
```

### Out of Memory

**Symptoms**: Pod evictions, OOMKilled restarts

```bash
# 1. Check memory usage
kubectl describe node NODE_NAME

# 2. Identify memory hog
kubectl top pods -n production --sort-by=memory

# 3. Check pod limits
kubectl describe pod POD_NAME -n production | grep -A 5 Limits

# 4. Increase limits or scale up
kubectl set resources deployment/headband-backend \
  -n production \
  --limits=memory=2Gi

# 5. Add node
kubectl scale nodegroup headband-nodes \
  --desired-capacity 5 \
  --cluster headband-cluster \
  --region us-east-1
```

### High Error Rate

**Symptoms**: 5xx errors, 4xx spikes

```bash
# 1. Check error logs
kubectl logs -n production -l app=backend \
  | grep -i error | tail -100

# 2. Check dependent services
curl http://localhost:9200/_cluster/health     # ES
redis-cli ping                                  # Redis
psql -c "SELECT 1;"                            # DB

# 3. Check recent deployments
helm history headband -n production
kubectl rollout history deployment/headband-backend -n production

# 4. Rollback if needed
helm rollback headband 1 -n production

# 5. Check quotas/limits
kubectl describe resourcequota -n production
```

---

## Disaster Recovery

### RDS Snapshot Restore

```bash
# List snapshots
aws rds describe-db-snapshots --query 'DBSnapshots[*].[DBSnapshotIdentifier,CreateTime]'

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier headband-db-restored \
  --db-snapshot-identifier headband-db-backup-20240101

# Verify restored database
psql -h restored-endpoint.rds.amazonaws.com -U headband -d headband_db -c "SELECT COUNT(*) FROM users;"

# Switch DNS to restored
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch file://dns-change.json
```

### Kubernetes Cluster Recovery

```bash
# If cluster is down, restore from etcd backup
aws s3 cp s3://headband-backups/etcd-backup.db ./

# Or recreate cluster
terraform apply -target=aws_eks_cluster.main

# Restore Helm releases
helm status headband -n production

# Restore data volumes
kubectl get pvc -n production
# Restore from snapshots
```

### Complete Data Center Failover

```bash
# Update Terraform to alternate region
terraform plan -var-file=terraform-us-west-2.tfvars

# Apply in new region
terraform apply

# Point DNS to new region
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch file://failover.json

# Verify
curl https://headband.app/health
```

---

## Performance Tuning

### Database Query Optimization

```bash
# Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();

# Analyze slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Add missing indexes
CREATE INDEX idx_sessions_created_at ON eeg_sessions(created_at);

# Vacuum & analyze
VACUUM ANALYZE eeg_sessions;
```

### Redis Optimization

```bash
# Check memory usage
redis-cli INFO memory

# Identify hot keys
redis-cli --hotkeys

# Configure eviction
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG REWRITE

# Monitor slow commands
redis-cli SLOWLOG GET 10
```

### API Response Caching

```bash
# Cache headers in backend
res.set('Cache-Control', 'public, max-age=3600');
res.set('ETag', generateHash(data));

# CloudFront cache optimization
# Increase cache hit ratio
# Monitor CloudFront metrics
aws cloudfront get-distribution-statistics \
  --id DISTRIBUTION_ID
```

---

## Security Updates

### Patch Management

```bash
# Check for available updates
npm outdated
npm audit

# Update dependencies
npm update
npm audit fix

# Update Docker base images
docker pull node:18-alpine
docker build --no-cache -t headband-backend:v1.1.0 .

# Update Kubernetes
kubectl get nodes
# AWS automatically patches EKS
```

### Security Scanning

```bash
# Scan images for vulnerabilities
trivy image headband-backend:v1.0.0

# OWASP dependency check
npm audit

# SAST scanning (SonarQube)
sonar-scanner -Dsonar.projectKey=headband

# Infrastructure scanning
checkov -d terraform/

# Container scanning in AWS
aws ecr describe-image-scan-findings \
  --repository-name headband-backend \
  --image-id imageTag=v1.0.0
```

### Access Control Updates

```bash
# Rotate service account credentials
kubectl delete serviceaccount backend -n production
kubectl create serviceaccount backend -n production
kubectl create rolebinding backend-role-binding \
  --clusterrole=backend-role \
  --serviceaccount=production:backend

# Update IAM roles
aws iam update-role-policy \
  --role-name headband-backend \
  --policy-name headband-policy \
  --policy-document file://new-policy.json

# Audit access
aws accessanalyzer validate-policy \
  --policy-document file://policy.json
```

---

## Monitoring Dashboards

### Key Dashboard: System Health

```json
{
  "widgets": [
    {
      "type": "metric",
      "metrics": [
        ["AWS/EKS", "node_count", {"stat": "Average"}],
        ["AWS/RDS", "CPUUtilization", {"stat": "Average"}],
        ["AWS/ApplicationELB", "TargetResponseTime", {"stat": "Average"}],
        ["AWS/ElastiCache", "CPUUtilization", {"stat": "Average"}]
      ]
    },
    {
      "type": "log",
      "query": "fields @timestamp, @message | stats count() by bin(5m)"
    }
  ]
}
```

---

## References

- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Kubernetes Operations Guide](https://kubernetes.io/docs/tasks/administer-cluster/)
- [PostgreSQL Administration](https://www.postgresql.org/docs/current/admin.html)
- [Incident Response](https://en.wikipedia.org/wiki/Incident_response)

---

**Runbook Version**: 1.0.0  
**Last Updated**: August 2026
