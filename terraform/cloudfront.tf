# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  count = var.enable_cloudfront ? 1 : 0

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # Logging
  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.cloudfront_logs[0].domain_name
    prefix          = "cloudfront"
  }

  # Default Cache Behavior (Frontend)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb"

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
      headers = ["Host", "Authorization"]
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Cache Behavior for API
  cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb"

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
      headers = ["*"]
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  # Static assets caching
  cache_behavior {
    path_pattern     = "/static/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    # For custom domain, use:
    # acm_certificate_arn      = var.certificate_arn
    # ssl_support_method       = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.app_name}-cdn"
  }

  depends_on = [aws_s3_bucket.cloudfront_logs]
}

# S3 Bucket for CloudFront Logs
resource "aws_s3_bucket" "cloudfront_logs" {
  count  = var.enable_cloudfront ? 1 : 0
  bucket = "${var.app_name}-cloudfront-logs-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.app_name}-cloudfront-logs"
  }
}

resource "aws_s3_bucket_versioning" "cloudfront_logs" {
  count  = var.enable_cloudfront ? 1 : 0
  bucket = aws_s3_bucket.cloudfront_logs[0].id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudfront_logs" {
  count  = var.enable_cloudfront ? 1 : 0
  bucket = aws_s3_bucket.cloudfront_logs[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "cloudfront_logs" {
  count  = var.enable_cloudfront ? 1 : 0
  bucket = aws_s3_bucket.cloudfront_logs[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Outputs
output "cloudfront_domain_name" {
  value = var.enable_cloudfront ? aws_cloudfront_distribution.main[0].domain_name : null
}

output "cloudfront_distribution_id" {
  value = var.enable_cloudfront ? aws_cloudfront_distribution.main[0].id : null
}
