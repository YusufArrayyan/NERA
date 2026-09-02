# Headband Helm Chart

Production-grade Helm chart for deploying the Headband Cloud Learning application on Kubernetes.

## Overview

This Helm chart packages all components of the Headband application:
- **Backend**: NestJS API service (3-10 replicas, auto-scaling)
- **Frontend**: Next.js web application (3-10 replicas, auto-scaling)
- **Workers**: Background job processors (2-20 replicas, auto-scaling)
- **ELK Stack**: Elasticsearch, Kibana, Logstash for centralized logging
- **Monitoring**: Prometheus, Grafana (optional dependencies)
- **Infrastructure**: Persistent storage, networking, security

## Prerequisites

- Kubernetes 1.20+
- Helm 3.0+
- ECR registry with images pushed
- AWS RDS PostgreSQL and ElastiCache Redis (managed externally)
- SSL/TLS certificate from AWS ACM

## Installation

### 1. Add Helm Repository (if applicable)

```bash
# For bitnami dependencies
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### 2. Create Namespace and Secrets

```bash
# Create production namespace
kubectl create namespace production
kubectl create namespace logging

# Create ECR pull secret (replace with your ECR URI)
kubectl create secret docker-registry ecr-secret \
  --docker-server=123456789012.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region us-east-1) \
  -n production

# Apply secrets
kubectl apply -f k8s/secrets.yaml -n production
```

### 3. Install Chart

#### Production Environment

```bash
helm install headband . \
  -n production \
  -f values.yaml \
  --set global.domain=headband.app \
  --set global.apiDomain=api.headband.app
```

#### Development Environment

```bash
helm install headband . \
  -n production \
  -f values.yaml \
  -f values-development.yaml \
  --set global.domain=dev.headband.app
```

#### Staging Environment

```bash
helm install headband . \
  -n production \
  -f values.yaml \
  -f values-staging.yaml \
  --set global.domain=staging.headband.app
```

### 4. Verify Installation

```bash
# Check release status
helm status headband -n production

# Check pods
kubectl get pods -n production
kubectl get pods -n logging

# Check services
kubectl get svc -n production
kubectl get svc -n logging

# Port forward to test
kubectl port-forward -n production svc/headband-frontend 3000:3000
kubectl port-forward -n logging svc/kibana 5601:5601
```

## Configuration

### Common Parameters

```yaml
# Global
global.environment: production          # dev, staging, production
global.domain: headband.app            # Main domain
global.apiDomain: api.headband.app     # API domain

# Backend
backend.replicaCount: 3                # Min replicas
backend.image.tag: latest              # Image tag
backend.resources.limits.memory: 1Gi   # Memory limit
backend.autoscaling.maxReplicas: 10    # Max replicas

# Frontend
frontend.replicaCount: 3
frontend.image.tag: latest
frontend.ingress.enabled: true

# Worker
worker.replicaCount: 2
worker.autoscaling.maxReplicas: 20

# Monitoring
monitoring.enabled: true
monitoring.alerts.enabled: true
```

### Environment-Specific Values

| Environment | Replicas | Resources | HPA Max | Use Case |
|------------|----------|-----------|---------|----------|
| development | 1 | 256Mi/100m | 3 | Local development |
| staging | 2 | 512Mi/500m | 5 | Pre-production testing |
| production | 3 | 1Gi/1000m | 10-20 | Production workloads |

## Upgrade

```bash
# Update chart dependencies
helm dependency update

# Upgrade release
helm upgrade headband . \
  -n production \
  -f values.yaml \
  --set backend.image.tag=v1.2.3

# Check upgrade status
helm status headband -n production
helm history headband -n production
```

## Rollback

```bash
# Rollback to previous release
helm rollback headband -n production

# Rollback to specific revision
helm rollback headband 2 -n production
```

## Uninstall

```bash
helm uninstall headband -n production
```

## Monitoring and Logs

### View Logs

```bash
# Backend logs
kubectl logs -n production -l app=backend --tail=100 -f

# Frontend logs
kubectl logs -n production -l app=frontend --tail=100 -f

# Elasticsearch logs
kubectl logs -n logging -l app=elasticsearch --tail=100 -f

# Kibana
kubectl port-forward -n logging svc/kibana 5601:5601
# Open http://localhost:5601
```

### Metrics

```bash
# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Open http://localhost:9090

# Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Open http://localhost:3000 (default: admin/admin)
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod
kubectl describe pod -n production POD_NAME

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Check resource availability
kubectl top nodes
kubectl top pods -n production
```

### Image Pull Errors

```bash
# Verify ECR secret
kubectl get secret -n production ecr-secret -o yaml

# Recreate secret if needed
kubectl delete secret ecr-secret -n production
kubectl create secret docker-registry ecr-secret ...
```

### Database Connection Issues

```bash
# Check secret
kubectl get secret -n production database-credentials -o yaml

# Test connection (exec into pod)
kubectl exec -it -n production POD_NAME -- sh
psql -h ENDPOINT -U headband -d headband_db
```

### Elasticsearch Issues

```bash
# Check cluster health
kubectl exec -n logging elasticsearch-0 -- curl -s http://localhost:9200/_cluster/health

# Check indices
kubectl exec -n logging elasticsearch-0 -- curl -s http://localhost:9200/_cat/indices

# Check logs
kubectl logs -n logging elasticsearch-0
```

## Performance Tuning

### Scaling

```bash
# Manual scaling
kubectl scale deployment/headband-backend --replicas=5 -n production

# Update HPA limits
helm upgrade headband . \
  -n production \
  --set backend.autoscaling.maxReplicas=15
```

### Resource Optimization

```bash
# Monitor resource usage
kubectl top pods -n production
kubectl top nodes

# Adjust resource requests/limits in values.yaml
backend:
  resources:
    requests:
      memory: "256Mi"  # Reduce if over-provisioned
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
```

## Security

### Network Policies

```bash
# Verify network policies
kubectl get networkpolicies -n production

# Test connectivity (if desired)
kubectl run test-pod --rm -it --image=busybox -- sh
```

### RBAC

```bash
# Check service account permissions
kubectl get rolebindings -n production
kubectl describe rolebinding headband-backend -n production
```

### Secrets

```bash
# Rotate secrets
kubectl delete secret jwt-secret -n production
kubectl create secret generic jwt-secret --from-literal=secret=NEW_SECRET -n production
```

## Best Practices

1. **Always** use specific image tags (never `latest` in production)
2. **Set** appropriate resource requests and limits
3. **Enable** Pod Disruption Budgets for high availability
4. **Configure** Network Policies for security
5. **Monitor** with Prometheus and alert on critical metrics
6. **Use** separate namespaces for different environments
7. **Store** secrets in AWS Secrets Manager or similar
8. **Regularly** update dependencies and images

## Support

For issues or questions:
- Check logs: `kubectl logs -n production POD_NAME`
- Describe resources: `kubectl describe pod/svc/deployment -n production`
- Review Helm values: `helm values headband -n production`
- Check events: `kubectl get events -n production`

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [ELK Stack](https://www.elastic.co/what-is/elk-stack)
- [Prometheus Operator](https://prometheus-operator.dev/)
