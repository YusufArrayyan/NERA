# Headband v1.0.0 - Infrastructure Validation Guide

**Purpose**: Validate AWS account setup, Terraform configuration, and cloud infrastructure readiness  
**Duration**: 30-45 minutes  
**Scope**: AWS setup, Terraform validation, security configuration, networking, database, caching, monitoring

---

## 📋 Pre-Deployment Infrastructure Checklist

### AWS Account Prerequisites

#### Required Services
- [ ] AWS Account created and active
- [ ] Billing alarm configured (optional but recommended)
- [ ] CloudTrail enabled for audit logging
- [ ] AWS Organizations set up (if multi-account)

#### Required Permissions
- [ ] IAM user with AdministratorAccess (temporary, for setup)
- [ ] Or specific policies: EC2, ECS, RDS, ElastiCache, ALB, CloudFront, WAF, CloudWatch, KMS, VPC

#### Regional Configuration
- [ ] Primary region selected (recommended: us-east-1, us-west-2, eu-west-1)
- [ ] Secondary region for failover (optional)
- [ ] All resources deployed in same region

---

## 🔐 AWS Credentials Setup

### 1. Generate AWS Access Keys

```bash
# Navigate to AWS IAM Console
# → Users → Select user → Security credentials
# → Create access key (CLI)

# Store credentials securely
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJ...
```

### 2. Configure AWS CLI

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Or via package manager
brew install awscli  # macOS
apt-get install awscli  # Linux
choco install awscli  # Windows

# Configure credentials
aws configure

# When prompted, enter:
AWS Access Key ID: AKIA...
AWS Secret Access Key: wJ...
Default region: us-east-1
Default output format: json
```

### 3. Verify AWS CLI Setup

```bash
# Test credentials
aws sts get-caller-identity

# Expected output:
# {
#   "UserId": "AIDAI...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/your-user"
# }

# List available regions
aws ec2 describe-regions --query 'Regions[].RegionName'
```

---

## 📦 Terraform Setup

### 1. Install Terraform

```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Windows
choco install terraform

# Verify installation
terraform --version
# Expected: Terraform v1.6.0+
```

### 2. Initialize Terraform

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform (downloads providers, configures backend)
terraform init

# Expected output:
# Initializing the backend...
# Initializing provider plugins...
# Terraform has been successfully configured!
```

### 3. Validate Terraform Configuration

```bash
# Check syntax and configuration
terraform validate

# Expected: Success! The configuration is valid.
```

### 4. Format Terraform Files

```bash
# Auto-format all .tf files
terraform fmt -recursive

# Check formatting
terraform fmt -check -recursive
```

---

## 🔍 Terraform Planning & Validation

### 1. Generate Terraform Plan

```bash
# Create plan file
terraform plan -out=tfplan

# This will show:
# - Resources to be created
# - Resource configurations
# - Any warnings or errors

# Expected: Plan: X to add, 0 to change, 0 to destroy
```

### 2. Review Plan Output

```bash
# View human-readable plan
terraform show tfplan

# Look for:
# ✓ VPC with correct CIDR block
# ✓ Public and private subnets
# ✓ EKS cluster configuration
# ✓ RDS instance (Multi-AZ)
# ✓ ElastiCache Redis
# ✓ ALB and target groups
# ✓ CloudFront distribution
# ✓ WAF rules
# ✓ Security groups
# ✓ IAM roles and policies
# ✓ CloudWatch alarms
```

### 3. Estimate Costs

```bash
# Install Terraform Cost Estimation (optional)
# https://www.infracost.io/

# Or manually review AWS pricing:
# - EKS: $0.10/hour + compute
# - RDS t3.medium: ~$200/month
# - ElastiCache: ~$150/month
# - NAT Gateway: ~$32/month
# - Data transfer: ~$0.02/GB
```

---

## 🌍 Infrastructure Component Validation

### VPC Configuration

```bash
# Check VPC variables in terraform.tfvars
cat terraform/terraform.tfvars | grep -E "vpc|subnet|cidr"

# Expected values:
# vpc_cidr = "10.0.0.0/16"
# public_subnet_cidr = ["10.0.1.0/24", "10.0.2.0/24"]
# private_subnet_cidr = ["10.0.10.0/24", "10.0.11.0/24"]
```

### EKS Cluster Configuration

