terraform {
  backend "s3" {
    bucket         = "tekero-terrafrom"
    key            = "tekero/dev/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "tekero-terraform"
    encrypt        = true
  }
}
