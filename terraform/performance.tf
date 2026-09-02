# Performance Optimization Configuration

# CloudFront Cache Policies
resource "aws_cloudfront_cache_policy" "static_assets" {
  count   = var.enable_cloudfront ? 1 : 0
  name    = "${var.app_name}-static-cache-policy"
  comment = "Cache policy for static assets (1 year)"

  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    query_strings_config {
      query_string_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    cookies_config {
      cookie_behavior = "none"
    }
  }
}

# CloudFront Response Headers Policy for compression
resource "aws_cloudfront_response_headers_policy" "compression" {
  count   = var.enable_cloudfront ? 1 : 0
  name    = "${var.app_name}-compression-policy"
  comment = "Enable compression and security headers"

  custom_headers_config {
    items = [
      {
        header   = "Cache-Control"
        override = false
        value    = "max-age=31536000, public, immutable"
      },
      {
        header   = "X-Content-Type-Options"
        override = false
        value    = "nosniff"
      },
      {
        header   = "X-Frame-Options"
        override = false
        value    = "DENY"
      },
      {
        header   = "X-XSS-Protection"
        override = false
        value    = "1; mode=block"
      }
    ]
  }

  gzip_compression {
    enabled = true
  }

  brotli_compression {
    enabled = true
  }
}

# ALB Listener Rule for Gzip Compression
resource "aws_lb_listener_rule" "compression_header" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    http_header {
      http_header_name = "Accept-Encoding"
      values           = ["gzip", "deflate", "br"]
    }
  }
}

# RDS Query Optimization - Read Replica for reporting
resource "aws_db_instance" "read_replica" {
  count              = var.environment == "production" ? 1 : 0
  identifier         = "${var.app_name}-db-read-replica"
  replicate_source_db = aws_db_instance.main.identifier
  instance_class     = "db.t3.small"

  publicly_accessible = false
  skip_final_snapshot = true

  tags = {
    Name = "${var.app_name}-db-read-replica"
  }
}

# ElastiCache Connection Pool Optimization
resource "aws_elasticache_parameter_group" "optimized" {
  name   = "${var.app_name}-redis-optimized"
  family = "redis7"

  # Connection pooling
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }

  # Slowlog for monitoring
  parameter {
    name  = "slowlog-log-slower-than"
    value = "10000"
  }

  parameter {
    name  = "slowlog-max-len"
    value = "128"
  }

  tags = {
    Name = "${var.app_name}-redis-optimized"
  }
}

# CloudWatch Metric for API Response Times
resource "aws_cloudwatch_metric_alarm" "api_latency_p95" {
  alarm_name          = "${var.app_name}-api-p95-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "p95"
  threshold           = 0.1 # 100ms
  alarm_description   = "Alert when API p95 latency exceeds 100ms"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.backend.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# CloudWatch Metric for Cache Hit Ratio
resource "aws_cloudwatch_metric_alarm" "redis_evictions" {
  alarm_name          = "${var.app_name}-redis-evictions"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Evictions"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "Alert on Redis cache evictions"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ReplicationGroupId = aws_elasticache_replication_group.main.id
  }
}

# Outputs
output "performance_metrics" {
  value = {
    alb_dns_name           = aws_lb.main.dns_name
    cache_policy_id        = var.enable_cloudfront ? aws_cloudfront_cache_policy.static_assets[0].id : null
    read_replica_endpoint  = var.environment == "production" ? aws_db_instance.read_replica[0].endpoint : null
  }
}