```bash
# Verify EKS settings
terraform plan | grep -A 5 "aws_eks_cluster"

# Check for:
# ✓ Cluster name: headband-eks
# ✓ Kubernetes version: 1.28
# ✓ Endpoint protection enabled
# ✓ Logging enabled (API, audit, authenticator)
# ✓ IAM role configured
```

### RDS Database Configuration

```bash
# Verify RDS settings
terraform plan | grep -A 10 "aws_db_instance"

# Check for:
# ✓ Instance class: db.t3.medium
# ✓ Allocated storage: 100GB
# ✓ Multi-AZ: true
# ✓ Backup retention: 30 days
# ✓ Enhanced monitoring: enabled
# ✓ Encryption: enabled (KMS)
# ✓ IAM database authentication: enabled
```

### ElastiCache Redis Configuration

```bash
# Verify Redis settings
terraform plan | grep -A 10 "aws_elasticache_cluster"

# Check for:
# ✓ Engine: redis 7
# ✓ Node type: cache.t3.medium
# ✓ Number of cache nodes: 3
# ✓ Multi-AZ: enabled
# ✓ Automatic failover: enabled
# ✓ Encryption at rest: enabled
# ✓ Encryption in transit: enabled
```

### Load Balancer Configuration

```bash
# Verify ALB settings
terraform plan | grep -A 10 "aws_lb"

# Check for:
# ✓ Type: application
# ✓ Scheme: internet-facing
# ✓ Subnets: Public subnets
# ✓ Security groups: ALB security group
# ✓ HTTPS listener: configured
# ✓ Target groups: backend-tg, frontend-tg
```

### CDN Configuration

```bash
# Verify CloudFront settings
terraform plan | grep -A 15 "aws_cloudfront_distribution"

# Check for:
# ✓ Origins: S3 + ALB
# ✓ Default cache behavior: 1 hour TTL
# ✓ HTTPS: required
# ✓ Compression: enabled
# ✓ Security policy: TLSv1.2_2021-06
# ✓ WAF association: enabled
```

### Security Configuration

```bash
# Verify security settings
terraform plan | grep -A 5 "aws_wafv2"

# Check for:
# ✓ WAF rules: rate limiting, SQL injection, XSS
# ✓ Rate limit: 2000 requests per 5 minutes
# ✓ IP reputation list: enabled
# ✓ AWS Managed Rules: enabled

# Verify VPC Flow Logs
terraform plan | grep -A 5 "aws_flow_log"

# Check for:
# ✓ Traffic type: ACCEPT and REJECT
# ✓ Destination: CloudWatch Logs
# ✓ IAM role: configured
```

### Monitoring Configuration

```bash
# Verify CloudWatch settings
terraform plan | grep -A 5 "aws_cloudwatch_metric_alarm"

# Check for:
# ✓ CPU utilization alarm
# ✓ Database connection alarm
# ✓ Error rate alarm
# ✓ DLQ message alarm
# ✓ Notification: SNS topic
```

---

## 🔑 AWS Resources Pre-Checks

### 1. SSL/TLS Certificates

```bash
# Check if ACM certificate exists
aws acm list-certificates

# If not, request a new certificate
aws acm request-certificate \
  --domain-name headband.app \
  --domain-name "*.headband.app" \
  --validation-method DNS \
  --region us-east-1

# Note the Certificate ARN for use in Terraform
```

### 2. Route53 Hosted Zone

```bash
# Check if hosted zone exists
aws route53 list-hosted-zones-by-name --dns-name headband.app

# If not, create one
aws route53 create-hosted-zone \
  --name headband.app \
  --caller-reference $(date +%s)

# Get nameservers
aws route53 list-resource-record-sets \
  --hosted-zone-id /hostedzone/Z123456789ABC
```

### 3. S3 Buckets (if needed)

```bash
# List existing buckets
aws s3 ls

# Create Terraform state bucket (if not using local state)
aws s3 mb s3://headband-terraform-state-$(date +%s) \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket headband-terraform-state-xxx \
  --versioning-configuration Status=Enabled
```

### 4. KMS Keys

```bash
# List KMS keys
aws kms list-keys

# If needed, create a key for database encryption
aws kms create-key \
  --description "Headband database encryption key" \
  --region us-east-1
```

---

## 📝 Terraform Variables Configuration

### 1. Create terraform.tfvars

```bash
# Copy example file
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit with your values
nano terraform/terraform.tfvars
```

### 2. Required Variables

