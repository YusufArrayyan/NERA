# Headband Quick Start Guide - Free Tier (Docker Compose)

Get Headband running locally in 5 minutes using Docker Compose. Perfect for development, testing, and local ML model experimentation.

## Prerequisites

### Required Software

- **Docker**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Included with Docker Desktop (v2.0+)
- **Git**: For cloning the repository

### Optional Tools (for testing)

```bash
# macOS (Homebrew)
brew install postgresql redis curl jq

# Ubuntu/Debian
sudo apt-get install postgresql-client redis-tools curl jq

# Windows (Chocolatey)
choco install postgresql redis curl jq
```

## Quick Start (5 Minutes)

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/your-repo/headband-cloudlearning-app.git
cd headband-cloudlearning-app

# Copy environment file
cp .env.example .env.development
```

### 2. Start Services

```bash
# Start all services in background
docker-compose up -d

# Or with logs
docker-compose up

# Check status
docker-compose ps
```

**Expected output:**
```
CONTAINER ID   IMAGE                             STATUS
a1b2c3d4e5f6   postgres:16-alpine               Up 2 minutes (healthy)
b2c3d4e5f6a7   redis:7-alpine                   Up 2 minutes (healthy)
c3d4e5f6a7b8   elasticsearch:8.10.0             Up 2 minutes (healthy)
d4e5f6a7b8c9   kibana:8.10.0                    Up 2 minutes (healthy)
e5f6a7b8c9d0   logstash:8.10.0                  Up 2 minutes
f6a7b8c9d0e1   headband-backend:latest          Up 2 minutes (healthy)
g7b8c9d0e1f2   headband-frontend:latest         Up 2 minutes
h8c9d0e1f2g3   headband-worker:latest           Up 2 minutes
```

### 3. Access Services

Open in your browser:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3001 | Web application |
| **Backend API** | http://localhost:3000 | REST API |
| **API Docs** | http://localhost:3000/api | Swagger/OpenAPI |
| **Kibana** | http://localhost:5601 | Logs & Analytics |

### 4. Validate Installation

```bash
# Run health checks
chmod +x scripts/test-local.sh
./scripts/test-local.sh

# Expected: All tests passed! ✓
```

---

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Database Access

```bash
# Connect to PostgreSQL
psql postgresql://headband:headband_password_dev@localhost:5432/headband_db

# Or via Docker
docker-compose exec postgres psql -U headband -d headband_db

# Common commands:
\dt                    # List tables
\d users              # Describe table
SELECT COUNT(*) FROM users;  # Query
```

### Redis Access

```bash
# Connect to Redis
redis-cli -a redis_password_dev

# Or via Docker
docker-compose exec redis redis-cli -a redis_password_dev

# Common commands:
PING                   # Test connection
KEYS *                 # List all keys
GET key_name           # Get value
DEL key_name           # Delete key
```

### Backend Development

```bash
# Development mode with hot reload
docker-compose up backend

# Or local development (if Node installed):
cd backend
npm install
npm run dev

# The backend auto-reloads when you edit files in src/
```

### Frontend Development

```bash
# Development mode with hot reload
docker-compose up frontend

# Or local development:
cd frontend
npm install
npm run dev

# Open http://localhost:3001
```

### Run Tests

```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests
docker-compose exec frontend npm test

# All tests with coverage
docker-compose exec backend npm run test:cov
```

### Database Migrations

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed data
docker-compose exec backend npm run seed

# Reset database
docker-compose exec postgres psql -U headband -d headband_db \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker daemon
docker ps

# Force rebuild
docker-compose build --no-cache

# Clean up and restart
docker-compose down -v
docker-compose up -d
```

### Port Already in Use

If port 3000 or 3001 is taken:

```bash
# Find process using port
lsof -i :3000
# Or on Windows:
netstat -ano | findstr :3000

# Kill process or change port in docker-compose.yml
```

### Database Connection Error

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Check connection string in .env.development
# Should be: postgresql://headband:headband_password_dev@postgres:5432/headband_db

# Restart PostgreSQL
docker-compose restart postgres
```

### Elasticsearch Issues

```bash
# Check Elasticsearch logs
docker-compose logs elasticsearch

