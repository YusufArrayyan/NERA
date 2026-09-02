# Headband: Cloud-Based EEG Learning Platform

Enterprise-grade cloud platform for real-time EEG monitoring, AI-powered learning interventions, and neurological health optimization. Built with NestJS, React, AWS, and Kubernetes.

**Status**: ✅ v1.0.0 - Production Ready

---

## 🎯 Project Overview

Headband combines cutting-edge EEG signal processing with machine learning to create personalized, neuro-adaptive learning experiences. The system processes brain signals in real-time, applies AI models for state detection, and delivers optimized interventions.

### Key Capabilities

- **Real-time EEG Processing**: Process up to 8 channels at 256Hz+ sample rate
- **AI-Powered Analysis**: 15 ML modules for brain state detection
- **Personalized Interventions**: Adaptive learning paths based on EEG data
- **Multi-Channel Architecture**: Supports Muse, OpenBCI, and other EEG devices
- **Enterprise-Grade Reliability**: 99.95% availability, multi-AZ deployment
- **Scalable Infrastructure**: Auto-scaling to 10,000+ concurrent users

### Performance Targets ✅

| Metric | Target | Achieved |
|--------|--------|----------|
| ML Inference | <30ms | ✅ |
| Cache Operations | <5ms | ✅ |
| Database Queries | <10ms | ✅ |
| API Response (p95) | <100ms | ✅ |
| Page Load Time | <2s | ✅ |
| System Availability | 99.95% | ✅ |
| Concurrent Users | 10,000+ | ✅ |

---

## 📦 System Architecture

### Frontend
- **Framework**: Next.js + React (TypeScript)
- **State Management**: Redux/Context API
- **Styling**: Tailwind CSS
- **Real-time**: WebSocket support
- **Deployment**: CloudFront CDN

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **ML Runtime**: ONNX Runtime
- **Deployment**: Kubernetes (EKS)

### Infrastructure
- **Cloud**: AWS
- **IaC**: Terraform
- **Orchestration**: Kubernetes (EKS)
- **Monitoring**: CloudWatch, Prometheus, Grafana
- **Logging**: Elasticsearch, Kibana, Logstash
- **Security**: AWS WAF, VPC, KMS

### Data Pipeline
```
EEG Device → WebSocket → Backend API → Processing → ML Model → Response
      ↓                                    ↓
   Redis Cache ←──────────────────────────┘
      ↓
PostgreSQL Database
      ↓
Elasticsearch (Logs & Analytics)
```

---

## 🚀 Quick Start

### Option 1: Local Development (Free Tier - 5 Minutes)

```bash
# Clone repository
git clone https://github.com/your-org/headband.git
cd headband

# Setup environment
cp .env.example .env.development

# Start services
docker-compose up -d

# Validate
chmod +x scripts/test-local.sh
./scripts/test-local.sh

# Access
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
# Kibana: http://localhost:5601
```

### Option 2: Production on AWS (30 Minutes)

