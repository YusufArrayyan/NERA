# Infrastructure Outputs

# VPC Outputs
output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID"
}

output "vpc_cidr" {
  value       = aws_vpc.main.cidr_block
  description = "VPC CIDR block"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "Public subnet IDs"
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "Private subnet IDs"
}

# EKS Outputs
output "eks_cluster_name" {
  value       = aws_eks_cluster.main.name
  description = "EKS cluster name"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "EKS cluster endpoint"
}

output "eks_cluster_version" {
  value       = aws_eks_cluster.main.version
  description = "EKS cluster version"
}

output "eks_cluster_arn" {
  value       = aws_eks_cluster.main.arn
  description = "EKS cluster ARN"
}

output "eks_cluster_certificate_authority" {
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
  description = "EKS cluster certificate authority data"
}

output "eks_node_group_id" {
  value       = aws_eks_node_group.main.id
  description = "EKS node group ID"
}

output "eks_oidc_provider_arn" {
  value       = aws_iam_openid_connect_provider.cluster.arn
  description = "OIDC provider ARN for IRSA"
}

# RDS Outputs
output "rds_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "RDS endpoint (host:port)"
}

output "rds_address" {
  value       = aws_db_instance.main.address
  description = "RDS endpoint address"
}

output "rds_port" {
  value       = aws_db_instance.main.port
  description = "RDS port"
}

output "rds_database_name" {
  value       = aws_db_instance.main.db_name
  description = "RDS database name"
}

output "rds_username" {
  value       = aws_db_instance.main.username
  sensitive   = true
  description = "RDS master username"
}

output "rds_password_secret_arn" {
  value       = aws_secretsmanager_secret.db_password.arn
  description = "RDS password secret ARN"
}

output "rds_read_replica_endpoint" {
  value       = var.environment == "production" ? aws_db_instance.read_replica[0].endpoint : null
  description = "RDS read replica endpoint (production only)"
}

# ElastiCache Outputs
output "redis_endpoint" {
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  description = "Redis primary endpoint address"
}

output "redis_port" {
  value       = aws_elasticache_replication_group.main.port
  description = "Redis port"
}

output "redis_engine_version" {
  value       = aws_elasticache_replication_group.main.engine_version
  description = "Redis engine version"
}

output "redis_configuration_endpoint" {
  value       = aws_elasticache_replication_group.main.configuration_endpoint_address
  description = "Redis configuration endpoint (cluster mode)"
}

output "redis_auth_token_secret_arn" {
  value       = aws_secretsmanager_secret.redis_auth_token.arn
  description = "Redis auth token secret ARN"
}

# ALB Outputs
output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "ALB DNS name"
}

output "alb_arn" {
  value       = aws_lb.main.arn
  description = "ALB ARN"
}

output "alb_zone_id" {
  value       = aws_lb.main.zone_id
  description = "ALB zone ID"
}

output "backend_target_group_arn" {
  value       = aws_lb_target_group.backend.arn
  description = "Backend target group ARN"
}

output "frontend_target_group_arn" {
  value       = aws_lb_target_group.frontend.arn
  description = "Frontend target group ARN"
}

# CloudFront Outputs
output "cloudfront_domain_name" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.main[0].domain_name : null
  description = "CloudFront distribution domain name"
}

output "cloudfront_distribution_id" {
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.main[0].id : null
  description = "CloudFront distribution ID"
}

# Monitoring Outputs
output "sns_topic_arn" {
  value       = aws_sns_topic.alerts.arn
  description = "SNS alerts topic ARN"
}

output "cloudwatch_log_groups" {
  value = {
    backend      = aws_cloudwatch_log_group.backend.name
    frontend     = aws_cloudwatch_log_group.frontend.name
    worker       = aws_cloudwatch_log_group.worker.name
    vpc_flow_logs = aws_cloudwatch_log_group.vpc_flow_logs.name
    redis_logs   = aws_cloudwatch_log_group.redis_logs.name
  }
  description = "CloudWatch log group names"
}

output "cloudwatch_dashboard_url" {
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
  description = "CloudWatch dashboard URL"
}

# Security Outputs
output "waf_web_acl_arn" {
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : null
  description = "WAF Web ACL ARN"
}

output "vpc_flow_log_group" {
  value       = aws_cloudwatch_log_group.vpc_flow_logs.name
  description = "VPC Flow Logs CloudWatch group"
}

# Security Groups
output "security_groups" {
  value = {
    alb          = aws_security_group.alb.id
    eks_cluster  = aws_security_group.eks_cluster.id
    rds          = aws_security_group.rds.id
    redis        = aws_security_group.redis.id
  }
  description = "Security group IDs"
}

# IAM Roles
output "iam_roles" {
  value = {
    eks_cluster_role    = aws_iam_role.eks_cluster.arn
    eks_node_role       = aws_iam_role.eks_node.arn
    rds_monitoring_role = aws_iam_role.rds_monitoring.arn
    vpc_flow_logs_role  = aws_iam_role.vpc_flow_logs.arn
  }
  description = "IAM role ARNs"
}

# Summary Output
output "infrastructure_summary" {
  value = {
    environment     = var.environment
    region          = var.aws_region
    cluster_name    = aws_eks_cluster.main.name
    database_name   = aws_db_instance.main.db_name
    cache_engine    = aws_elasticache_replication_group.main.engine
    load_balancer   = aws_lb.main.dns_name
    cdn_enabled     = var.enable_cloudfront
    waf_enabled     = var.enable_waf
  }
  description = "Infrastructure summary"
}
