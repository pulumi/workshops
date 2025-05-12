# random int
resource "random_integer" "priority" {
  min = 1
  max = var.maxlen
  seed = var.randseed
}

# -----
# random pet, single file

variable "keeper_key" {
  type        = string
  description = "keeper key"
}

resource "random_pet" "animal" {
  keepers = {
    my_key = var.keeper_key
  }
}

output "pet" {
 value       = random_pet.animal.id
  description = "my pet animal"
}