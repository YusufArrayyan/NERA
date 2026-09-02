# Headband v1.0.0 - Production Deployment Playbook

**Purpose**: Step-by-step guide to deploy Headband to production on AWS/Kubernetes  
**Duration**: 45-60 minutes  
**Scope**: Infrastructure deployment, application deployment, database migration, verification

---

## 🎯 Pre-Deployment Checklist

### Before Starting Deployment

- [ ] All infrastructure validation passed
- [ ] All health checks passing
- [ ] Docker images built and tagged as v1.0.0
- [ ] Docker images pushed to ECR
- [ ] AWS credentials configured and verified
- [ ] Terraform plan reviewed and approved
- [ ] Helm charts ready and tested
- [ ] Database backup captured
- [ ] Team communication plan ready
- [ ] Rollback plan prepared
- [ ] Incident response team standing by

---

## 📦 Phase 1: Infrastructure Deployment (15-20 minutes)

### Step 1.1: Prepare Terraform

```bash
# Navigate to terraform directory
cd terraform

# Verify everything is initialized
terraform init

# Generate plan for review
terraform plan -out=tfplan-prod

# Review plan carefully
terraform show tfplan -json | jq '.resource_changes[] | select(.change.actions != ["no-op"])'

# Expected: ~50 resources to be created
```

### Step 1.2: Deploy Infrastructure

```bash
# Apply infrastructure (this takes 15-20 minutes)
terraform apply tfplan-prod

# Monitor deployment
watch -n 5 'aws cloudformation describe-stacks --stack-name headband-stack \
  --query "Stacks[0].[StackStatus]" --output text'

# Or monitor specific resources
aws ec2 describe-instances --filters "Name=tag:Name,Values=headband-*" \
  --query 'Reservations[].Instances[].{Name:Tags[0].Value,State:State.Name}'
```

### Step 1.3: Verify Infrastructure

```bash
# Get infrastructure outputs
terraform output -json > infrastructure.json

# Extract key endpoints
EKS_ENDPOINT=$(terraform output -raw eks_cluster_endpoint)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
ALB_DNS=$(terraform output -raw alb_dns_name)
CLOUDFRONT_URL=$(terraform output -raw cloudfront_domain_name)

# Save for later reference
echo "EKS: $EKS_ENDPOINT" >> deployment.log
echo "RDS: $RDS_ENDPOINT" >> deployment.log
echo "REDIS: $REDIS_ENDPOINT" >> deployment.log
echo "ALB: $ALB_DNS" >> deployment.log
echo "CDN: $CLOUDFRONT_URL" >> deployment.log

# Verify EKS cluster
aws eks describe-cluster --name headband-eks --region us-east-1 \
  --query 'cluster.[name,status,platformVersion]'

# Expected: ["headband-eks", "ACTIVE", "1.28-..."]

# Update kubeconfig
aws eks update-kubeconfig --name headband-eks --region us-east-1

# Test kubectl connection
kubectl get nodes
kubectl get namespaces
```

### Step 1.4: Create Kubernetes Namespaces

```bash
# Create namespaces
kubectl create namespace production
kubectl create namespace logging
kubectl create namespace monitoring

# Verify creation
kubectl get namespaces

# Label namespaces
kubectl label namespace production environment=production
kubectl label namespace logging environment=production
kubectl label namespace monitoring environment=production
```

### Step 1.5: Configure RBAC & Secrets

```bash
# Create service accounts
kubectl create serviceaccount headband-app -n production
kubectl create serviceaccount headband-worker -n production

# Create secrets for sensitive data
kubectl create secret generic headband-secrets \
  -n production \
  --from-literal=db-password=YOUR_DB_PASSWORD \
  --from-literal=redis-password=YOUR_REDIS_PASSWORD \
  --from-literal=jwt-secret=YOUR_JWT_SECRET \
  --from-literal=api-key=YOUR_API_KEY

# Verify secrets
kubectl get secrets -n production
```

---

## 🐳 Phase 2: Docker Image Preparation (5-10 minutes)

### Step 2.1: Build Docker Images

