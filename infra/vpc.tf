module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"    # <-- или любую 5.x.x

  name               = "${var.project}-${var.environment}-vpc"
  cidr               = var.vpc_cidr
  azs                = ["${var.aws_region}a", "${var.aws_region}b"]
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}
