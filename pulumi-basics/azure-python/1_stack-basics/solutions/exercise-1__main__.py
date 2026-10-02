# See EXERCISES.md

import pulumi
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup("resource_group")

## Exercise 1 ##
pulumi.export("rg_name", resource_group.name)
## Exercise 1 ##

