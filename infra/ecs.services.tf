############################################
# ecs-services.tf — Task Definitions & Services
############################################

############################
# 1) Service Discovery (Cloud Map)
############################
############################################
# service-discovery.tf — Cloud Map (Service Discovery)
############################################

resource "aws_service_discovery_private_dns_namespace" "ecs" {
  name = "${var.project}-${var.environment}.local"
  vpc  = module.vpc.vpc_id
  description = "Private DNS namespace for ECS service discovery"
}

resource "aws_service_discovery_service" "redis" {
  name         = "redis"
  namespace_id = aws_service_discovery_private_dns_namespace.ecs.id

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.ecs.id
    routing_policy = "MULTIVALUE"
    dns_records {
      type = "A"
      ttl  = 10
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_service_discovery_service" "rabbitmq" {
  name         = "rabbitmq"
  namespace_id = aws_service_discovery_private_dns_namespace.ecs.id

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.ecs.id
    routing_policy = "MULTIVALUE"
    dns_records {
      type = "A"
      ttl  = 10
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}


############################
# 2) Data sources for all secrets
############################
data "aws_secretsmanager_secret" "db_username"    { name = "DB_USERNAME" }
data "aws_secretsmanager_secret" "db_password"    { name = "DB_PASSWORD" }
data "aws_secretsmanager_secret" "db_name"        { name = "DB_NAME"     }
data "aws_secretsmanager_secret" "db_host"        { name = "DB_HOST"     }

data "aws_secretsmanager_secret" "rmq_url"        { name = "RMQ_URL"     }
data "aws_secretsmanager_secret" "rmq_user"       { name = "RABBITMQ_DEFAULT_USER" }
data "aws_secretsmanager_secret" "rmq_pass"       { name = "RABBITMQ_DEFAULT_PASS" }

data "aws_secretsmanager_secret" "aws_access_key" { name = "AWS_ACCESS_KEY" }
data "aws_secretsmanager_secret" "aws_secret_key" { name = "AWS_SECRET_KEY" }
data "aws_secretsmanager_secret" "aws_s3_bucket"  { name = "AWS_S3_BUCKET" }

data "aws_secretsmanager_secret" "salt"            { name = "SALT" }
data "aws_secretsmanager_secret" "jwt_secret"      { name = "JWT_SECRET" }

############################
# 3) Security Group for ECS tasks
############################
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project}-${var.environment}-ecs-tasks-sg"
  description = "Allow communication between ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "All TCP between tasks"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description     = "Allow traffic from ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    description = "All outbound"
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

############################
# 4) Grafana Task & Service
############################
resource "aws_ecs_task_definition" "grafana" {
  family                   = "${var.project}-${var.environment}-grafana"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name         = "grafana"
    image        = "grafana/grafana:9.0.0"
    essential    = true
    portMappings = [{ containerPort = 3000, protocol = "tcp" }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "grafana"
      }
    }
  }])
}

resource "aws_ecs_service" "grafana" {
  name            = "${var.project}-${var.environment}-grafana"
  cluster         = aws_ecs_cluster.tekero.id
  task_definition = aws_ecs_task_definition.grafana.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.grafana.arn
    container_name   = "grafana"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.grafana]
}

############################
# 5) Prometheus Task & Service
############################
resource "aws_ecs_task_definition" "prometheus" {
  family                   = "${var.project}-${var.environment}-prometheus"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name         = "prometheus"
    image        = "prom/prometheus:latest"
    essential    = true
    portMappings = [{ containerPort = 9090, protocol = "tcp" }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "prometheus"
      }
    }

    # mountPoints = [{
    #   sourceVolume  = "../prometheus/prometheus.yml"
    #   containerPath = "/etc/prometheus"
    #   readOnly      = true
    # }]
  }])
}

resource "aws_ecs_service" "prometheus" {
  name            = "${var.project}-${var.environment}-prometheus"
  cluster         = aws_ecs_cluster.tekero.id
  task_definition = aws_ecs_task_definition.prometheus.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.prometheus.arn
    container_name   = "prometheus"
    container_port   = 9090
  }

  depends_on = [aws_lb_listener.prometheus]
}

############################
# 6) Redis Task & Service (w/ Service Discovery)
############################
resource "aws_ecs_task_definition" "redis" {
  family                   = "${var.project}-${var.environment}-redis"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name         = "redis"
    image        = "redis:7"
    essential    = true
    portMappings = [{ containerPort = 6379, protocol = "tcp" }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "redis"
      }
    }
  }])
}

