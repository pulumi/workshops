terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.13.0"
    }
  }
}

provider "aws" {
  region = var.region
}

module "minecraft" {
  source            = "../tf-mod-minecraft"
  public_key_path   = "/Users/dirien/Tools/repos/stackit-minecraft/minecraft/ssh/minecraft.pub"
  minecraft_version = var.minecraft_version
}

/*
// Allow SSH from anywhere - not recommended for production use
resource "aws_security_group_rule" "allow_http" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = module.minecraft.minecraft_security_group_id
  description       = "Allow SSH access from anywhere"
}

 */

