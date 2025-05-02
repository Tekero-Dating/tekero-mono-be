########################################
# ecr.tf — репозиторий для Docker-образов
########################################

resource "aws_ecr_repository" "tekero_backend" {
  name                 = "${var.project}-${var.environment}-backend"
  image_tag_mutability = "MUTABLE"
  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

# (Опционально) Жизненный цикл образов: удалять старше 30 дней
resource "aws_ecr_lifecycle_policy" "tekero_backend" {
  repository = aws_ecr_repository.tekero_backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire images older than 30 days"
        selection = {
          tagStatus     = "any"
          countType     = "sinceImagePushed"
          countUnit     = "days"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
