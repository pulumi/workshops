variable "region" {
  description = "The AWS region where the resources will be created"
  type        = string
  default     = "eu-central-1"
}

variable "name" {
  description = "The base name to use for the Minecraft instance and security group"
  type        = string
  default     = "minecraft"
}

variable "public_key_path" {
  description = "The path to the public key file for SSH access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "minecraft_version" {
  description = "The Minecraft server version to download"
  type        = string
  default     = "1.21.8"
}

