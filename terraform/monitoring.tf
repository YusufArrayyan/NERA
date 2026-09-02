# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name              = "${var.app_name}-alerts"
  kms_master_key_id = aws_kms_key.sns.id

  tags = {
    Name = "${var.app_name}-alerts"
  }
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "ops@headband.app"
}

# KMS Key for SNS
resource "aws_kms_key" "sns" {
  description             = "KMS key for SNS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "${var.app_name}-sns-key"
  }
}

resource "aws_kms_alias" "sns" {
  name          = "alias/${var.app_name}-sns"
  target_key_id = aws_kms_key.sns.key_id
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/aws/eks/${var.app_name}-backend"
  retention_in_days = 30

  tags = {
    Name = "${var.app_name}-backend-logs"
  }
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/aws/eks/${var.app_name}-frontend"
  retention_in_days = 30

  tags = {
    Name = "${var.app_name}-frontend-logs"
  }
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/aws/eks/${var.app_name}-worker"
  retention_in_days = 30

  tags = {
    Name = "${var.app_name}-worker-logs"
  }
}

# CloudWatch Alarms

# EKS Cluster Health
resource "aws_cloudwatch_metric_alarm" "eks_cluster_health" {
  alarm_name          = "${var.app_name}-eks-cluster-unhealthy"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "node_count"
  namespace           = "AWS/EKS"
  period              = 300
  statistic           = "Average"
  threshold           = 2
  alarm_description   = "Alert when EKS cluster has less than 2 nodes"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_eks_cluster.main.name
  }
}

# RDS CPU Utilization
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.app_name}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when RDS CPU is above 80%"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

# RDS Storage
resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "${var.app_name}-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240 # 10GB
  alarm_description   = "Alert when RDS storage is below 10GB"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}

# ALB Target Health
resource "aws_cloudwatch_metric_alarm" "alb_unhealthy_targets" {
  alarm_name          = "${var.app_name}-alb-unhealthy-targets"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "Alert when ALB has unhealthy targets"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# ALB Response Time
resource "aws_cloudwatch_metric_alarm" "alb_response_time" {
  alarm_name          = "${var.app_name}-alb-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = 1.0 # 1 second
  alarm_description   = "Alert when ALB response time exceeds 1 second"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# ElastiCache CPU
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "${var.app_name}-redis-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 75
  alarm_description   = "Alert when Redis CPU is above 75%"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ReplicationGroupId = aws_elasticache_replication_group.main.id
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.app_name}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EKS", "node_count", { stat = "Average" }],
            ["AWS/RDS", "CPUUtilization", { stat = "Average" }],
            ["AWS/ApplicationELB", "TargetResponseTime", { stat = "Average" }],
            ["AWS/ElastiCache", "CPUUtilization", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "System Health Overview"
        }
      },
      {
        type = "log"
        properties = {
          query   = "fields @timestamp, @message | stats count() by bin(5m)"
          region  = var.aws_region
          title   = "Application Logs"
        }
      }
    ]
  })
}

# Outputs
output "sns_topic_arn" {
  value = aws_sns_topic.alerts.arn
}

output "cloudwatch_log_groups" {
  value = {
    backend = aws_cloudwatch_log_group.backend.name
    frontend = aws_cloudwatch_log_group.frontend.name
    worker = aws_cloudwatch_log_group.worker.name
  }
}
