#!/bin/bash

###############################################################################
# Deployment Validation Script for Headband
# Validates all components of the Headband infrastructure deployment
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${1:-production}"
LOG_NAMESPACE="${2:-logging}"
TIMEOUT=300
CHECK_INTERVAL=5

# Counters
PASSED=0
FAILED=0
WARNING=0

###############################################################################
# Helper Functions
###############################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
  ((PASSED++))
}

log_error() {
  echo -e "${RED}[✗]${NC} $1"
  ((FAILED++))
}

log_warning() {
  echo -e "${YELLOW}[!]${NC} $1"
  ((WARNING++))
}

log_header() {
  echo ""
  echo -e "${BLUE}=== $1 ===${NC}"
  echo ""
}

###############################################################################
# Validation Functions
###############################################################################

check_namespaces() {
  log_header "Checking Namespaces"
  
  for ns in $NAMESPACE $LOG_NAMESPACE; do
    if kubectl get namespace $ns > /dev/null 2>&1; then
      log_success "Namespace '$ns' exists"
    else
      log_error "Namespace '$ns' does not exist"
      return 1
    fi
  done
}

check_secrets() {
  log_header "Checking Secrets"
  
  local required_secrets=(
    "database-credentials"
    "redis-credentials"
    "jwt-secret"
    "api-keys"
  )
  
  for secret in "${required_secrets[@]}"; do
    if kubectl get secret $secret -n $NAMESPACE > /dev/null 2>&1; then
      log_success "Secret '$secret' exists"
    else
      log_error "Secret '$secret' is missing"
    fi
  done
  
  # Check Elasticsearch credentials
  if kubectl get secret elasticsearch-credentials -n $LOG_NAMESPACE > /dev/null 2>&1; then
    log_success "Secret 'elasticsearch-credentials' exists"
  else
    log_error "Secret 'elasticsearch-credentials' is missing"
  fi
}

check_deployments() {
  log_header "Checking Deployments"
  
  local deployments=(
    "backend"
    "frontend"
    "worker"
  )
  
  for deployment in "${deployments[@]}"; do
    log_info "Checking deployment: $deployment"
    
    # Check if deployment exists
    if kubectl get deployment $deployment -n $NAMESPACE > /dev/null 2>&1; then
      local replicas=$(kubectl get deployment $deployment -n $NAMESPACE \
        -o jsonpath='{.status.replicas}')
      local ready=$(kubectl get deployment $deployment -n $NAMESPACE \
        -o jsonpath='{.status.readyReplicas}')
      
      if [ "$replicas" == "$ready" ] && [ "$ready" -gt "0" ]; then
        log_success "$deployment: All $ready replicas are ready"
      else
        log_warning "$deployment: Only $ready/$replicas replicas ready"
      fi
    else
      log_error "$deployment deployment does not exist"
    fi
  done
}

check_elk_stack() {
  log_header "Checking ELK Stack"
  
  local elk_components=(
    "elasticsearch"
    "kibana"
    "logstash"
  )
  
  for component in "${elk_components[@]}"; do
    log_info "Checking component: $component"
    
    if kubectl get pod -n $LOG_NAMESPACE -l app=$component > /dev/null 2>&1; then
      local pod=$(kubectl get pod -n $LOG_NAMESPACE -l app=$component \
        -o jsonpath='{.items[0].metadata.name}')
      local phase=$(kubectl get pod $pod -n $LOG_NAMESPACE \
        -o jsonpath='{.status.phase}')
      
      if [ "$phase" == "Running" ]; then
        log_success "$component pod ($pod) is running"
      else
        log_warning "$component pod ($pod) is in $phase state"
      fi
    else
      log_error "$component pods do not exist"
    fi
  done
}