```bash
# Build backend image
docker build -t headband-backend:v1.0.0 ./backend
docker build -t headband-backend:latest ./backend

# Build frontend image
docker build -t headband-frontend:v1.0.0 ./frontend
docker build -t headband-frontend:latest ./frontend

# Build worker image
docker build -t headband-worker:v1.0.0 ./backend
docker build -t headband-worker:latest ./backend

# Verify images
docker images | grep headband
```

### Step 2.2: Push to ECR

```bash
# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=us-east-1

# Create ECR repositories (if not existing)
aws ecr create-repository --repository-name headband/backend --region $AWS_REGION
aws ecr create-repository --repository-name headband/frontend --region $AWS_REGION
aws ecr create-repository --repository-name headband/worker --region $AWS_REGION

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Tag images for ECR
docker tag headband-backend:v1.0.0 \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/backend:v1.0.0
docker tag headband-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/backend:latest

docker tag headband-frontend:v1.0.0 \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/frontend:v1.0.0
docker tag headband-frontend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/frontend:latest

docker tag headband-worker:v1.0.0 \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/worker:v1.0.0
docker tag headband-worker:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/worker:latest

# Push images
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/backend:v1.0.0
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/frontend:v1.0.0
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/worker:v1.0.0
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/headband/worker:latest

# Verify images in ECR
aws ecr describe-images --repository-name headband/backend --region $AWS_REGION
```

---

## 🗄️ Phase 3: Database Setup (10-15 minutes)

### Step 3.1: Connect to RDS

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

# Connect to PostgreSQL
PGPASSWORD='YOUR_DB_PASSWORD' psql \
  -h $RDS_ENDPOINT \
  -U headband \
  -d headband_db \
  -c "SELECT 1"

# Expected: Returns 1 (connection successful)
```

### Step 3.2: Initialize Database Schema

```bash
# Run database initialization script
PGPASSWORD='YOUR_DB_PASSWORD' psql \
  -h $RDS_ENDPOINT \
  -U headband \
  -d headband_db \
  -f scripts/init-db.sql

# Verify tables created
PGPASSWORD='YOUR_DB_PASSWORD' psql \
  -h $RDS_ENDPOINT \
  -U headband \
  -d headband_db \
  -c "\dt"

# Expected: 10+ tables listed
```

### Step 3.3: Verify Database

```bash
# Check table row counts
PGPASSWORD='YOUR_DB_PASSWORD' psql \
  -h $RDS_ENDPOINT \
  -U headband \
  -d headband_db << EOF
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM sessions;
SELECT COUNT(*) FROM eeg_data;
SELECT COUNT(*) FROM ml_predictions;
\q
EOF
```

---

## 🚀 Phase 4: Helm Deployment (15-20 minutes)

### Step 4.1: Prepare Helm Values

```bash
# Copy production values
cp helm/values.yaml helm/values-prod.yaml

# Edit production values
nano helm/values-prod.yaml

# Key values to update:
# - image.backend.tag: v1.0.0
# - image.frontend.tag: v1.0.0
# - image.worker.tag: v1.0.0
# - replicas.backend: 3 (or higher for load)
# - replicas.frontend: 3
# - replicas.worker: 2
# - env.DATABASE_URL: RDS endpoint
# - env.REDIS_URL: Redis endpoint
# - env.domain: your-domain.app
# - env.acmCertificateArn: your-certificate-arn
```

### Step 4.2: Validate Helm Chart

```bash
# Lint chart
helm lint helm/

# Expected: 0 chart(s) linted, 0 chart(s) failed

# Dry-run to see what will be deployed
helm install headband ./helm \
  -n production \
  -f helm/values-prod.yaml \
  --dry-run \
  --debug > deployment-preview.yaml

# Review deployment preview
cat deployment-preview.yaml | head -100
```

### Step 4.3: Deploy with Helm

```bash
# Install Helm release
helm install headband ./helm \
  -n production \
  -f helm/values-prod.yaml \
  --create-namespace

# Monitor deployment
kubectl rollout status deployment/backend -n production --timeout=5m
kubectl rollout status deployment/frontend -n production --timeout=5m
kubectl rollout status deployment/worker -n production --timeout=5m

