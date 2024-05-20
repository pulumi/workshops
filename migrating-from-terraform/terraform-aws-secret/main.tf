provider "aws" {
  region = "us-west-2" # Specify your AWS region

  # Specify default tags for all resources that support tags
  default_tags {
    tags = {
      Repo       = "pulumi/workshops"
      Project     = "terraform-aws-secret"
    }
  }
}

resource "aws_secretsmanager_secret" "example" {
  name = "my_secret_name"
}

resource "aws_secretsmanager_secret_version" "example" {
  secret_id     = aws_secretsmanager_secret.example.id
  secret_string = "my_super_secret_value"
}

output "secret_name" {
  description = "The name of the secret."
  value       = aws_secretsmanager_secret.example.name
}

output "secret_arn" {
  description = "The ARN of the secret."
  value       = aws_secretsmanager_secret.example.arn
}
