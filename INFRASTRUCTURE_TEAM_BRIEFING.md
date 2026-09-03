# Infrastructure Team Briefing - AWS Setup & Deployment

**Purpose**: Brief DevOps/Infrastructure team on AWS architecture, Terraform setup, and deployment procedures  
**Duration**: 60 minutes  
**Attendees**: DevOps Lead, Infrastructure Engineer, Cloud Architect, AWS Account Manager (optional)

---

## 📊 Slide 1: AWS Architecture Overview (10 min)

```
HEADBAND v1.0.0 - AWS ARCHITECTURE

AWS Account Structure
├─ Production VPC (primary)
│  ├─ Availability Zone: us-east-1a
│  ├─ Availability Zone: us-east-1b
│  └─ Availability Zone: us-east-1c
├─ NAT Gateways: 2 (HA)
├─ Load Balancers: 1 ALB
├─ RDS Multi-AZ: PostgreSQL
├─ ElastiCache: Redis cluster
└─ Elasticsearch: 3-node cluster

EKS Kubernetes Cluster
├─ Name: headband-prod
├─ Version: 1.27+
├─ Node Groups: 2-3 nodes
├─ Node Type: t3.large (production-grade)
├─ Auto Scaling: Enabled (min: 2, max: 5)
└─ Network Policy: Calico

Data Storage
├─ PostgreSQL RDS
│  ├─ Instance: db.t3.medium
│  ├─ Storage: 100 GB (gp2)
│  ├─ Multi-AZ: Enabled
│  ├─ Backups: Automated daily
│  └─ Retention: 30 days
├─ Redis ElastiCache
│  ├─ Node type: cache.t3.medium
│  ├─ Nodes: 2 (primary + replica)
│  └─ Auto failover: Enabled
└─ Elasticsearch Domain
   ├─ Nodes: 3 dedicated master + 3 data
   ├─ Storage: 100 GB
   ├─ Snapshots: Hourly
   └─ Encryption: At rest + in transit

Monitoring & Logging
├─ CloudWatch: Dashboard + Alarms (6+)
├─ ELK Stack: Elastic logs → Kibana
├─ X-Ray: Distributed tracing
├─ VPC Flow Logs: Network monitoring
└─ CloudTrail: API audit logging

Networking
├─ VPC CIDR: 10.0.0.0/16
├─ Public Subnets: 3 (1 per AZ)
├─ Private Subnets: 3 (1 per AZ)
├─ NAT Gateways: 2 (high availability)
├─ Route Tables: Public + Private
├─ Security Groups: 5 (ALB, EKS, RDS, Redis, ES)
└─ NACLs: Default + custom rules
```

---

## 🏗️ Slide 2: Infrastructure as Code (Terraform) (10 min)

```
TERRAFORM CONFIGURATION

Repository Structure
├─ terraform/
│  ├─ variables.tf (input variables)
│  ├─ outputs.tf (exported values)
│  ├─ main.tf (primary config)
│  ├─ vpc.tf (networking)
│  ├─ eks.tf (Kubernetes)
│  ├─ rds.tf (database)
│  ├─ elasticache.tf (cache)
│  ├─ elasticsearch.tf (search)
│  ├─ security.tf (security groups)
│  ├─ iam.tf (roles & policies)
│  ├─ monitoring.tf (CloudWatch)
│  ├─ alb.tf (load balancer)
│  ├─ dns.tf (Route53)
│  ├─ backup.tf (backup policies)
│  └─ terraform.tfvars (production values)

Terraform Modules
├─ aws-vpc (networking)
├─ aws-eks (Kubernetes)
├─ aws-rds (PostgreSQL)
├─ aws-elasticache (Redis)
├─ aws-elasticsearch (search)
├─ aws-security-groups (firewall rules)
└─ aws-monitoring (CloudWatch)

State Management
├─ Backend: S3
├─ S3 Bucket: headband-terraform-state
├─ DynamoDB Lock: headband-tf-lock
├─ Versioning: Enabled
├─ Encryption: KMS
├─ Access: Restricted to DevOps team
└─ Backups: Continuous replication

Terraform Commands
├─ Init: terraform init -backend-config=...
├─ Plan: terraform plan -var-file=prod.tfvars
├─ Validate: terraform validate
├─ Apply: terraform apply -var-file=prod.tfvars
├─ Destroy: terraform destroy (manual approval)
└─ Import: terraform import aws_rds_cluster.prod arn:...

Code Quality
├─ Linting: terraform fmt, tflint
├─ Validation: terraform validate
├─ Plan review: 2-person approval required
├─ Diff review: All changes reviewed
└─ Version control: Git with PR process
```

