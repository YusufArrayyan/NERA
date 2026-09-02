# Compliance & Security Matrix

## Overview
This document maps Headband infrastructure components to compliance requirements for GDPR, HIPAA, and SOC2.

---

## GDPR Compliance

### Data Protection Requirements

| Requirement | Implementation | Component |
|-------------|-----------------|-----------|
| **Data Encryption at Rest** | RDS encryption with KMS keys | `rds.tf` (Storage encrypted + KMS key) |
| **Data Encryption in Transit** | TLS 1.2+ for all connections | `alb.tf` (HTTPS listener), `security.tf` (transit encryption) |
| **Data Minimization** | Store only necessary data | Application layer (backend design) |
| **Data Retention** | Automated backup retention (30 days) | `rds.tf` (backup_retention_period) |
| **Data Deletion** | Snapshots can be deleted per policy | `rds.tf` (skip_final_snapshot on dev) |
| **Right to Access** | Database query logs | CloudWatch logs retention (30 days) |
| **Right to Erasure** | Supports data deletion in application | RDS has deletion protection for production |

### Access Control

| Requirement | Implementation | Component |
|-------------|-----------------|-----------|
| **Role-Based Access Control** | IAM roles for EKS, RDS, Redis | `eks.tf`, `rds.tf`, `elasticache.tf` |
| **Authentication** | JWT tokens (backend), Secrets Manager | `auth` module in backend |
| **Authorization** | Role-based guards | `auth/guards/roles.guard.ts` |
| **Audit Logging** | VPC Flow Logs + CloudWatch Logs | `security.tf` (VPC Flow Logs) |

---

## HIPAA Compliance

### Technical Safeguards

| Requirement | Implementation | Component |
|-------------|-----------------|-----------|
| **Access Control** | IAM policies + security groups | `main.tf`, `eks.tf` |
| **Audit Controls** | CloudWatch Logs + VPC Flow Logs | `monitoring.tf`, `security.tf` |
| **Integrity Controls** | KMS encryption for sensitive data | `rds.tf`, `elasticache.tf` |
| **Transmission Security** | TLS 1.2+ for all data in transit | `alb.tf` (SSL/TLS), `elasticache.tf` |
| **Encryption** | At-rest encryption for all databases | KMS keys for RDS, Redis auth token |

### Administrative Safeguards

| Requirement | Implementation | Component |
|-------------|-----------------|-----------|
| **Authentication** | Multi-factor auth (via backend) | Application layer |
| **Access Management** | IAM roles + security groups | Infrastructure layer |
| **Security Awareness** | Documented in this file | COMPLIANCE.md |

### Physical Safeguards
- **Data Center Security**: AWS managed (shared responsibility model)
- **Device Security**: EC2 instances in private subnets only
- **Workstation Security**: Application layer responsibility

---

## SOC2 Compliance

### Security (CC)

| Control | Implementation | Component |
|---------|-----------------|-----------|
| **CC6.1 - Logical Access** | IAM roles, security groups | Infrastructure |
| **CC6.2 - Session Management** | JWT tokens with expiration | Backend auth |
| **CC7.2 - System Monitoring** | CloudWatch alarms + logs | `monitoring.tf` |
| **CC7.3 - Logging** | VPC Flow Logs + Application logs | `security.tf` + CloudWatch Logs |
| **CC8.1 - Encryption** | KMS + TLS 1.2+ | `rds.tf`, `alb.tf`, `security.tf` |

### Availability (A)

| Control | Implementation | Component |
|---------|-----------------|-----------|
| **A1.1 - System Availability** | Multi-AZ RDS + EKS auto-scaling | `rds.tf` (multi_az=true), `eks.tf` |
| **A1.2 - Performance** | ALB + CloudFront CDN | `alb.tf`, `cloudfront.tf` |
| **A1.3 - Capacity Management** | Auto-scaling EKS nodes (3-10) | `eks.tf` (scaling_config) |
| **A2.1 - Disaster Recovery** | Automated backups (30 days) | `rds.tf` (backup_retention_period) |

### Processing Integrity (PI)