```hcl
# terraform.tfvars

# AWS
aws_region      = "us-east-1"
aws_account_id  = "123456789012"

# Environment
environment = "production"
project_name = "headband"

# VPC
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# EKS
eks_cluster_version = "1.28"
eks_node_group_size = {
  min_size       = 3
  max_size       = 10
  desired_size   = 3
  instance_types = ["t3.large"]
}

# RDS
rds_instance_class       = "db.t3.medium"
rds_allocated_storage    = 100
rds_backup_retention     = 30
rds_multi_az             = true

# ElastiCache
elasticache_node_type       = "cache.t3.medium"
elasticache_num_cache_nodes = 3
elasticache_engine_version  = "7.0"

# Domain
domain_name = "headband.app"
acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/xxx"

# Tags
common_tags = {
  Project     = "Headband"
  Environment = "Production"
  ManagedBy   = "Terraform"
  CostCenter  = "Engineering"
}
```

### 3. Validate Variables

```bash
# Check all required variables are set
terraform plan -var-file=terraform.tfvars | grep "Error\|Warning"

# List all variables
terraform console
> var.aws_region
"us-east-1"
```

---

## 🚀 Pre-Apply Checks

### 1. Security Validation

```bash
# Verify no hardcoded secrets
grep -r "password\|secret\|token" terraform/ | grep -v "\.example\|\.md"

# Should return nothing - all secrets should use variables or Secrets Manager
```

### 2. Compliance Checks

```bash
# Use Checkov for compliance validation
brew install checkov  # or: pip install checkov

# Run compliance scan
checkov -d terraform/

# Check for:
# ✓ Encryption enabled
# ✓ Public access blocked
# ✓ Logging enabled
# ✓ IAM policies least privilege
```

### 3. Cost Estimation

```bash
# Rough cost estimate
echo "Monthly Cost Estimate:"
echo "EKS Cluster: ~$300"
echo "RDS Database: ~$200"
echo "ElastiCache: ~$150"
echo "NAT Gateway: ~$32"
echo "ALB: ~$20"
echo "CloudFront: ~$50"
echo "Data Transfer: ~$50"
echo "---"
echo "TOTAL: ~$800/month (before heavy data transfer)"
```

---

## 🔧 Infrastructure Deployment

### 1. Apply Terraform (When Ready)

```bash
# Review plan one more time
terraform show tfplan

# Apply configuration (PRODUCTION - requires confirmation)
terraform apply tfplan

# Expected: 50+ resources created
# Takes 15-25 minutes
```

### 2. Monitor Deployment

```bash
# Watch EKS cluster creation
aws eks describe-cluster --name headband-eks --region us-east-1

# Monitor RDS creation
aws rds describe-db-instances --db-instance-identifier headband-db

# Check ALB status
aws elbv2 describe-load-balancers --region us-east-1
```

### 3. Capture Outputs

```bash
# Get infrastructure outputs
terraform output

# Save for reference
terraform output > infrastructure-outputs.txt

# Key outputs to save:
# - eks_cluster_endpoint
# - rds_endpoint
# - elasticache_endpoint
# - alb_dns_name
# - cloudfront_domain_name
```

---

## ✅ Post-Infrastructure Validation

### 1. VPC & Networking

```bash
# Verify VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=headband-vpc"

# Verify subnets
aws ec2 describe-subnets --filters "Name=tag:Name,Values=headband-*"

# Verify security groups
aws ec2 describe-security-groups --filters "Name=tag:Name,Values=headband-*"

# Verify NAT Gateway
aws ec2 describe-nat-gateways --filter "Name=tag:Name,Values=headband-nat"
```

### 2. EKS Cluster

```bash
# Get cluster info
aws eks describe-cluster --name headband-eks

# Get nodes
aws eks describe-nodegroup --cluster-name headband-eks --nodegroup-name headband-nodes

# Verify kubectl access
aws eks update-kubeconfig --region us-east-1 --name headband-eks

# Test connection
kubectl get nodes
kubectl get namespaces
```

### 3. RDS Database

```bash
# Verify RDS instance
aws rds describe-db-instances --db-instance-identifier headband-db

# Check backup status
aws rds describe-db-snapshots --db-instance-identifier headband-db

# Verify encryption
aws rds describe-db-instances --db-instance-identifier headband-db \
  --query 'DBInstances[0].[StorageEncrypted,KmsKeyId]'

# Expected: [true, "arn:aws:kms:..."]
```