# Expected: All deployments rolled out successfully
```

### Step 4.4: Verify Helm Deployment

```bash
# List deployed release
helm list -n production

# Get release status
helm status headband -n production

# View deployed resources
kubectl get all -n production

# Check pod status
kubectl get pods -n production

# Expected: All pods in Running state
```

---

## 🔍 Phase 5: Application Verification (10-15 minutes)

### Step 5.1: Check Pod Health

```bash
# Get pod details
kubectl get pods -n production -o wide

# Check pod logs
kubectl logs -n production deployment/backend --tail=50
kubectl logs -n production deployment/frontend --tail=50
kubectl logs -n production deployment/worker --tail=50

# Describe pods for events
kubectl describe pod -n production -l app=backend
kubectl describe pod -n production -l app=frontend
```

### Step 5.2: Verify Services

```bash
# Get services
kubectl get services -n production

# Test backend service
kubectl exec -n production -it $(kubectl get pod -n production -l app=backend -o jsonpath='{.items[0].metadata.name}') -- \
  curl -s http://localhost:3000/health

# Expected: {"status":"ok",...}
```

### Step 5.3: Test API Endpoints

```bash
# Port-forward to backend
kubectl port-forward -n production svc/backend 3000:3000 &

# Test health endpoint
curl -X GET http://localhost:3000/health

# Test database connectivity
curl -X GET http://localhost:3000/health/db

# Test cache connectivity
curl -X GET http://localhost:3000/health/cache

# Kill port-forward
killall kubectl
```

### Step 5.4: Access Frontend

```bash
# Port-forward to frontend
kubectl port-forward -n production svc/frontend 3001:3000 &

# Open in browser: http://localhost:3001

# Or use curl to verify it's serving
curl -I http://localhost:3001

# Expected: 200 OK

# Kill port-forward
killall kubectl
```

---

## 🔐 Phase 6: Security & Monitoring Setup (5-10 minutes)

### Step 6.1: Configure Monitoring

```bash
# Verify CloudWatch is collecting metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --statistics Average \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300

# Verify alarms are active
aws cloudwatch describe-alarms \
  --alarm-names headband-cpu-alarm headband-error-alarm

# Expected: Alarms in INSUFFICIENT_DATA or OK state
```

### Step 6.2: Configure Logging

```bash
# Verify ELK stack is running
kubectl get pods -n logging

# Verify Elasticsearch is receiving data
curl -s http://elasticsearch:9200/_cat/indices

# Verify Kibana dashboards
curl -s http://kibana:5601/api/saved_objects/dashboard \
  | jq '.saved_objects | length'

# Expected: >0 dashboards
```

### Step 6.3: Test Security

```bash
# Verify WAF is active
aws wafv2 get-web-acl \
  --id YOUR_WAF_ID \
  --scope REGIONAL \
  --region us-east-1

# Verify SSL certificate
aws acm describe-certificate \
  --certificate-arn YOUR_CERT_ARN

# Expected: Certificate Status = ISSUED
```

---

## 📊 Phase 7: Load Balancing & DNS (5 minutes)

### Step 7.1: Configure DNS

```bash
# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names headband-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo "ALB DNS: $ALB_DNS"

# Create Route53 alias record (if not already created by Terraform)
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "headband.app",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "'$ALB_DNS'",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

### Step 7.2: Verify DNS

```bash
# Test DNS resolution
nslookup headband.app
# or
dig headband.app

# Expected: Returns ALB IP address

# Test HTTPS
curl -I https://headband.app
# Expected: 200 OK with valid SSL certificate
```

---

## ✅ Phase 8: Final Verification (5-10 minutes)

### Step 8.1: End-to-End Testing

```bash
# Test registration
curl -X POST https://headband.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@headband.app",
    "password": "TestPass123!"
  }'

# Test login
curl -X POST https://headband.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@headband.app",
    "password": "TestPass123!"
  }'

# Expected: Both return 200-201 with tokens
```

### Step 8.2: Performance Testing

