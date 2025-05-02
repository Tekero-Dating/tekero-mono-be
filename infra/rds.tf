############################################
# rds.tf — создание базы через готовые секреты (правильный)
############################################

variable "db_allowed_cidr" {
  description = "CIDR blocks allowed to connect to RDS"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

############################################
# Отдельные data для rds.tf (чтобы не было конфликтов)
############################################

data "aws_secretsmanager_secret" "rds_db_username" {
  name = "DB_USERNAME"
}

data "aws_secretsmanager_secret_version" "rds_db_username" {
  secret_id = data.aws_secretsmanager_secret.rds_db_username.id
}

data "aws_secretsmanager_secret" "rds_db_password" {
  name = "DB_PASSWORD"
}

data "aws_secretsmanager_secret_version" "rds_db_password" {
  secret_id = data.aws_secretsmanager_secret.rds_db_password.id
}

data "aws_secretsmanager_secret" "rds_db_name" {
  name = "DB_NAME"
}

data "aws_secretsmanager_secret_version" "rds_db_name" {
  secret_id = data.aws_secretsmanager_secret.rds_db_name.id
}

############################################
# Локали для использования значений
############################################

locals {
  db_username_value = trim(data.aws_secretsmanager_secret_version.rds_db_username.secret_string, "\"")
  db_password_value = trim(data.aws_secretsmanager_secret_version.rds_db_password.secret_string, "\"")
  db_name_value     = trim(data.aws_secretsmanager_secret_version.rds_db_name.secret_string, "\"")
}

############################################
# Security Group для базы
############################################

resource "aws_security_group" "rds_public" {
  name        = "${var.project}-${var.environment}-rds-public-sg"
  description = "Allow PostgreSQL access from the Internet"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "PostgreSQL from allowed CIDRs"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.db_allowed_cidr
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

############################################
# Subnet Group для базы
############################################

resource "aws_db_subnet_group" "tekero" {
  name       = "${var.project}-${var.environment}-db-subnet-group"
  subnet_ids = module.vpc.public_subnets

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

############################################
# Само создание базы данных
############################################

resource "aws_db_instance" "tekero" {
  identifier             = "${var.project}-${var.environment}-postgres"
  engine                 = var.db_engine
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  db_name                = local.db_name_value
  username               = local.db_username_value
  password               = local.db_password_value
  port                   = 5432

  db_subnet_group_name   = aws_db_subnet_group.tekero.name
  vpc_security_group_ids = [aws_security_group.rds_public.id]

  publicly_accessible    = true
  skip_final_snapshot    = true
  deletion_protection    = false

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

############################################
# Создание секрета с итоговыми данными о базе
############################################

resource "aws_secretsmanager_secret" "rds_creds" {
  name = "${var.project}-${var.environment}-rds-creds"
  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_secretsmanager_secret_version" "rds_creds_ver" {
  secret_id     = aws_secretsmanager_secret.rds_creds.id
  secret_string = jsonencode({
    username = local.db_username_value
    password = local.db_password_value
    host     = aws_db_instance.tekero.address
    port     = aws_db_instance.tekero.port
    dbname   = local.db_name_value
  })
}
