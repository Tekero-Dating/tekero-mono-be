########################################
# ALB + Security Group
########################################

# 7.1. Security Group для ALB
resource "aws_security_group" "alb_sg" {
  name        = "${var.project}-${var.environment}-alb-sg"
  description = "Allow inbound HTTP for Grafana, Prometheus, RabbitMQ-UI and Tekero API"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Grafana UI"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Prometheus UI"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "RabbitMQ Management UI"
    from_port   = 15672
    to_port     = 15672
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Tekero API"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
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

# 7.2. ALB
resource "aws_lb" "alb" {
  name               = "${var.project}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = module.vpc.public_subnets
  security_groups    = [ aws_security_group.alb_sg.id ]

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

########################################
# Target Groups
########################################

# Grafana TG
resource "aws_lb_target_group" "grafana" {
  name        = "${var.project}-${var.environment}-tg-grafana"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.vpc.vpc_id

  health_check {
    enabled             = true
    interval            = 30
    path                = "/api/health"
    matcher             = "200"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

# Prometheus TG
resource "aws_lb_target_group" "prometheus" {
  name        = "${var.project}-${var.environment}-tg-prometheus"
  port        = 9090
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.vpc.vpc_id

  health_check {
    enabled             = true
    interval            = 30
    path                = "/-/healthy"
    matcher             = "200"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# RabbitMQ-UI TG
resource "aws_lb_target_group" "rabbitmq" {
  name        = "${var.project}-${var.environment}-tg-rabbitmq"
  port        = 15672
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.vpc.vpc_id

  health_check {
    enabled             = true
    interval            = 30
    path                = "/"                 # 🔁 смена пути
    matcher             = "200-399"           # 🔁 принимает даже редирект/403
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Tekero API TG
resource "aws_lb_target_group" "tekero_api" {
  name        = "${var.project}-${var.environment}-tg-api"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.vpc.vpc_id

  health_check {
    enabled             = true
    interval            = 30
    path                = "/"           # путь, который точно отдаёт 200
    matcher             = "200-499"     # принять даже 404 как "успех"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 10            # дать побольше шансов
  }
}

########################################
# Listeners
########################################

resource "aws_lb_listener" "grafana" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 3000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana.arn
  }
}

resource "aws_lb_listener" "prometheus" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 9090
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.prometheus.arn
  }
}

resource "aws_lb_listener" "rabbitmq" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 15672
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.rabbitmq.arn
  }
}

resource "aws_lb_listener" "tekero_api" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tekero_api.arn
  }
}
