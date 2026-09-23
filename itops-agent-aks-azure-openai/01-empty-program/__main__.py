"""Step 1: the output of `pulumi new azure-native-python`.

An empty Pulumi program targeting Azure — one resource group, nothing else.
Every later step in this workshop starts from this stack and adds resources
to it; run `pulumi up` here first so the resource group exists before
`02-aks-cluster` provisions the AKS cluster inside it.
"""

import pulumi
from pulumi_azure_native import resources

config = pulumi.Config()
location = config.get("location") or "eastus2"

# Fixed (not auto-suffixed) name: every later folder in this workshop takes
# this same name as the default for its own `resourceGroupName` config, so
# the presenter does not have to copy a generated name between steps.
RESOURCE_GROUP_NAME = "rg-itops-agent-aks-azure-openai"

resource_group = resources.ResourceGroup(
    "itops-agent",
    resource_group_name=RESOURCE_GROUP_NAME,
    location=location,
    tags={
        "workshop": "itops-agent-aks-azure-openai",
        "managed-by": "pulumi",
    },
)

pulumi.export("resourceGroupName", resource_group.name)
pulumi.export("location", resource_group.location)