| Control | Implementation | Component |
|---------|-----------------|-----------|
| **PI1.1 - Data Validation** | Application layer validation | Backend services |
| **PI1.2 - Monitoring** | CloudWatch metrics + alarms | `monitoring.tf` |
| **PI1.3 - Error Handling** | SNS alerts for failures | `monitoring.tf` (SNS topic) |

### Confidentiality (C)

| Control | Implementation | Component |
|---------|-----------------|-----------|
| **C1.1 - Confidentiality** | Encryption at rest + transit | KMS + TLS |
| **C1.2 - Access Control** | IAM + security groups | Infrastructure |

### Privacy (P)

| Control | Implementation | Component |
|---------|-----------------|-----------|
| **P1.1 - Privacy Policies** | Documented in README | Backend documentation |
| **P2.1 - Data Collection** | Minimal, consented data | Application layer |
| **P3.1 - Data Retention** | 30-day retention policy | `rds.tf`, `monitoring.tf` |

---

## AWS Shared Responsibility Model

### AWS Responsibility
- Physical data center security
- Network infrastructure
- Managed service security (EKS, RDS, ElastiCache)
- Compliance certifications (SOC2, ISO 27001, etc.)

### Headband Responsibility
- IAM policy management
- Security group configuration
- Application-level validation
- Data encryption key management
- Access logging review
- Incident response procedures

---

## Implementation Checklist

### Phase 4B (Current)
- [x] VPC with public/private subnets
- [x] EKS cluster with IAM OIDC provider
- [x] RDS PostgreSQL with encryption + Multi-AZ
- [x] ElastiCache Redis with auth token + encryption
- [x] ALB with HTTPS + SSL/TLS
- [x] WAF v2 with managed rules
- [x] VPC Flow Logs
- [x] CloudWatch alarms + SNS notifications
- [x] CloudFront CDN with caching

### Phase 4C (Security Hardening - TODO)
- [ ] Enable VPC endpoint for AWS services
- [ ] Add KMS key policies for least privilege
- [ ] Implement tagging strategy for cost allocation
- [ ] Set up AWS Config for compliance monitoring
- [ ] Create backup testing procedure
- [ ] Document disaster recovery runbook

### Phase 5 (Monitoring & Observability - TODO)
- [ ] Deploy Prometheus + Grafana on EKS
- [ ] Configure ELK stack (Elasticsearch, Logstash, Kibana)
- [ ] Set up distributed tracing (Jaeger/Zipkin)
- [ ] Create runbooks for common alerts

---

## Security Best Practices

### Secrets Management
- **RDS Password**: Stored in AWS Secrets Manager
- **Redis Auth Token**: Stored in AWS Secrets Manager
- **Application Secrets**: Inject via Kubernetes secrets + IRSA

### Network Security
- **Private Subnets**: RDS and EKS nodes in private subnets
- **Security Groups**: Minimal ingress rules (least privilege)
- **WAF Rules**: AWS Managed Rules + rate limiting

### Monitoring & Alerts
- **Critical Alarms**: 6 CloudWatch alarms covering EKS, RDS, ALB, Redis
- **Log Retention**: 30 days for all logs
- **SNS Topic**: Email alerts to `ops@headband.app`

### Encryption
- **At-Rest**: KMS keys for RDS, Redis auth token
- **In-Transit**: TLS 1.2+ for ALB, Redis, RDS (via security groups)

---

## Compliance Testing

### Manual Verification
```bash
# Verify RDS encryption
aws rds describe-db-instances --query 'DBInstances[0].StorageEncrypted'

# Check VPC Flow Logs
aws ec2 describe-flow-logs --query 'FlowLogs[0].FlowLogStatus'

# Verify WAF rules
aws wafv2 get-web-acl --scope CLOUDFRONT --id <ACL_ID>

# Check CloudWatch alarms
aws cloudwatch describe-alarms --query 'MetricAlarms[*].AlarmName'
```

### Automated Compliance Scanning
```bash
# Using AWS Config (optional)
# aws configservice put-config-recorder --config-recorder name=default
```

---

## References
- [GDPR Documentation](https://gdpr-info.eu/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [SOC2 Trust Service Criteria](https://www.aicpa.org/interestareas/informationmanagement/sodp-trust-services-criteria.html)
- [AWS Compliance Programs](https://aws.amazon.com/compliance/)
- [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/)
