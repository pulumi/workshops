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
  default     = "/Users/dirien/Tools/repos/stackit-minecraft/minecraft/ssh/minecraft.pub"
}

variable "instance_type" {
  description = "The EC2 instance type for the Minecraft server"
  type        = string
  default     = "t2.small"
}

variable "minecraft_version" {
  description = "The Minecraft server version to download"
  type        = string
  default     = "1.21.8"
}

variable "java_max_memory" {
  description = "The maximum amount of memory (in MB) to allocate to the Minecraft server"
  type        = string
  default     = "1024"
}

variable "personal_ip" {
  description = "The personal IP address to allow SSH access to the Minecraft instance"
  type        = string
  default     = "10.0.0.0"
}

variable "personal_subnet" {
  description = "The subnet mask for the personal IP, typically set to '32' for a single IP address"
  type        = string
  default     = "16"
}