---

## 🔐 Slide 3: Security Configuration (15 min)

```
SECURITY POSTURE

IAM Roles & Policies
├─ EKS Service Role: eks-service-role
├─ EKS Node Role: eks-node-role
├─ RDS Enhanced Monitoring: rds-monitoring-role
├─ CloudWatch Logs: logs-policy
├─ S3 Access: s3-full-access (restricted bucket)
├─ Parameter Store: ssm-read-policy
└─ KMS: kms-decrypt-policy

Network Security
├─ VPC: Private subnets for data layer
├─ Security Groups: Least privilege rules
├─ NACLs: Stateless filtering
├─ ALB: Only port 443 (HTTPS) ingress
├─ NAT Gateways: Outbound traffic control
├─ VPC Endpoints: S3, DynamoDB private access
└─ VPC Flow Logs: Network monitoring enabled

Data Encryption
├─ In Transit:
│  ├─ ALB → EKS: TLS 1.2+
│  ├─ EKS → RDS: SSL/TLS
│  ├─ EKS → Redis: TLS
│  ├─ EKS → Elasticsearch: HTTPS
│  └─ Clients → ALB: HTTPS (cert: ACM)
├─ At Rest:
│  ├─ RDS: KMS encryption
│  ├─ EBS: KMS encryption
│  ├─ S3: KMS encryption
│  ├─ Redis: Encryption at rest
│  └─ Elasticsearch: Encryption enabled

SSL/TLS Certificates
├─ Domain: headband.example.com
├─ Certificate: AWS Certificate Manager (ACM)
├─ Type: Wildcard (*.headband.example.com)
├─ Auto-renewal: Enabled
├─ Protocol: HTTPS only (HTTP redirect)
└─ ALB Listener: 443 → target group

Secrets Management
├─ Database password: AWS Secrets Manager
├─ API keys: Parameter Store
├─ JWT secret: Parameter Store
├─ Third-party tokens: Secrets Manager
├─ Rotation: Automatic (90 days)
└─ Access: IAM-based, audit logged

Access Control
├─ AWS Console: MFA required
├─ SSH access: Bastion host
├─ kubectl access: IAM roles mapped
├─ Database: VPC security groups only
├─ S3 buckets: Bucket policy + IAM roles
└─ Audit: CloudTrail + VPC Flow Logs

Compliance
├─ PII: Encrypted at rest
├─ Data residency: us-east-1 region
├─ Backup encryption: KMS
├─ Log retention: 30 days (CloudWatch)
└─ Audit: All API calls logged
```

---

## 📊 Slide 4: Database Architecture (10 min)

```
POSTGRESQL RDS SETUP

Instance Details
├─ Engine: PostgreSQL 14+
├─ Instance class: db.t3.medium
├─ Storage: 100 GB (gp2)
├─ Multi-AZ: Enabled (automatic failover)
├─ Enhanced Monitoring: Enabled
├─ Performance Insights: Enabled
├─ Backup retention: 30 days
├─ Backup window: 02:00 UTC
└─ Maintenance window: Sun 03:00 UTC

Database Schema
├─ Tables: 12
├─ Indexes: 20+
├─ Foreign keys: 8
├─ Views: 3
├─ Functions: 2
└─ Triggers: 4

Connection Details
├─ Endpoint: headband-prod.c9akciq32.us-east-1.rds.amazonaws.com
├─ Port: 5432
├─ Username: postgres
├─ Password: [AWS Secrets Manager]
├─ VPC Security Group: sg-headband-rds
└─ Access: EKS pods only

Performance Tuning
├─ Shared buffers: 256MB
├─ Effective cache size: 1GB
├─ Max connections: 100
├─ Connection pooling: PgBouncer (on EKS)
├─ Query logging: Slow query log
└─ Index usage: Monitored via Enhanced Monitoring

Backup & Recovery
├─ Automated backups: Daily 02:00 UTC
├─ Backup retention: 30 days
├─ Manual snapshots: Before deployment
├─ Point-in-time recovery: Up to 30 days
├─ Restore procedure: RDS restore from snapshot
└─ RTO: 15 minutes, RPO: 1 hour

Monitoring
├─ CPU: CloudWatch alarm at 80%
├─ Storage: CloudWatch alarm at 85%
├─ Connections: Monitor via Enhanced Monitoring
├─ Replication lag: Multi-AZ monitoring
├─ Query performance: Performance Insights
└─ Logs: Query logs to CloudWatch
```

