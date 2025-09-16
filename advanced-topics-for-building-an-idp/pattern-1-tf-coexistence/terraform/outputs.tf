output "ami_id" {
  description = "The ID of the Amazon Linux AMI"
  value       = module.minecraft.ami_id
}

output "minecraft_instance_id" {
  description = "The ID of the Minecraft instance"
  value       = module.minecraft.minecraft_instance_id
}

output "minecraft_instance_public_ip" {
  description = "The public IP address of the Minecraft instance"
  value       = module.minecraft.minecraft_instance_public_ip
}

output "minecraft_instance_private_ip" {
  description = "The private IP address of the Minecraft instance"
  value       = module.minecraft.minecraft_instance_private_ip
}

output "minecraft_security_group_id" {
  description = "The ID of the security group for the Minecraft instance"
  value       = module.minecraft.minecraft_security_group_id
}

output "minecraft_security_group_name" {
  description = "The name of the security group for the Minecraft instance"
  value       = module.minecraft.minecraft_security_group_name
}