### 4. ElastiCache Redis

```bash
# Verify cluster
aws elasticache describe-cache-clusters --cache-cluster-id headband-redis

# Check nodes
aws elasticache describe-cache-nodes --cache-cluster-id headband-redis

# Test connectivity (from EC2 or EKS node)
redis-cli -h headband-redis.xxx.ng.0001.use1.cache.amazonaws.com -p 6379 PING
# Expected: PONG
```

### 5. Load Balancer & CDN

```bash
# Verify ALB
aws elbv2 describe-load-balancers --names headband-alb

# Get ALB DNS
aws elbv2 describe-load-balancers \
  --names headband-alb \
  --query 'LoadBalancers[0].DNSName'

# Verify CloudFront
aws cloudfront list-distributions

# Check certificate
aws acm describe-certificate --certificate-arn arn:aws:acm:...
```

### 6. WAF & Security

```bash
# Verify WAF
aws wafv2 list-web-acls --scope REGIONAL --region us-east-1

# Verify VPC Flow Logs
aws ec2 describe-flow-logs --region us-east-1

# Verify CloudTrail
aws cloudtrail describe-trails
```

---

## 📊 Infrastructure Validation Checklist

### AWS Account Setup ✅
- [ ] AWS account active and billing configured
- [ ] IAM user with appropriate permissions
- [ ] AWS CLI installed and configured
- [ ] Credentials verified with `aws sts get-caller-identity`

### Terraform Setup ✅
- [ ] Terraform installed (v1.6.0+)
- [ ] Terraform files validated with `terraform validate`
- [ ] Backend configured (local or remote)
- [ ] Variables configured in terraform.tfvars

### Pre-Deployment ✅
- [ ] Plan reviewed and approved
- [ ] Security validation passed (Checkov)
- [ ] Cost estimation acceptable
- [ ] All required resources in plan
- [ ] No hardcoded secrets

### Infrastructure Deployed ✅
- [ ] All resources created successfully
- [ ] VPC and networking operational
- [ ] EKS cluster running
- [ ] RDS database accessible
- [ ] ElastiCache cluster operational
- [ ] ALB routing traffic
- [ ] CloudFront distribution active
- [ ] WAF rules enabled
- [ ] CloudWatch alarms configured

### Security Validated ✅
- [ ] Security groups configured (least privilege)
- [ ] NACLs configured
- [ ] VPC Flow Logs enabled
- [ ] CloudTrail logging enabled
- [ ] Database encryption enabled
- [ ] Cache encryption enabled
- [ ] SSL/TLS certificates valid

### Monitoring Active ✅
- [ ] CloudWatch dashboards created
- [ ] Alarms testing (optional)
- [ ] SNS notifications working
- [ ] Log groups created
- [ ] Metrics flowing

---

## 🚨 Troubleshooting

### Terraform Plan Fails

```bash
# Check credentials
aws sts get-caller-identity

# Check permissions
aws iam get-user

# Validate configuration
terraform validate

# Check for syntax errors
terraform fmt
```

### Resource Creation Fails

```bash
# Check AWS limits
aws service-quotas list-service-quotas --service-code ec2

# Review CloudFormation events
aws cloudformation describe-stack-events

# Check IAM permissions in detail
aws iam simulate-principal-policy --policy-source-arn ...
```

### EKS Cluster Won't Connect

```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name headband-eks

# Check security groups
aws ec2 describe-security-groups --filters "Name=group-name,Values=eks-cluster-sg-*"

# Verify IAM role
aws iam get-role --role-name eks-service-role
```

---

## ✨ Success Criteria

| Check | Expected | Status |
|-------|----------|--------|
| AWS Account | Active | ✓ |
| AWS CLI | Configured | ✓ |
| Terraform | Validated | ✓ |
| Plan Review | Approved | ✓ |
| Resources | All created | ✓ |
| VPC | Operational | ✓ |
| EKS | Running | ✓ |
| RDS | Accessible | ✓ |
| ElastiCache | Connected | ✓ |
| ALB | Routing | ✓ |
| CloudFront | Active | ✓ |
| WAF | Enabled | ✓ |
| Security | Configured | ✓ |
| Monitoring | Active | ✓ |

---

**Status**: Ready for infrastructure deployment  
**Next**: Production Deployment Guide → Go-Live Checklist

---

Generated: August 29, 2026  
Version: 1.0.0
