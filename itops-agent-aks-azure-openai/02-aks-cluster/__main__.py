"""Step 2: step 1 plus an AKS cluster.

Cumulative: this folder holds everything from `01-empty-program` (the
resource group) and adds the AKS cluster. Same project, same `dev` stack:
run `pulumi up` here and Pulumi only creates what is new. Verify with
`az aks show --resource-group rg-itops-agent-aks-azure-openai --name itops-agent-aks`.

The cluster has the OIDC issuer and workload identity turned on so step 4
can federate a Kubernetes service account to an Azure managed identity
with no static secret.

Presenter fallback for the "AKS takes 5-10 minutes" risk: run `pulumi up`
in this folder before the session, then start the live demo at step 3.
"""

import pulumi
from pulumi_azure_native import containerservice, resources

config = pulumi.Config()
location = config.get("location") or "eastus2"

# Fixed (not auto-suffixed) names, so az commands in the README and in
# 06-teardown/teardown.sh can name them.
RESOURCE_GROUP_NAME = "rg-itops-agent-aks-azure-openai"
CLUSTER_NAME = "itops-agent-aks"

# --- from step 1 -----------------------------------------------------------
resource_group = resources.ResourceGroup(
    "itops-agent",
    resource_group_name=RESOURCE_GROUP_NAME,
    location=location,
    tags={
        "workshop": "itops-agent-aks-azure-openai",
        "managed-by": "pulumi",
    },
)

# --- new in step 2 ---------------------------------------------------------
cluster = containerservice.ManagedCluster(
    "itops-agent-aks",
    resource_name_=CLUSTER_NAME,
    resource_group_name=resource_group.name,
    location=resource_group.location,
    dns_prefix="itopsagentaks",
    kubernetes_version="1.31",
    # System-assigned identity for the control plane, plus OIDC issuer +
    # workload identity so step 4 can federate a workload's service
    # account to an Azure managed identity with no static secret.
    identity=containerservice.ManagedClusterIdentityArgs(
        type=containerservice.ResourceIdentityType.SYSTEM_ASSIGNED,
    ),
    oidc_issuer_profile=containerservice.ManagedClusterOIDCIssuerProfileArgs(
        enabled=True,
    ),
    security_profile=containerservice.ManagedClusterSecurityProfileArgs(
        workload_identity=containerservice.ManagedClusterSecurityProfileWorkloadIdentityArgs(
            enabled=True,
        ),
    ),
    enable_rbac=True,
    agent_pool_profiles=[
        containerservice.ManagedClusterAgentPoolProfileArgs(
            name="agentpool",
            count=2,
            vm_size="Standard_D2s_v5",
            os_type=containerservice.OSType.LINUX,
            mode=containerservice.AgentPoolMode.SYSTEM,
            type=containerservice.AgentPoolType.VIRTUAL_MACHINE_SCALE_SETS,
        ),
    ],
    network_profile=containerservice.ContainerServiceNetworkProfileArgs(
        load_balancer_sku=containerservice.LoadBalancerSku.STANDARD,
    ),
    tags={
        "workshop": "itops-agent-aks-azure-openai",
        "managed-by": "pulumi",
    },
)

pulumi.export("resourceGroupName", resource_group.name)
pulumi.export("location", resource_group.location)
pulumi.export("clusterName", cluster.name)
pulumi.export("oidcIssuerUrl", cluster.oidc_issuer_profile.issuer_url)
