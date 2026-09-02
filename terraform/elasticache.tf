# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.app_name}-cache-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.app_name}-cache-subnet-group"
  }
}

# ElastiCache Replication Group (Redis)
resource "aws_elasticache_replication_group" "main" {
  replication_group_description = "Redis cluster for ${var.app_name}"
  engine                        = "redis"
  engine_version               = "7.0"
  node_type                    = var.redis_node_type
  num_cache_clusters           = var.environment == "production" ? 3 : 2
  parameter_group_name         = aws_elasticache_parameter_group.main.name
  port                         = 6379
  subnet_group_name            = aws_elasticache_subnet_group.main.name
  security_group_ids           = [aws_security_group.redis.id]

  # Automatic failover
  automatic_failover_enabled = var.environment == "production" ? true : false

  # Multi-AZ
  multi_az_enabled = var.environment == "production" ? true : false

  # Encryption
  at_rest_encryption_enabled = true
  auth_token                 = random_password.redis_auth_token.result
  transit_encryption_enabled = true
  auth_token_update_strategy = "ROTATE"

  # Backup
  snapshot_retention_limit = var.environment == "production" ? 5 : 1
  snapshot_window         = "03:00-05:00"

  # Maintenance
  maintenance_window = "sun:05:00-sun:06:00"

  # Logs
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_logs.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
    enabled          = true
  }

  notification_topic_arn = var.environment == "production" ? aws_sns_topic.alerts.arn : null

  tags = {
    Name = "${var.app_name}-redis"
  }

  depends_on = [aws_elasticache_parameter_group.main]
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  name   = "${var.app_name}-redis-params"
  family = "redis7"

  # Performance tuning
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }

  parameter {
    name  = "timeout"
    value = "0"
  }

  tags = {
    Name = "${var.app_name}-redis-params"
  }
}

# Random auth token for Redis
resource "random_password" "redis_auth_token" {
  length  = 32
  special = true
}

# CloudWatch Log Group for Redis
resource "aws_cloudwatch_log_group" "redis_logs" {
  name              = "/aws/elasticache/${var.app_name}-redis"
  retention_in_days = 7

  tags = {
    Name = "${var.app_name}-redis-logs"
  }
}

# Store auth token in Secrets Manager
resource "aws_secretsmanager_secret" "redis_auth_token" {
  name                    = "${var.app_name}/redis/auth-token"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.app_name}-redis-auth-token"
  }
}

resource "aws_secretsmanager_secret_version" "redis_auth_token" {
  secret_id = aws_secretsmanager_secret.redis_auth_token.id
  secret_string = jsonencode({
    auth_token = random_password.redis_auth_token.result
    host       = aws_elasticache_replication_group.main.primary_endpoint_address
    port       = 6379
  })
}

# Outputs
output "redis_endpoint" {
  value = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "redis_port" {
  value = aws_elasticache_replication_group.main.port
}

output "redis_engine_version" {
  value = aws_elasticache_replication_group.main.engine_version
}
