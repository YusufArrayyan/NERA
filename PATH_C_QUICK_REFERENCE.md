# Path C: Quick Reference Card - Comprehensive Deployment

**Print this page. Use during deployment.**

---

## 🎯 Timeline at a Glance

```
T+0:00-0:30   PRE-DEPLOYMENT (30 min)
              ├─ Final checks
              ├─ Team assembly
              └─ Baseline recording

T+0:30-0:50   PHASE 1: TERRAFORM (20 min)
              ├─ terraform plan
              └─ terraform apply

T+0:50-1:00   PHASE 2: DOCKER (10 min)
              ├─ docker build
              └─ docker push

T+1:00-1:10   PHASE 3: DATABASE (10 min)
              ├─ Connect
              └─ Migrations

T+1:10-1:25   PHASE 4: HELM (15 min)
              ├─ helm install
              └─ Wait for pods

T+1:25-1:45   PHASE 5: VERIFICATION (20 min)
              ├─ Health endpoints
              ├─ API tests
              └─ Log analysis

T+1:45-2:45   PHASE 6-7: TESTING (60 min)
              ├─ Database validation
              ├─ Performance tests
              ├─ Feature tests
              └─ CloudWatch check

T+2:45-4:45   MONITORING & REVIEW (120 min)
              ├─ Hour 3: Active monitoring
              └─ Hour 4: Final review

T+4:45        GO/NO-GO DECISION
              └─ Team vote & proceed
```

---

## 📋 Essential Commands

### Pre-Deployment
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check kubectl
kubectl cluster-info

# Verify Helm
helm version

# Test Docker
docker ps
```

### Phase 1: Terraform
```bash
cd terraform
terraform init
terraform plan -out=tfplan-prod
terraform apply tfplan-prod

# Capture outputs
terraform output -json > infrastructure-outputs.json
```

### Phase 2: Docker
```bash
# Build
docker build -t headband-backend:v1.0.0 ./backend
docker build -t headband-frontend:v1.0.0 ./frontend
docker build -t headband-worker:v1.0.0 ./backend/worker

# Tag & Push
ECR_URI=$(jq -r '.ecr_repository_uri.value' infrastructure-outputs.json)
docker push $ECR_URI/headband-backend:v1.0.0
docker push $ECR_URI/headband-frontend:v1.0.0
docker push $ECR_URI/headband-worker:v1.0.0
```

### Phase 3: Database
```bash
cd backend
npm run migrate:prod

# Verify
RDS_ENDPOINT=$(jq -r '.rds_endpoint.value' infrastructure-outputs.json)
psql -h $RDS_ENDPOINT -U postgres -d headband -c "\dt"
```

### Phase 4: Helm
```bash
helm install headband ./helm \
  -f helm/values-prod.yaml \
  -n production \
  --wait \
  --timeout 10m

# Watch pods
kubectl get pods -n production -w

# Verify
kubectl get pods -n production
kubectl get svc -n production
```

### Phase 5: Verification
```bash
# Get ALB DNS
ALB_DNS=$(jq -r '.alb_dns_name.value' infrastructure-outputs.json)

# Test health
curl -i http://$ALB_DNS/health

# Check logs
kubectl logs -n production -l app=headband --tail=20
```

---

## ✅ Validation Checkpoints

### After Each Phase

**Phase 1 Complete?**
```
[ ] Terraform apply finished
[ ] EKS status: ACTIVE
[ ] RDS status: available
[ ] kubectl access works
```

**Phase 2 Complete?**
```
[ ] All 3 images built
[ ] All images in ECR
[ ] Image sizes <300MB
```

**Phase 3 Complete?**
```
[ ] Database connected
[ ] Migrations ran
[ ] 12+ tables exist
```

**Phase 4 Complete?**
```
[ ] All pods Running
[ ] All pods Ready (1/1)
[ ] Services have IPs
```

**Phase 5 Complete?**
```
[ ] /health → 200 OK
[ ] Logs clean (no errors)
[ ] All endpoints responding
```

**Phase 6-7 Complete?**
```
[ ] Smoke tests PASS
[ ] Performance OK
[ ] Error rate <0.1%
[ ] All systems online
```

---

## 🚨 Troubleshooting Quick Links

| Problem | First Step | Then |
|---------|-----------|------|
| Terraform fails | Check AWS credentials | Review error message, fix, retry |
| Docker build fails | Check docker daemon | Review Dockerfile, fix, rebuild |
| Database won't connect | Check RDS endpoint | Verify security groups |
| Pods won't start | Check logs | Check image, resource limits |
| Health check fails | Port forward & test | Check application logs |
| High error rate | Check logs | Check database connection |

---

## 📞 Team Roles

```
Tech Lead:            OVERALL COORDINATION
├─ Decisions
├─ Escalations
└─ Sign-off

