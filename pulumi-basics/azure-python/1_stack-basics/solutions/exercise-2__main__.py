# See EXERCISES.md

import pulumi
from pulumi_azure_native import resources

## Exercise 2 ##
config = pulumi.Config()
base_name = config.require("base_name")
## Exercise 2 ##


# Create an Azure Resource Group
## Exercise 2 ##
resource_group = resources.ResourceGroup(f"{base_name}-rg")
## Exercise 2 ##

## Exercise 1 ##
pulumi.export("rg_name", resource_group.name)
## Exercise 1 ##

