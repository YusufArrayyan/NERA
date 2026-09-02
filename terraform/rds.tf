# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.app_name}-db-subnet-group"
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "postgres16"
  name   = "${var.app_name}-db-params"

  # Performance tuning
  parameter {
    name  = "max_connections"
    value = "200"
  }

  parameter {
    name  = "shared_buffers"
    value = "262144" # 2GB for t3.medium
  }

  parameter {
    name  = "effective_cache_size"
    value = "786432" # 6GB
  }

  parameter {
    name  = "work_mem"
    value = "16384" # 16MB
  }

  parameter {
    name  = "maintenance_work_mem"
    value = "65536" # 64MB
  }

  tags = {
    Name = "${var.app_name}-db-params"
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier            = "${var.app_name}-db"
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_allocated_storage
  storage_type         = "gp3"
  storage_iops         = 3000
  storage_throughput   = 125

  db_name              = "headband_db"
  username             = "headband"
  password             = random_password.db_password.result
  parameter_group_name = aws_db_parameter_group.main.name
  db_subnet_group_name = aws_db_subnet_group.main.name

  vpc_security_group_ids = [aws_security_group.rds.id]

  # Backup and Recovery
  backup_retention_period = var.db_backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot  = true

  # High Availability
  multi_az               = var.enable_multi_az
  auto_minor_version_upgrade = true

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]
  monitoring_interval            = 60
  monitoring_role_arn            = aws_iam_role.rds_monitoring.arn

  # Performance
  performance_insights_enabled    = var.enable_performance_insights
  performance_insights_retention_period = 7

  # Security
  publicly_accessible = false
  storage_encrypted   = true
  kms_key_id          = aws_kms_key.rds.arn

  # Deletion protection
  deletion_protection = var.environment == "production" ? true : false
  skip_final_snapshot = var.environment == "production" ? false : true
  final_snapshot_identifier = var.environment == "production" ? "${var.app_name}-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = {
    Name = "${var.app_name}-db"
  }

  depends_on = [aws_iam_role_policy_attachment.rds_monitoring]
}

# KMS Key for RDS Encryption
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "${var.app_name}-rds-key"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.app_name}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# IAM Role for RDS Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.app_name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
  role       = aws_iam_role.rds_monitoring.name
}

# Random password for RDS
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Store password in Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.app_name}/rds/password"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.app_name}-rds-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = "headband"
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.main.endpoint
    port     = 5432
    dbname   = "headband_db"
  })
}

# Outputs
output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "rds_port" {
  value = aws_db_instance.main.port
}

output "rds_database_name" {
  value = aws_db_instance.main.db_name
}

output "rds_username" {
  value = aws_db_instance.main.username
}

output "rds_password_secret_arn" {
  value = aws_secretsmanager_secret.db_password.arn
}
