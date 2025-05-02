############################
# 5.1. ECS-кластер
############################
resource "aws_ecs_cluster" "tekero" {
  name = "${var.project}-${var.environment}-ecs-cluster"

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

############################
# 5.2. Роль исполнения тасков (Task Execution Role)
############################
data "aws_iam_policy_document" "ecs_task_exec_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "${var.project}-${var.environment}-ecs-task-exec-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_exec_assume.json
}

# Стандартная managed-политику для Fargate execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

############################
# 5.3. Роль для задач (Task Role) – если ваши контейнеры будут обращаться к AWS
############################
data "aws_iam_policy_document" "ecs_task_role_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.project}-${var.environment}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_role_assume.json
}

# Пример: даём таскам доступ читать секрет из SecretsManager
resource "aws_iam_policy" "ecs_task_secrets" {
  name        = "${var.project}-${var.environment}-ecs-task-secrets"
  description = "Allow ECS tasks to read SecretsManager secrets"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = aws_secretsmanager_secret.rds_creds.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_secrets_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_secrets.arn
}

############################
# 5.4. CloudWatch Log Group для контейнеров
############################
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project}-${var.environment}"
  retention_in_days = 14

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}