```bash
# Run load test
k6 run tests/load/k6-load-test.js

# Monitor metrics during test
kubectl top nodes
kubectl top pods -n production

# Expected: System handles load without errors
```

### Step 8.3: Log Aggregation Verification

```bash
# Verify logs are flowing to Elasticsearch
curl -s http://elasticsearch:9200/_cat/indices | grep logstash

# Query recent logs
curl -s http://elasticsearch:9200/logstash-*/_search \
  -H "Content-Type: application/json" \
  -d '{"query": {"match_all": {}}, "size": 10}'

# Expected: Recent log entries visible
```

---

## 🔄 Phase 9: Rollback Procedures (Prepare)

### Helm Rollback

```bash
# View release history
helm history headband -n production

# Rollback to previous version
helm rollback headband 1 -n production

# Verify rollback
helm status headband -n production
kubectl get pods -n production
```

### Database Rollback

```bash
# If database migration fails, restore from snapshot
aws rds describe-db-snapshots \
  --db-instance-identifier headband-db

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier headband-db-restore \
  --db-snapshot-identifier headband-db-snapshot-xxx
```

### Infrastructure Rollback

```bash
# Destroy infrastructure if needed
terraform destroy -auto-approve

# Warning: This deletes all infrastructure
# Only use in emergency situations
```

---

## 📋 Deployment Verification Checklist

### Infrastructure ✅
- [ ] AWS resources created
- [ ] VPC and networking operational
- [ ] EKS cluster running
- [ ] RDS database accessible
- [ ] ElastiCache Redis connected
- [ ] ALB routing traffic
- [ ] CloudFront distribution active

### Application ✅
- [ ] Backend pods running (3+)
- [ ] Frontend pods running (3+)
- [ ] Worker pods running (2+)
- [ ] All pods healthy
- [ ] API endpoints responding
- [ ] Frontend loading without errors
- [ ] Database schema initialized

### Connectivity ✅
- [ ] Backend → Database: Working
- [ ] Backend → Redis: Working
- [ ] Backend → Elasticsearch: Working
- [ ] Frontend → Backend: Working
- [ ] Internet → ALB: Working
- [ ] ALB → Pods: Working

### Security ✅
- [ ] SSL certificate valid
- [ ] WAF rules active
- [ ] Security groups configured
- [ ] Encryption enabled
- [ ] Authentication working
- [ ] Authorized access only

### Monitoring ✅
- [ ] CloudWatch metrics flowing
- [ ] CloudWatch alarms configured
- [ ] Elasticsearch receiving logs
- [ ] Kibana dashboards visible
- [ ] SNS notifications working
- [ ] Performance within targets

### Data ✅
- [ ] Database tables created
- [ ] Indexes present
- [ ] Schema validation passed
- [ ] Data integrity verified
- [ ] Backup captured
- [ ] Backup tested

---

## 🎯 Post-Deployment Tasks

### First 24 Hours
- [ ] Monitor system health continuously
- [ ] Watch error logs for issues
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Prepare incident response team

### First Week
- [ ] Analyze performance data
- [ ] Fine-tune resource allocation
- [ ] Optimize slow endpoints
- [ ] Address any critical issues
- [ ] Complete documentation
- [ ] Team knowledge transfer

### First Month
- [ ] Monitor stability
- [ ] Collect user metrics
- [ ] Plan Phase 7 (Mobile)
- [ ] Optimize based on usage
- [ ] Prepare next iteration

---

## ✨ Success Criteria

| Phase | Criteria | Status |
|-------|----------|--------|
| Infrastructure | All resources created | ✓ |
| Databases | Schema initialized | ✓ |
| Docker | Images in ECR | ✓ |
| Kubernetes | Pods running | ✓ |
| API | Endpoints responding | ✓ |
| Frontend | Page loading | ✓ |
| Security | SSL valid, WAF active | ✓ |
| Monitoring | Metrics flowing | ✓ |
| DNS | Domain resolving | ✓ |
| E2E | Auth working | ✓ |

---

**Status**: Ready for production deployment  
**Next**: Go-Live Checklist → Launch

---

Generated: August 29, 2026  
Version: 1.0.0