check_services() {
  log_header "Checking Services"
  
  local services=(
    "backend:3000"
    "frontend:3000"
    "worker:9090"
    "elasticsearch:9200"
    "kibana:5601"
    "logstash-tcp:5000"
  )
  
  for svc in "${services[@]}"; do
    IFS=':' read -r name port <<< "$svc"
    local ns=$NAMESPACE
    if [[ "$name" == "elasticsearch" ]] || [[ "$name" == "kibana" ]] || [[ "$name" == "logstash-tcp" ]]; then
      ns=$LOG_NAMESPACE
    fi
    
    if kubectl get service $name -n $ns > /dev/null 2>&1; then
      local endpoint=$(kubectl get service $name -n $ns \
        -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
      if [ -z "$endpoint" ]; then
        endpoint=$(kubectl get service $name -n $ns \
          -o jsonpath='{.spec.clusterIP}')
      fi
      log_success "Service '$name' exists (Endpoint: $endpoint)"
    else
      log_error "Service '$name' does not exist"
    fi
  done
}

check_hpas() {
  log_header "Checking Horizontal Pod Autoscalers (HPA)"
  
  local hpas=$(kubectl get hpa -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
  
  if [ -z "$hpas" ]; then
    log_error "No HPAs found in namespace $NAMESPACE"
    return 1
  fi
  
  for hpa in $hpas; do
    local current=$(kubectl get hpa $hpa -n $NAMESPACE \
      -o jsonpath='{.status.currentReplicas}')
    local desired=$(kubectl get hpa $hpa -n $NAMESPACE \
      -o jsonpath='{.status.desiredReplicas}')
    
    log_success "HPA '$hpa': Current=$current, Desired=$desired"
  done
}

check_pdbs() {
  log_header "Checking Pod Disruption Budgets (PDB)"
  
  local pdbs=$(kubectl get pdb -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
  
  if [ -z "$pdbs" ]; then
    log_warning "No PDBs found in namespace $NAMESPACE"
    return 0
  fi
  
  for pdb in $pdbs; do
    local min_available=$(kubectl get pdb $pdb -n $NAMESPACE \
      -o jsonpath='{.spec.minAvailable}')
    local healthy=$(kubectl get pdb $pdb -n $NAMESPACE \
      -o jsonpath='{.status.disruptionsAllowed}')
    
    log_success "PDB '$pdb': MinAvailable=$min_available, DisruptionsAllowed=$healthy"
  done
}

check_endpoints() {
  log_header "Checking Endpoints"
  
  local endpoints=$(kubectl get endpoints -n $NAMESPACE \
    -o jsonpath='{.items[*].metadata.name}')
  
  for endpoint in $endpoints; do
    local ready=$(kubectl get endpoints $endpoint -n $NAMESPACE \
      -o jsonpath='{.subsets[*].addresses[*].ip}' | wc -w)
    
    if [ "$ready" -gt "0" ]; then
      log_success "Endpoint '$endpoint' has $ready ready addresses"
    else
      log_warning "Endpoint '$endpoint' has no ready addresses"
    fi
  done
}

check_events() {
  log_header "Checking Recent Events"
  
  local errors=$(kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | \
    grep -i "error\|failed\|unhealthy" || true)
  
  if [ -z "$errors" ]; then
    log_success "No error events found"
  else
    log_warning "Error events detected:"
    echo "$errors"
  fi
}

check_resource_usage() {
  log_header "Checking Resource Usage"
  
  log_info "Node resources:"
  kubectl top nodes || log_warning "Metrics not available (requires metrics-server)"
  
  echo ""
  log_info "Pod resources (Production namespace):"
  kubectl top pods -n $NAMESPACE || log_warning "Metrics not available"
}

check_logs() {
  log_header "Checking Recent Logs"
  
  local components=("backend" "frontend" "worker")
  
  for component in "${components[@]}"; do
    log_info "Last 5 log entries for $component:"
    kubectl logs -n $NAMESPACE -l app=$component --tail=5 --max-log-requests=1 || \
      log_warning "Could not retrieve logs for $component"
    echo ""
  done
}

check_network_policies() {
  log_header "Checking Network Policies"
  
  local policies=$(kubectl get networkpolicies -n $NAMESPACE \
    -o jsonpath='{.items[*].metadata.name}')
  
  if [ -z "$policies" ]; then
    log_warning "No network policies found"
  else
    for policy in $policies; do
      log_success "Network policy '$policy' exists"
    done
  fi
}

check_rbac() {
  log_header "Checking RBAC Configuration"
  
  local roles=$(kubectl get roles -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
  local rolebindings=$(kubectl get rolebindings -n $NAMESPACE \
    -o jsonpath='{.items[*].metadata.name}')
  
  if [ -z "$roles" ]; then
    log_warning "No roles found"
  else
    for role in $roles; do
      log_success "Role '$role' exists"
    done
  fi
  
  if [ -z "$rolebindings" ]; then
    log_warning "No role bindings found"
  else
    for binding in $rolebindings; do
      log_success "RoleBinding '$binding' exists"
    done
  fi
}

check_storage() {
  log_header "Checking Storage"
  
  local pvcs=$(kubectl get pvc -n $LOG_NAMESPACE -o jsonpath='{.items[*].metadata.name}')
  
  if [ -z "$pvcs" ]; then
    log_warning "No PVCs found"
  else
    for pvc in $pvcs; do
      local status=$(kubectl get pvc $pvc -n $LOG_NAMESPACE \
        -o jsonpath='{.status.phase}')
      if [ "$status" == "Bound" ]; then
        log_success "PVC '$pvc' is bound"
      else
        log_warning "PVC '$pvc' is in $status state"
      fi
    done
  fi
}

###############################################################################
# Main Validation Flow
###############################################################################

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║     Headband Deployment Validation Script                     ║${NC}"
  echo -e "${BLUE}║     Namespace: $NAMESPACE, Logging: $LOG_NAMESPACE            ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  
  # Run all checks
  check_namespaces || true
  check_secrets || true
  check_deployments || true
  check_elk_stack || true
  check_services || true
  check_hpas || true
  check_pdbs || true
  check_endpoints || true
  check_network_policies || true
  check_rbac || true
  check_storage || true
  check_events || true
  check_resource_usage || true
  check_logs || true
  
  # Summary
  log_header "Validation Summary"
  
  echo -e "  ${GREEN}Passed: $PASSED${NC}"
  echo -e "  ${YELLOW}Warnings: $WARNING${NC}"
  echo -e "  ${RED}Failed: $FAILED${NC}"
  echo ""
  
  if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment validation completed successfully!${NC}"
    return 0
  else
    echo -e "${RED}✗ Deployment validation found $FAILED critical issue(s)${NC}"
    return 1
  fi
}

# Run main
main "$@"