---

## ⚡ Slide 5: Caching & Search (10 min)

```
REDIS ELASTICACHE CLUSTER

Configuration
├─ Engine: Redis 7.0+
├─ Node type: cache.t3.medium
├─ Number of nodes: 2 (primary + replica)
├─ Automatic failover: Enabled
├─ Multi-AZ: Enabled
├─ Port: 6379
├─ Encryption: At rest + in transit
└─ Auth token: AWS Secrets Manager

Use Cases
├─ Session storage (user sessions)
├─ Cache layer (API responses)
├─ Rate limiting (token bucket)
├─ Real-time leaderboards
├─ Job queues (background tasks)
└─ Pub/Sub messaging

Monitoring
├─ CPU: CloudWatch alarm at 75%
├─ Memory: CloudWatch alarm at 80%
├─ Evictions: Alert if >10/min
├─ Connection count: Monitor
├─ Cache hit ratio: Target 85%+
└─ Network throughput: Monitor

ELASTICSEARCH DOMAIN

Configuration
├─ Engine: Elasticsearch 8.0+
├─ Instance type: t3.medium.elasticsearch
├─ Data nodes: 3
├─ Master nodes: 3 (dedicated)
├─ Storage: 100 GB (gp2 EBS)
├─ AZs: 3 (high availability)
├─ Encryption: At rest + in transit
├─ VPC: Enabled (security group restricted)
└─ Access policy: IP-based + VPC

Use Cases
├─ Full-text search (content search)
├─ Analytics (data aggregation)
├─ Logging (centralized logs)
├─ Monitoring (time-series data)
└─ Real-time insights

Indices
├─ logs-* (application logs)
├─ metrics-* (performance metrics)
├─ events-* (user events)
├─ sessions-* (session tracking)
└─ Index rotation: Daily at 00:00 UTC

Monitoring
├─ Cluster health: Green status required
├─ Node count: All 3 active
├─ Disk space: Alert at 80%
├─ JVM memory: Monitor
├─ Index size: Growth trend analysis
└─ Search latency: p95 <100ms

Backup & Snapshots
├─ Snapshots: S3-backed, hourly
├─ Retention: 14 days
├─ Restore: Via snapshot (manual)
└─ RTO: 30 minutes, RPO: 1 hour
```

---

## 🛡️ Slide 6: Load Balancer & DNS (10 min)

```
APPLICATION LOAD BALANCER (ALB)

Configuration
├─ Type: Application Load Balancer
├─ Scheme: Internet-facing
├─ Subnets: Public (3 AZs)
├─ Security groups: sg-alb
├─ Listeners:
│  ├─ Port 80: Redirect to 443
│  └─ Port 443: Forward to EKS
├─ Target groups: 3
│  ├─ Backend (8080)
│  ├─ Frontend (3000)
│  └─ Websocket (8081)
└─ Stickiness: Enabled (1 day)

Health Checks
├─ Backend: /health (200 OK)
├─ Frontend: / (200 OK)
├─ Interval: 30 seconds
├─ Timeout: 5 seconds
├─ Healthy threshold: 2
├─ Unhealthy threshold: 2
└─ Action: Unhealthy → Remove from pool

Routing Rules
├─ /api/* → Backend target group
├─ /ws/* → WebSocket target group
├─ /* → Frontend target group
├─ Host-based: example.com
└─ Path-based: /api, /ws, /static

SSL/TLS
├─ Certificate: ACM (auto-renewal)
├─ Protocol: TLSv1.2, TLSv1.3
├─ Cipher suites: Mozilla modern config
├─ HSTS: Enabled (1 year)
└─ Security headers: Set by ALB

Monitoring
├─ Request count: CloudWatch metric
├─ Target health: All healthy
├─ Response time: p95 <100ms
├─ Error rate: <0.1%
└─ Active connections: Monitor

ROUTE53 DNS CONFIGURATION

Domain Setup
├─ Domain: headband.example.com
├─ Registrar: Route53
├─ NS records: Route53 nameservers
├─ Record type: A alias (weighted routing)
└─ TTL: 300 seconds (5 minutes)

DNS Records
├─ headband.example.com → ALB
├─ api.headband.example.com → ALB (via CNAME)
├─ www.headband.example.com → ALB (via CNAME)
└─ admin.headband.example.com → Separate ALB

Health Checks
├─ Endpoint: /health HTTP
├─ Interval: 30 seconds
├─ Type: HTTP
├─ Action on failure: Failover to secondary (if configured)
└─ Alarm: CloudWatch alarm on health failure

Failover (Optional)
├─ Primary: us-east-1 (active)
├─ Secondary: us-west-2 (standby)
├─ Failover policy: Automatic on health check failure
├─ Failover time: <60 seconds
└─ Data sync: Cross-region replication
```