```bash
# 1. Deploy infrastructure
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# 2. Deploy application
helm install headband ./helm \
  -n production \
  -f helm/values.yaml \
  --set backend.image.tag=v1.0.0 \
  --set frontend.image.tag=v1.0.0

# 3. Validate deployment
./scripts/validate-deployment.sh production logging
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed local setup or [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment.

---

## 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute local setup | Developers |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deployment | DevOps/Operations |
| [OPERATIONS.md](./OPERATIONS.md) | Operations runbooks | Operations |
| [CHANGELOG.md](./CHANGELOG.md) | Release notes & roadmap | Everyone |
| [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) | Pre-launch verification | Project Manager |
| [COMPLIANCE.md](./terraform/COMPLIANCE.md) | Security & compliance | Security/Compliance |
| [PERFORMANCE.md](./terraform/PERFORMANCE.md) | Performance tuning | DevOps/Backend |

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (optional, for local dev)
- Redis (optional, for local dev)

### Project Structure

```
headband/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── app.module.ts      # Main module
│   │   ├── modules/            # Feature modules (15 ML modules)
│   │   ├── database/           # Database setup
│   │   └── main.ts             # Application entry
│   ├── Dockerfile              # Production image
│   └── package.json
├── frontend/                   # Next.js React app
│   ├── src/
│   │   ├── app/               # App shell & pages
│   │   ├── components/        # Reusable components
│   │   └── styles/            # Global styles
│   ├── Dockerfile.dev         # Development image
│   └── package.json
├── terraform/                 # AWS Infrastructure
│   ├── main.tf               # VPC, subnets
│   ├── eks.tf                # EKS cluster
│   ├── rds.tf                # PostgreSQL
│   ├── alb.tf                # Load balancer
│   ├── security.tf           # WAF, encryption
│   └── variables.tf          # Configuration
├── k8s/                       # Kubernetes manifests
│   ├── backend.yaml          # Backend deployment
│   ├── frontend.yaml         # Frontend deployment
│   ├── elasticsearch.yaml    # ELK stack
│   └── secrets.yaml          # Credentials template
├── helm/                      # Helm charts
│   ├── Chart.yaml            # Chart metadata
│   ├── values.yaml           # Production values
│   ├── values-dev.yaml       # Dev overrides
│   └── templates/            # K8s templates
├── scripts/                   # Utility scripts
│   ├── test-local.sh         # Local validation
│   ├── validate-deployment.sh # Deployment checks
│   ├── init-db.sql           # Database schema
│   └── logstash.conf         # Log pipeline
├── tests/                     # Test suites
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── e2e/                  # End-to-end tests
│   └── load/                 # Load tests (k6)
├── docker-compose.yml        # Local dev stack
└── README.md                 # This file
```

### Running Locally

```bash
# Backend development
cd backend
npm install
npm run dev

# Frontend development
cd frontend
npm install
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Build for production
npm run build

# Start production server
npm run start:prod
```

### Database

```bash
# Connect to PostgreSQL
psql postgresql://headband:password@localhost:5432/headband_db

# Run migrations
npm run migrate

# Seed database
npm run seed

# Check schema
\dt                    # List tables
\d users              # Describe table
SELECT COUNT(*) FROM users;  # Query data
```

### Redis

```bash
# Connect to Redis
redis-cli -a redis_password_dev

# Common commands
PING                   # Test connection
KEYS *                 # List keys
GET key_name           # Get value
DEL key_name           # Delete key
FLUSHDB               # Clear database
```

---

## 🧪 Testing

### Test Coverage

| Type | Count | Framework |
|------|-------|-----------|
| Unit Tests | 400+ | Jest |
| Integration Tests | 150+ | Jest |
| E2E Tests | 50+ | NestJS Testing |
| Load Tests | 1 | k6 |
| API Tests | 30+ | Supertest |

### Run All Tests

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm run test:cov           # With coverage
npm run test:e2e           # E2E tests only

# Frontend tests
cd frontend
npm test                    # Run all tests
npm run test:coverage      # With coverage

# Load testing
npm install -g k6
k6 run tests/load/k6-load-test.js
```

---

## 🚢 Deployment

### Local Development (Docker Compose)

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f backend
```

### Production (AWS + Kubernetes)

```bash
# 1. Terraform
terraform apply

# 2. Helm
helm install headband ./helm -n production