# Reset Elasticsearch data
docker-compose down
docker volume rm headband-cloudlearning-app_elasticsearch_data
docker-compose up elasticsearch
```

### Frontend Not Updating

```bash
# Stop frontend
docker-compose stop frontend

# Clear cache
docker-compose exec frontend rm -rf node_modules .next

# Rebuild and restart
docker-compose build --no-cache frontend
docker-compose up frontend
```

---

## Development Workflow

### 1. Make Code Changes

Edit files in `backend/src/` or `frontend/src/` - they auto-reload.

### 2. Test Changes Locally

```bash
# Health check
curl http://localhost:3000/health

# Run tests
docker-compose exec backend npm test

# View logs
docker-compose logs -f backend
```

### 3. Commit & Push

```bash
git add .
git commit -m "Your commit message"
git push origin your-branch
```

### 4. Deploy to Production

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## Data & Storage

### Database Backups

```bash
# Backup database
docker-compose exec postgres pg_dump -U headband headband_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U headband headband_db < backup.sql
```

### Redis Data

```bash
# Save Redis snapshot
docker-compose exec redis redis-cli BGSAVE

# Check persistence
docker volume ls | grep redis
```

### Elasticsearch Data

```bash
# List indices
curl http://localhost:9200/_cat/indices

# Delete index
curl -X DELETE http://localhost:9200/app-logs-*

# Backup and restore:
# Use Kibana UI or curl API
```

### Persistent Volumes

Data is stored in Docker volumes:

```bash
# List volumes
docker volume ls | grep headband

# Inspect volume
docker volume inspect headband-cloudlearning-app_postgres_data

# Clean up volumes (WARNING: deletes data)
docker-compose down -v
```

---

## Performance Optimization

### Resource Limits

Current docker-compose uses reasonable defaults. Adjust if needed:

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Database Optimization

```bash
# Check query performance
docker-compose exec postgres psql -U headband -d headband_db \
  -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Analyze and reindex
docker-compose exec postgres psql -U headband -d headband_db \
  -c "ANALYZE; REINDEX DATABASE headband_db;"
```

### Memory Usage

```bash
# Check container memory
docker stats headband-postgres headband-redis headband-backend

# If memory high, increase Docker Desktop limit:
# Docker Desktop → Preferences → Resources → Memory
```

---

## Environment Variables

Edit `.env.development` to customize:

```bash
# Application
LOG_LEVEL=debug              # Increase logging
ENABLE_SWAGGER=true          # API docs
ENABLE_DEBUG_ENDPOINTS=true  # Debug endpoints

# Database
DB_POOL_SIZE=20              # Connection pool

# Cache
CACHE_TTL=3600               # Cache timeout (seconds)

# ML Model
ML_BATCH_SIZE=32             # Batch size for inference

# Worker
WORKER_CONCURRENCY=4         # Parallel jobs
```

---

## Monitoring & Observability

### Logs

```bash
# Stream all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Follow with timestamps
docker-compose logs -f --timestamps backend
```

### Metrics

```bash
# CPU & Memory usage
docker stats

# Container resource stats
docker ps --format "table {{.Names}}\t{{.MemUsage}}\t{{.CPUPerc}}"
```

### Health Checks

```bash
# Backend health
curl -s http://localhost:3000/health | jq .

# Database health
docker-compose exec postgres pg_isready -U headband

# Redis health
docker-compose exec redis redis-cli ping

# Elasticsearch health
curl -s http://localhost:9200/_cluster/health | jq .
```

---

## Cleanup

### Stop Services

```bash
# Stop but keep volumes
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

### Clean Up Space

```bash
# Remove unused images
docker image prune

# Remove dangling volumes
docker volume prune

# Full cleanup (WARNING: removes all unused Docker resources)
docker system prune -a --volumes
```

---

## Next Steps

- **Read the code**: Explore `backend/src/` and `frontend/src/`
- **Run tests**: `docker-compose exec backend npm test`
- **Debug**: Use VS Code Remote Containers extension
- **Deploy**: Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for AWS deployment
- **Contribute**: Create a pull request with your changes

---

## Support & Resources

- 📖 [Backend README](./backend/README.md)
- 📖 [Frontend README](./frontend/README.md)
- 🐛 [Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 [Contact](mailto:dev@headband.app)

---

**Happy Coding! 🚀**

Last Updated: August 2026  
Version: 1.0.0