DevOps Lead:          INFRASTRUCTURE
├─ Terraform
├─ AWS console
└─ Kubernetes

Backend Lead:         APPLICATION
├─ Database
├─ API tests
└─ Logs

Frontend Lead:        USER INTERFACE
├─ Frontend build
├─ Browser testing
└─ UI verification

QA Lead:              TESTING
├─ Test execution
├─ Metrics
└─ Validation

Project Manager:      COMMUNICATION
├─ Status updates
├─ Documentation
└─ Escalations
```

---

## 📊 Success Metrics

**Must ALL be true for GO decision:**

```
✅ All pods Running & Ready
✅ Error rate < 0.5%
✅ API latency p95 < 200ms
✅ No pod restarts
✅ Database responsive
✅ Cache working
✅ Logs clean
✅ Team confident
```

**If ANY fail → INVESTIGATE before proceeding**

---

## 🎬 Key Decisions

### At T+30 min (Before Phase 1)
**Question**: Ready to apply Terraform?
- ✅ YES: Proceed to Phase 1
- ❌ NO: Fix blocking issue

### At T+1:00 (Before Phase 3)
**Question**: Docker images pushed successfully?
- ✅ YES: Proceed to Phase 3
- ❌ NO: Rebuild and retry

### At T+1:45 (Before Phase 6)
**Question**: All pods healthy?
- ✅ YES: Proceed to testing
- ❌ NO: Debug pod issues

### At T+4:45 (Final Decision)
**Question**: Ready for production?
- ✅ GO: Update status page, proceed
- ❌ NO-GO: Execute rollback

---

## 📝 Documentation

**Primary**: PATH_C_COMPREHENSIVE_DEPLOYMENT.md (detailed steps)

**Supporting**:
- PRODUCTION_DEPLOYMENT.md
- APPLICATION_TEAM_BRIEFING.md
- INFRASTRUCTURE_TEAM_BRIEFING.md
- GO_LIVE_CHECKLIST.md

---

## ⏰ Time Check

```
IDEAL TIMELINE:

T+0:00  Start
T+0:30  Infrastructure complete
T+1:00  Docker complete
T+1:10  Database complete
T+1:25  Helm deployment complete
T+1:45  Verification complete
T+2:45  Testing & validation complete
T+4:45  Decision time
```

**If behind schedule at any point:** Communicate delay to team

---

## 🎯 Final GO/NO-GO Votes

```
Vote by consensus:

Tech Lead:        [ ] GO [ ] NO-GO
DevOps Lead:      [ ] GO [ ] NO-GO
Backend Lead:     [ ] GO [ ] NO-GO
Frontend Lead:    [ ] GO [ ] NO-GO
QA Lead:          [ ] GO [ ] NO-GO

Decision:         [ ] GO [ ] NO-GO

Time: ___________
```

---

## 🎊 If GO Decision

1. ✅ Update status page: "OPERATIONAL"
2. ✅ Send success email
3. ✅ Begin 24-hour monitoring
4. ✅ Document results
5. ✅ Team celebration 🎉

---

**NEXT**: Follow PATH_C_COMPREHENSIVE_DEPLOYMENT.md in detail

**Questions?**: Ask Tech Lead or check APPLICATION_TEAM_BRIEFING.md
