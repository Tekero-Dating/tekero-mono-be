# Регион AWS
variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-central-1"
}

# (Опционально) путь к файлу с AWS-credentials для локальной работы
variable "aws_credentials_file" {
  description = "Path to AWS credentials file (for local development)"
  type        = string
  default     = "~/.aws/credentials"
}

# (Опционально) имя профиля в credentials-файле
variable "aws_profile" {
  description = "AWS CLI profile name"
  type        = string
  default     = "default"
}

# Среда (dev/stage/prod) — для тегов и key в S3-бэкенде
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

# Тэг проекта (для ресурсов AWS)
variable "project" {
  description = "Project name for tagging"
  type        = string
  default     = "tekero"
}

variable "vpc_cidr" {
  description = "CIDR for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "List of public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "List of private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "db_instance_class" {
  description = "Instance class for RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Storage (GiB) for RDS"
  type        = number
  default     = 20
}

variable "db_engine" {
  description = "Database engine"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Postgres version"
  type        = string
  default     = "15.9"
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "tekero_dev"
}

variable "db_username" {
  description = "Master username for Postgres"
  type        = string
  default     = "tekero"
}