---

## 📈 Slide 7: Monitoring & Alarms (15 min)

```
CLOUDWATCH MONITORING

Dashboard
├─ Name: headband-production
├─ Widgets: 15+
├─ Refresh: 1 minute
├─ Layout: 3-column
└─ Access: DevOps team

Key Metrics
├─ ALB: Request count, latency, errors
├─ EKS: CPU, memory, pod count
├─ RDS: CPU, storage, connections
├─ Redis: CPU, memory, evictions
├─ Elasticsearch: Cluster health, disk, JVM
└─ Network: Data in/out, errors

Alarms (6+)
├─ ALB response time p95 >500ms → HIGH
├─ EKS node CPU >80% → HIGH
├─ RDS CPU >85% → HIGH
├─ RDS storage >90% → CRITICAL
├─ Redis memory >85% → HIGH
├─ Elasticsearch cluster health RED → CRITICAL
├─ Error rate >1% → HIGH
└─ API latency >200ms → MEDIUM

Notification Channels
├─ SNS topic: headband-alerts
├─ Email: devops-team@company.com
├─ Slack: #headband-alerts (via Lambda)
├─ PagerDuty: Critical alerts
└─ SMS: Critical alerts to on-call

Logs
├─ VPC Flow Logs: Network traffic
├─ CloudTrail: API audit logs
├─ ELK Stack: Application logs
│  ├─ Logs from: EKS pods → Logstash → ES
│  ├─ Retention: 30 days in ES
│  ├─ Archived: S3 long-term (Glacier)
│  └─ Kibana: Log analysis dashboard
└─ RDS Logs: Query logs, error logs

DISTRIBUTED TRACING (X-Ray)

Configuration
├─ Sampling rate: 10% (production)
├─ Trace retention: 7 days
├─ Service map: Auto-generated
└─ Access: DevOps team + backend leads

Captured Data
├─ Request path: Client → ALB → EKS → RDS
├─ Latency: Each service segment
├─ Errors: Exception details
├─ Annotations: User ID, transaction ID
└─ Metadata: Request/response size

Use Cases
├─ Identify latency bottlenecks
├─ Trace failed requests
├─ Understand service dependencies
├─ Performance analysis
└─ Root cause analysis
```

---

## 🚀 Slide 8: Deployment Process (15 min)