resource "aws_ecs_service" "redis" {
  name            = "${var.project}-${var.environment}-redis"
  cluster         = aws_ecs_cluster.tekero.id
  task_definition = aws_ecs_task_definition.redis.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.redis.arn
  }
}

############################
# 7) RabbitMQ Task & Service (w/ Service Discovery)
############################
resource "aws_ecs_task_definition" "rabbitmq" {
  family                   = "${var.project}-${var.environment}-rabbitmq"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name         = "rabbitmq"
    image        = "rabbitmq:3-management"
    essential    = true
    portMappings = [
      { containerPort = 5672,  protocol = "tcp" },
      { containerPort = 15672, protocol = "tcp" }
    ]

    secrets = [
      {
        name      = "RABBITMQ_DEFAULT_USER"
        valueFrom = data.aws_secretsmanager_secret.rmq_user.arn
      },
      {
        name      = "RABBITMQ_DEFAULT_PASS"
        valueFrom = data.aws_secretsmanager_secret.rmq_pass.arn
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "rabbitmq"
      }
    }
  }])
}

resource "aws_ecs_service" "rabbitmq" {
  name            = "${var.project}-${var.environment}-rabbitmq"
  cluster         = aws_ecs_cluster.tekero.id
  task_definition = aws_ecs_task_definition.rabbitmq.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.rabbitmq.arn
    container_name   = "rabbitmq"
    container_port   = 15672
  }

  service_registries {
    registry_arn = aws_service_discovery_service.rabbitmq.arn
  }

  depends_on = [aws_lb_listener.rabbitmq]
}

############################
# 8) Tekero Backend Task & Service
############################
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project}-${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "8192"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name         = "tekero-backend"
    image        = "${aws_ecr_repository.tekero_backend.repository_url}:latest"
    essential    = true
    portMappings = [{ containerPort = 3001, protocol = "tcp" }]

    environment = [
      { name = "DB_PORT",               value = "5432" },
      { name = "APP_PORT",              value = "3001" },
      { name = "DB_DRIVER",             value = "postgres" },
      { name = "RMQ_QUEUE_PREFIX",      value = "prod_"   },
      { name = "REDIS_HOST",            value = "redis.${var.project}-${var.environment}.local" },
      { name = "REDIS_PORT",            value = "6379"    },
      { name = "APP_MODE",              value = "dev"     },
      { name = "NODE_ENV",              value = "development" },
      { name = "JWT_TOKEN_TTL",         value = "30m"     },
      { name = "JWT_REFRESH_TOKEN_TTL",  value = "15d"     },
      { name = "APP_HOST",  value = "0.0.0.0"     }
    ]

    secrets = [
      { name = "DB_USERNAME",   valueFrom = data.aws_secretsmanager_secret.db_username.arn },
      { name = "DB_PASSWORD",   valueFrom = data.aws_secretsmanager_secret.db_password.arn },
      { name = "DB_NAME",       valueFrom = data.aws_secretsmanager_secret.db_name.arn     },
      { name = "DB_HOST",       valueFrom = data.aws_secretsmanager_secret.db_host.arn     },
      { name = "RMQ_URL",       valueFrom = data.aws_secretsmanager_secret.rmq_url.arn     },
      { name = "AWS_ACCESS_KEY",valueFrom = data.aws_secretsmanager_secret.aws_access_key.arn },
      { name = "AWS_SECRET_KEY",valueFrom = data.aws_secretsmanager_secret.aws_secret_key.arn },
      { name = "AWS_S3_BUCKET", valueFrom = data.aws_secretsmanager_secret.aws_s3_bucket.arn  },
      { name = "SALT",          valueFrom = data.aws_secretsmanager_secret.salt.arn           },
      { name = "JWT_SECRET",    valueFrom = data.aws_secretsmanager_secret.jwt_secret.arn     }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "backend"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "${var.project}-${var.environment}-backend"
  cluster         = aws_ecs_cluster.tekero.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.tekero_api.arn
    container_name   = "tekero-backend"
    container_port   = 3001
  }

  depends_on = [
    aws_lb_listener.tekero_api,
    aws_ecs_service.redis,
    aws_ecs_service.rabbitmq
  ]
}
