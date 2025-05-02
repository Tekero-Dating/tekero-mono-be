terraform {
  backend "s3" {
    bucket         = "tf-state-tekero"
    key            = "tekero/dev/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "tf-locks-tekero"
    encrypt        = true
  }
}