```
DEPLOYMENT WORKFLOW

Phase 1: Pre-Deployment (Terraform Validation)
├─ [ ] Review terraform plan
├─ [ ] Validate all resource configurations
├─ [ ] Check security groups rules
├─ [ ] Verify encryption settings
├─ [ ] Confirm backup policies
├─ [ ] Test terraform syntax
└─ [ ] Get 2-person approval

Phase 2: Infrastructure Deployment (Terraform Apply)
├─ Command: terraform apply -var-file=prod.tfvars
├─ Action: Create/update AWS resources
├─ Time: 15-20 minutes
├─ Monitoring: Watch CloudFormation events
├─ Output: Infrastructure IDs and endpoints
└─ Verify: All resources in "Available" state

Phase 3: Docker Image Push
├─ Build image: docker build -t headband:v1.0.0
├─ Tag image: docker tag headband:v1.0.0 [ECR-URI]
├─ Push: docker push [ECR-URI]
├─ Verify: Image appears in ECR console
└─ Time: 5-10 minutes

Phase 4: Database Setup
├─ Connect: psql -h [RDS-endpoint] -U postgres
├─ Migrate: Run Prisma migrations
├─ Seed: Run initial seed data (optional)
├─ Verify: Tables created, data loaded
└─ Time: 5 minutes

Phase 5: Helm Deployment
├─ Command: helm install headband ./helm-charts -f values-prod.yaml
├─ Action: Deploy pods to EKS
├─ Replicas: 2 per service
├─ Time: 10-15 minutes
├─ Monitoring: kubectl get pods
└─ Verify: All pods in "Running" state

Phase 6: Verification
├─ Health checks: /health endpoint
├─ API tests: Smoke test suite
├─ UI tests: User flows
├─ Performance: Latency baselines
└─ Errors: Check logs for issues

Rollback Plan
├─ Helm rollback: helm rollback headband
├─ Time: 2-5 minutes
├─ Verification: Same as Phase 6
└─ Communication: Notify stakeholders

Success Criteria
├─ All pods running
├─ Health checks passing
├─ Error rate <0.1%
├─ API latency <100ms
├─ No critical alarms
└─ All tests passing
```

---

## 📋 Slide 9: Pre-Deployment Checklist (10 min)

```
INFRASTRUCTURE TEAM CHECKLIST

AWS Account
├─ [ ] AWS credentials configured locally
├─ [ ] IAM permissions verified (Terraform actions)
├─ [ ] MFA enabled for console
├─ [ ] Session duration: 1 hour
└─ [ ] Access: Test by running terraform plan

Terraform
├─ [ ] Code review: All files reviewed
├─ [ ] State file: Backup created
├─ [ ] Variables: All values set correctly
├─ [ ] Syntax: terraform validate passing
├─ [ ] Plan approved: 2-person sign-off
├─ [ ] Pre-validated: Test run successful
└─ [ ] Documentation: All outputs documented

AWS Resources
├─ [ ] VPC: Route tables correct
├─ [ ] Security groups: Rules reviewed
├─ [ ] IAM roles: Permissions verified
├─ [ ] Networking: NAT gateways working
├─ [ ] KMS keys: Encryption verified
├─ [ ] ACM certificates: Valid and renewed
└─ [ ] S3 buckets: Versioning enabled

EKS Cluster
├─ [ ] Cluster created and running
├─ [ ] Node groups: 2-3 nodes active
├─ [ ] Worker nodes: Status ready
├─ [ ] Add-ons: VPC CNI, kube-proxy, CoreDNS
├─ [ ] Kubectl: Access verified
├─ [ ] RBAC: Service accounts created
└─ [ ] Network policies: Calico installed

Databases & Cache
├─ [ ] PostgreSQL RDS: Running
├─ [ ] Backup: Snapshot created
├─ [ ] Redis cluster: Running
├─ [ ] Snapshots: Backup created
├─ [ ] Elasticsearch: Cluster health green
├─ [ ] Snapshots: S3 snapshots enabled
└─ [ ] Security groups: Restricted to EKS

Monitoring
├─ [ ] CloudWatch dashboard: Created
├─ [ ] Alarms: 6+ alarms active
├─ [ ] SNS topic: Notifications working
├─ [ ] VPC Flow Logs: Enabled
├─ [ ] ELK stack: Logstash → ES pipeline ready
├─ [ ] CloudTrail: API audit logging enabled
└─ [ ] X-Ray: Sampling configured

Load Balancer & DNS
├─ [ ] ALB: Running in all 3 AZs
├─ [ ] Listeners: 80 → 443, 443 → EKS
├─ [ ] Target groups: Healthy state
├─ [ ] SSL certificate: Valid
├─ [ ] DNS records: Route53 updated
├─ [ ] Health checks: Passing
└─ [ ] HSTS: Enabled

Backup & Disaster Recovery
├─ [ ] RDS backup: Snapshot created
├─ [ ] Redis backup: Snapshot enabled
├─ [ ] Elasticsearch snapshots: Enabled
├─ [ ] Restore procedure: Tested
├─ [ ] RTO: <15 min verified
├─ [ ] RPO: <1 hour verified
└─ [ ] Documentation: Runbooks updated

Sign-Off
├─ Infrastructure lead: _________________
├─ DevOps engineer: _________________
├─ Cloud architect: _________________
└─ Date: _________________
```

