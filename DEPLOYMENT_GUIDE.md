# Headband Deployment Guide

Complete guide for deploying Headband to AWS EKS with Terraform, Kubernetes, and Helm.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup (Terraform)](#infrastructure-setup-terraform)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Helm Deployment](#helm-deployment)
5. [Validation & Testing](#validation--testing)
6. [Monitoring & Logs](#monitoring--logs)
7. [Troubleshooting](#troubleshooting)
8. [Scaling & Performance](#scaling--performance)
9. [Disaster Recovery](#disaster-recovery)

---

## Prerequisites

### Required Tools

```bash
# AWS CLI v2
aws --version  # 2.13+

# kubectl
kubectl version --client  # 1.20+

# Helm
helm version  # 3.0+

# Terraform
terraform version  # 1.0+

# Docker (for building images)
docker version  # 20.10+
```

### AWS Credentials

```bash
# Configure AWS credentials
aws configure

# Verify access
aws sts get-caller-identity
```

### Required AWS Resources

- ECR Registry (for container images)
- ACM Certificate (for SSL/TLS)
- IAM permissions (see terraform/variables.tf for required policies)

### Domain Setup

- Primary domain: headband.app
- API domain: api.headband.app
- Kibana domain: kibana.headband.app (optional)
- Route53 hosted zone configured

---

## Infrastructure Setup (Terraform)

### 1. Initialize Terraform

```bash
cd terraform

# Download providers and modules
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive
```

### 2. Plan Infrastructure

```bash
# Create terraform.tfvars (copy from terraform.tfvars.example)
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
# - aws_region
# - certificate_arn (from ACM)
# - domain_name, api_domain
# - database passwords, Redis token

# Review the plan
terraform plan -out=tfplan
```

### 3. Apply Infrastructure

```bash
# Create S3 bucket for Terraform state (first time only)
aws s3api create-bucket \
  --bucket headband-terraform-state \
  --region us-east-1 \
  --acl private

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket headband-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name headband-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Apply infrastructure
terraform apply tfplan

# Save outputs
terraform output -json > ../infrastructure-outputs.json
```

### 4. Verify Infrastructure

```bash
# Check EKS cluster
aws eks describe-cluster --name headband-cluster --region us-east-1

# Get kubeconfig
aws eks update-kubeconfig \
  --name headband-cluster \
  --region us-east-1 \
  --alias headband

# Verify cluster access
kubectl cluster-info
kubectl get nodes
```

---

## Kubernetes Deployment

### 1. Create Namespaces

```bash
# Production namespace
kubectl create namespace production

# Logging namespace
kubectl create namespace logging

# Add labels
kubectl label namespace production environment=production
kubectl label namespace logging environment=logging
```

### 2. Configure Secrets

```bash
# Copy secrets template
cp k8s/secrets.yaml k8s/secrets-prod.yaml

# Edit secrets-prod.yaml with actual values
# - DATABASE_URL (from RDS endpoint)
# - REDIS_URL (from ElastiCache endpoint)
# - JWT_SECRET
# - API keys, TLS certificates

# Create ECR pull secret
ECR_REGISTRY="123456789012.dkr.ecr.us-east-1.amazonaws.com"
kubectl create secret docker-registry ecr-secret \
  --docker-server=$ECR_REGISTRY \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region us-east-1) \
  -n production

# Apply secrets
kubectl apply -f k8s/secrets-prod.yaml
```

### 3. Deploy ELK Stack

```bash
# Elasticsearch
kubectl apply -f k8s/elasticsearch.yaml

# Wait for Elasticsearch
kubectl wait --for=condition=ready pod \
  -l app=elasticsearch \
  -n logging \
  --timeout=300s

# Kibana
kubectl apply -f k8s/kibana.yaml

# Logstash
kubectl apply -f k8s/logstash.yaml

# Verify ELK stack
kubectl get pods -n logging
kubectl get svc -n logging
```

### 4. Deploy Applications

```bash
# Backend
kubectl apply -f k8s/backend.yaml

# Frontend
kubectl apply -f k8s/frontend.yaml

# Workers
kubectl apply -f k8s/worker.yaml

# Verify deployments
kubectl get deployments -n production
kubectl get pods -n production
```

### 5. Configure Ingress (ALB)

```bash
# Install AWS ALB Controller (if not already installed)
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=headband-cluster \
  --set serviceAccount.create=true

# Apply ingress resources
kubectl apply -f k8s/frontend.yaml  # Contains Ingress
kubectl apply -f k8s/kibana.yaml    # Contains Ingress for Kibana

# Get ALB DNS
kubectl get ingress -n production
```

---

## Helm Deployment

### 1. Add Helm Repositories

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### 2. Install Headband Chart

```bash
# Development
helm install headband ./helm \
  -n production \
  -f helm/values.yaml \
  -f helm/values-development.yaml \
  --set global.domain=dev.headband.app

# Staging
helm install headband ./helm \
  -n production \
  -f helm/values.yaml \
  -f helm/values-staging.yaml \
  --set global.domain=staging.headband.app

# Production
helm install headband ./helm \
  -n production \
  -f helm/values.yaml \
  --set global.domain=headband.app \
  --set backend.image.tag=v1.0.0 \
  --set frontend.image.tag=v1.0.0
```

### 3. Verify Helm Release

```bash
# Check release status
helm status headband -n production

# Check deployed resources
helm get values headband -n production
helm get manifest headband -n production | head -50

# Watch rollout
kubectl rollout status deployment/headband-backend -n production
kubectl rollout status deployment/headband-frontend -n production
```

---

## Validation & Testing

### 1. Run Validation Script

```bash
# Make script executable
chmod +x scripts/validate-deployment.sh

# Run validation
./scripts/validate-deployment.sh production logging

# Expected output:
# [✓] All deployments are running
# [✓] All services are reachable
# [✓] ELK stack is operational
# [✓] Deployment validation completed successfully!
```

### 2. Manual Health Checks

```bash
# Backend health
kubectl exec -n production -it $(kubectl get pod -n production \
  -l app=backend -o jsonpath='{.items[0].metadata.name}') -- \
  curl http://localhost:3000/health

# Frontend health
kubectl port-forward -n production svc/frontend 3000:3000
# Open http://localhost:3000 in browser

# Worker metrics
kubectl port-forward -n production svc/worker 9090:9090
# Open http://localhost:9090/metrics

# Elasticsearch health
kubectl exec -n logging elasticsearch-0 -- \
  curl -s http://localhost:9200/_cluster/health | jq .

# Kibana status
kubectl port-forward -n logging svc/kibana 5601:5601
# Open http://localhost:5601
```

### 3. Smoke Tests

```bash
# Test API endpoint
API_URL=$(kubectl get service backend -n production \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

curl http://$API_URL/health
curl http://$API_URL/api/users

# Test frontend
FRONTEND_URL=$(kubectl get ingress frontend-ingress -n production \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

curl http://$FRONTEND_URL
```

---

## Monitoring & Logs

### 1. View Logs

```bash
# Backend logs (last 100 lines)
kubectl logs -n production -l app=backend --tail=100 -f

# Frontend logs
kubectl logs -n production -l app=frontend --tail=100 -f

# Worker logs
kubectl logs -n production -l app=worker --tail=100 -f

# Elasticsearch logs
kubectl logs -n logging -l app=elasticsearch --tail=100

# All logs (streaming)
kubectl logs -n production -l app --all-containers=true -f
```

### 2. Port Forwarding

```bash
# Kibana
kubectl port-forward -n logging svc/kibana 5601:5601
# Open http://localhost:5601

# Prometheus (if installed)
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Open http://localhost:9090

# Grafana (if installed)
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Open http://localhost:3000
```

### 3. Check Metrics

```bash
# Pod resource usage
kubectl top pods -n production

# Node resource usage
kubectl top nodes

# Describe pod for events
kubectl describe pod -n production POD_NAME
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod -n production BACKEND_POD

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Check logs
kubectl logs -n production BACKEND_POD --previous  # If crashed

# Check resources
kubectl describe nodes
```

### Image Pull Errors

```bash
# Verify ECR secret
kubectl get secret ecr-secret -n production -o yaml

# Recreate ECR secret if needed
kubectl delete secret ecr-secret -n production
kubectl create secret docker-registry ecr-secret \
  --docker-server=REGISTRY \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password) \
  -n production
```

### Database Connection Issues

```bash
# Verify credentials
kubectl get secret database-credentials -n production -o yaml

# Test connection from pod
kubectl exec -it -n production POD_NAME -- sh
psql -h ENDPOINT -U headband -d headband_db

# Check RDS security group
aws ec2 describe-security-groups \
  --group-names headband-rds-sg \
  --region us-east-1
```

### Elasticsearch Issues

```bash
# Check cluster health
kubectl exec -n logging elasticsearch-0 -- \
  curl -s http://localhost:9200/_cluster/health | jq .

# Check indices
kubectl exec -n logging elasticsearch-0 -- \
  curl -s http://localhost:9200/_cat/indices

# Check disk space
kubectl exec -n logging elasticsearch-0 -- \
  curl -s http://localhost:9200/_nodes/stats/fs | jq .

# View logs
kubectl logs -n logging elasticsearch-0
```

---

## Scaling & Performance

### Manual Scaling

```bash
# Scale backend replicas
kubectl scale deployment/backend --replicas=5 -n production

# Scale frontend replicas
kubectl scale deployment/frontend --replicas=5 -n production

# Scale worker replicas
kubectl scale deployment/worker --replicas=10 -n production
```

### HPA Configuration

```bash
# Check HPA status
kubectl get hpa -n production

# Describe HPA
kubectl describe hpa backend-hpa -n production

# Update HPA limits
kubectl patch hpa backend-hpa -n production -p \
  '{"spec":{"maxReplicas":15}}'
```

### Resource Optimization

```bash
# Monitor resource usage
watch 'kubectl top pods -n production'

# Update resource requests/limits
kubectl set resources deployment backend \
  -n production \
  --requests=cpu=750m,memory=768Mi \
  --limits=cpu=1500m,memory=1536Mi
```

---

## Disaster Recovery

### Backup

```bash
# Backup Elasticsearch
kubectl exec -n logging elasticsearch-0 -- \
  curl -X PUT http://localhost:9200/_snapshot/backup \
  -H 'Content-Type: application/json' \
  -d '{"type":"fs","settings":{"location":"/mnt/backup"}}'

# Backup Kubernetes manifests
kubectl get all --all-namespaces -o yaml > backup-$(date +%Y%m%d).yaml

# Backup Helm release
helm get values headband -n production > helm-values-backup.yaml
```

### Restore

```bash
# Restore from Helm backup
helm upgrade headband ./helm \
  -n production \
  -f helm-values-backup.yaml

# Restore Elasticsearch snapshot
kubectl exec -n logging elasticsearch-0 -- \
  curl -X POST http://localhost:9200/_snapshot/backup/snapshot_name/_restore
```

### Failover

```bash
# Force pod recreation
kubectl rollout restart deployment/backend -n production

# Recreate all pods
kubectl delete pods --all -n production

# Scale to zero then back up
kubectl scale deployment/backend --replicas=0 -n production
kubectl scale deployment/backend --replicas=3 -n production
```

---

## Post-Deployment Checklist

- [ ] All pods running (check `kubectl get pods -n production`)
- [ ] All services accessible (check `kubectl get svc -n production`)
- [ ] ELK stack operational (check Kibana http://kibana.headband.app)
- [ ] Ingress DNS resolving (check ALB DNS in Route53)
- [ ] SSL/TLS certificate valid (check browser)
- [ ] Database backups configured (check AWS RDS)
- [ ] Monitoring configured (check Prometheus/Grafana)
- [ ] Alerts configured (check SNS topic in AWS)
- [ ] Logging enabled (check CloudWatch/Kibana)
- [ ] Resource limits appropriate (check `kubectl top`)
- [ ] Network policies enforced (check `kubectl get networkpolicies`)
- [ ] RBAC configured (check `kubectl get roles,rolebindings`)

---

## Support & Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [ELK Stack Guide](https://www.elastic.co/guide/en/elastic-stack/current/index.html)

---

**Last Updated:** August 2026  
**Version:** 1.0.0
