variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "headband"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 3000
}

variable "backend_replicas" {
  description = "Number of backend replicas"
  type        = number
  default     = 3
  validation {
    condition     = var.backend_replicas >= 2 && var.backend_replicas <= 10
    error_message = "Backend replicas must be between 2 and 10."
  }
}

variable "frontend_replicas" {
  description = "Number of frontend replicas"
  type        = number
  default     = 3
}

variable "worker_replicas" {
  description = "Number of worker replicas"
  type        = number
  default     = 2
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GB)"
  type        = number
  default     = 100
}

variable "db_backup_retention_days" {
  description = "RDS backup retention days"
  type        = number
  default     = 30
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "enable_multi_az" {
  description = "Enable RDS Multi-AZ"
  type        = bool
  default     = true
}

variable "enable_performance_insights" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = true
}

variable "certificate_arn" {
  description = "SSL certificate ARN from ACM"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "headband.app"
}

variable "api_domain" {
  description = "API domain name"
  type        = string
  default     = "api.headband.app"
}

variable "enable_cloudfront" {
  description = "Enable CloudFront CDN"
  type        = bool
  default     = true
}

variable "enable_waf" {
  description = "Enable AWS WAF"
  type        = bool
  default     = true
}

variable "enable_backup" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Backup retention days"
  type        = number
  default     = 30
}

variable "eks_cluster_version" {
  description = "EKS cluster Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "node_desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 3
}

variable "node_min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 3
}

variable "node_max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 10
}

variable "node_instance_types" {
  description = "EC2 instance types for worker nodes"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Project     = "Headband"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}