---

## ✅ Slide 10: Post-Deployment Verification (10 min)

```
INFRASTRUCTURE VALIDATION

Immediate (First 15 minutes)
├─ [ ] All EKS pods running
├─ [ ] All target groups healthy
├─ [ ] ALB receiving traffic
├─ [ ] DNS resolving correctly
├─ [ ] SSL certificate valid
├─ [ ] RDS connections active
├─ [ ] Redis responding
└─ [ ] Elasticsearch cluster healthy

Short-term (First hour)
├─ [ ] CloudWatch metrics flowing
├─ [ ] Alarms all green
├─ [ ] Logs flowing to ELK
├─ [ ] No errors in CloudTrail
├─ [ ] VPC Flow Logs normal
├─ [ ] Network latency normal
├─ [ ] Database performance normal
└─ [ ] Cache hit ratio >80%

Medium-term (First 24 hours)
├─ [ ] No pod restarts
├─ [ ] No node resets
├─ [ ] Error rate <0.1%
├─ [ ] API latency <100ms
├─ [ ] Cache performance stable
├─ [ ] Database connections stable
├─ [ ] Storage growth normal
└─ [ ] Backup jobs successful

Documentation
├─ [ ] Infrastructure state documented
├─ [ ] Resource IDs recorded
├─ [ ] Endpoint URLs documented
├─ [ ] Credentials rotated
├─ [ ] Runbooks updated
├─ [ ] Lessons learned captured
└─ [ ] Monitoring dashboard saved

Sign-Off
├─ Verified by: _________________
├─ Date: _________________
└─ Status: PRODUCTION READY ✅
```

---

## 📞 Questions & Discussion (10 min)

```
KEY TOPICS TO COVER

1. Terraform State Management
   - Where is state stored?
   - How to recover from state corruption?
   - Backup and restore procedures?

2. Disaster Recovery
   - How long to restore RDS?
   - How to restore Elasticsearch?
   - How to recover from data corruption?

3. Scaling
   - How do we scale the EKS cluster?
   - How to add more nodes?
   - When to scale databases?

4. Monitoring & Alerting
   - What alarms are critical?
   - How to add new alarms?
   - How to suppress false positives?

5. Security
   - How to rotate secrets?
   - How to add new IAM users?
   - How to audit API access?

6. Cost Management
   - Estimated monthly cost?
   - Cost optimization opportunities?
   - Budget alerts configured?

7. Maintenance & Updates
   - RDS patch schedule?
   - EKS cluster upgrade process?
   - Elasticsearch version updates?

8. Support & Escalation
   - Who to contact if issues?
   - On-call rotation?
   - Emergency procedures?
```

---

## 🎯 Next Steps

1. **Immediately after briefing**:
   - ✅ Infrastructure team confirms understanding
   - ✅ All questions answered
   - ✅ Pre-deployment checklist items completed

2. **Before deployment day**:
   - ✅ Run terraform plan (dry run)
   - ✅ Validate all connections
   - ✅ Create database backup
   - ✅ Create infrastructure snapshots

3. **On deployment day**:
   - ✅ Execute terraform apply
   - ✅ Monitor CloudFormation events
   - ✅ Verify all resources created
   - ✅ Update DNS records
   - ✅ Run post-deployment checks

4. **After deployment**:
   - ✅ Document infrastructure changes
   - ✅ Update monitoring dashboards
   - ✅ Verify backup processes
   - ✅ Schedule infrastructure review

---

## 📚 Documentation References

**Files to review with infrastructure team:**

1. **PRODUCTION_DEPLOYMENT.md** - Full deployment procedure
2. **INFRASTRUCTURE_VALIDATION.md** - Pre-deployment checks
3. **GO_LIVE_CHECKLIST.md** - Final verification
4. **terraform/** - All Terraform configuration files
5. **monitoring_dashboards.json** - CloudWatch dashboard
6. **runbooks/** - Operational procedures
7. **disaster_recovery_plan.md** - Backup and restore procedures

---

Generated: August 29, 2026  
Version: 1.0.0
