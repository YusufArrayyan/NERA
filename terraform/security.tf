# AWS WAF Web ACL
resource "aws_wafv2_web_acl" "main" {
  count   = var.enable_waf ? 1 : 0
  name    = "${var.app_name}-waf"
  scope   = "CLOUDFRONT"
  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.app_name}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.app_name}-core-rules"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.app_name}-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - SQL Injection Protection
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 4

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.app_name}-sqli-rules"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.app_name}-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "${var.app_name}-waf"
  }
}

# WAF Logging Configuration
resource "aws_cloudwatch_log_group" "waf_log_group" {
  count             = var.enable_waf ? 1 : 0
  name              = "aws-waf-logs-${var.app_name}"
  retention_in_days = 30

  tags = {
    Name = "${var.app_name}-waf-logs"
  }
}

resource "aws_wafv2_web_acl_logging_configuration" "main" {
  count                   = var.enable_waf ? 1 : 0
  resource_arn            = aws_wafv2_web_acl.main[0].arn
  log_destination_configs = [aws_cloudwatch_log_group.waf_log_group[0].arn]

  redacted_fields {
    single_header {
      name = "authorization"
    }
  }
}

# Associate WAF with CloudFront
resource "aws_wafv2_web_acl_association" "cloudfront" {
  count        = var.enable_waf && var.enable_cloudfront ? 1 : 0
  resource_arn = aws_cloudfront_distribution.main[0].arn
  web_acl_arn  = aws_wafv2_web_acl.main[0].arn
}

# DDoS Protection (Shield Advanced - Optional)
# Uncomment to enable:
# resource "aws_shield_protection" "alb" {
#   count        = var.enable_shield_advanced ? 1 : 0
#   name         = "${var.app_name}-shield"
#   resource_arn = aws_lb.main.arn
# }

# VPC Flow Logs
resource "aws_flow_log" "vpc" {
  iam_role_arn    = aws_iam_role.vpc_flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-vpc-flow-logs"
  }
}

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/flow-logs/${var.app_name}"
  retention_in_days = 30

  tags = {
    Name = "${var.app_name}-vpc-flow-logs"
  }
}

resource "aws_iam_role" "vpc_flow_logs" {
  name = "${var.app_name}-vpc-flow-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "vpc_flow_logs" {
  name = "${var.app_name}-vpc-flow-logs-policy"
  role = aws_iam_role.vpc_flow_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# S3 Bucket Encryption and Versioning (already in ALB + CloudFront logs)
# Add additional security scanning
resource "aws_s3_bucket_versioning" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Outputs
output "waf_web_acl_arn" {
  value = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : null
}

output "vpc_flow_log_group" {
  value = aws_cloudwatch_log_group.vpc_flow_logs.name
}