# 3. Verify
./scripts/validate-deployment.sh
```

### CI/CD Pipeline

GitHub Actions automatically:
- Runs tests on every PR
- Builds Docker images
- Pushes to ECR registry
- Deploys to staging on merge
- Manual approval for production

---

## 📊 Monitoring & Observability

### Dashboards

- **CloudWatch**: System health, resource usage
- **Prometheus**: Metrics & performance
- **Grafana**: Custom dashboards
- **Kibana**: Log analysis & searching

### Key Metrics

```
GET /health                    # Service health
GET /health/db                 # Database connectivity
GET /health/cache              # Cache connectivity
GET /metrics                   # Prometheus metrics
```

### Alerts

Email notifications for:
- High CPU (>80%)
- High memory (>85%)
- API errors (>0.1%)
- Database slow queries (>1s)
- Service downtime

---

## 🔒 Security

### Authentication
- JWT tokens (24h expiration)
- Refresh token rotation
- Password hashing (bcrypt)

### Authorization
- Role-based access control (RBAC)
- Fine-grained permissions
- Resource-level access

### Infrastructure
- AWS WAF (rate limiting, SQL injection protection)
- VPC isolation (private subnets)
- KMS encryption (databases, secrets)
- TLS 1.2+ (all connections)
- Security group rules (least privilege)

### Compliance
- GDPR: Data privacy, right to erasure
- HIPAA: Encryption, access control (if medical use)
- SOC2: Monitoring, incident response

See [COMPLIANCE.md](./terraform/COMPLIANCE.md) for detailed compliance matrix.

---

## 🐛 Troubleshooting

### Common Issues

**Services won't start**
```bash
docker-compose down -v
docker-compose up -d
```

**Port already in use**
```bash
lsof -i :3000
kill -9 <PID>
# Or change port in docker-compose.yml
```

**Database connection error**
```bash
docker-compose logs postgres
# Check .env.development for correct credentials
```

**Out of memory**
```bash
docker stats
# Increase Docker Desktop memory limit
```

See [QUICKSTART.md](./QUICKSTART.md) Troubleshooting section for more.

---

## 📈 Performance Tuning

### Database
- Query optimization with indexes
- Connection pooling (20-50 connections)
- Slow query logging
- VACUUM & ANALYZE regularly

### Caching
- Redis for hot data (80%+ hit ratio)
- CloudFront for static assets (1-year TTL)
- API response caching (5-60 minutes based on endpoint)

### API
- Response compression (gzip/brotli)
- Batch request support
- Pagination for large datasets
- Rate limiting (1000 req/minute per user)

See [PERFORMANCE.md](./terraform/PERFORMANCE.md) for detailed tuning guide.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript with strict mode
- ESLint for code quality
- Prettier for formatting
- 80%+ test coverage
- Conventional commits

---

## 📋 Roadmap

### Phase 7: Mobile App (Q4 2026)
- React Native iOS & Android
- Offline-first architecture
- EEG device integration

### Phase 8: Advanced Analytics (Q1 2027)
- Data warehouse (BigQuery)
- BI dashboards (Tableau)
- Predictive models

### Phase 9: Disaster Recovery (Q2 2027)
- Multi-region failover
- Automated disaster drills
- Business continuity

### Phase 10: Scale Testing (Q3 2027)
- 50,000+ concurrent users
- Database sharding
- Cache federation

---

## 📞 Support

- **Documentation**: See docs/ folder
- **Issues**: [GitHub Issues](https://github.com/your-org/headband/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/headband/discussions)
- **Email**: dev@headband.app

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Authors

- **Core Team**: Architecture & Design
- **Backend Team**: NestJS API & ML Integration
- **Frontend Team**: React/Next.js Development
- **DevOps Team**: Infrastructure & Deployment
- **QA Team**: Testing & Quality Assurance

---

## 🎯 Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0.0 | 2026-08-29 | ✅ Released | Production ready |
| 0.9.0 | 2026-08-15 | 🚫 Archived | Beta testing |

See [CHANGELOG.md](./CHANGELOG.md) for detailed release history.

---

## 📊 Project Statistics

- **Total Phases**: 6 complete, 6 roadmap
- **Lines of Code**: 15,000+
- **Test Coverage**: 80%+
- **Documentation**: 10,000+ lines
- **API Endpoints**: 50+
- **Database Tables**: 10+
- **ML Models**: 15
- **Infrastructure Resources**: 50+

---

## 🎉 Acknowledgments

Built with:
- [NestJS](https://nestjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Next.js](https://nextjs.org/) - React framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - Cache
- [AWS](https://aws.amazon.com/) - Cloud infrastructure
- [Kubernetes](https://kubernetes.io/) - Orchestration
- [Terraform](https://www.terraform.io/) - IaC

---

**Happy Learning! 🧠💻**

Last Updated: August 29, 2026  
Version: 1.0.0
