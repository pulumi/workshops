"""Step 2: resource group + AKS cluster.

`pulumi up` here produces a running AKS cluster; verify it out-of-band with
`az aks show --resource-group <rg> --name <cluster>`.

Fallback for the "AKS takes 5-10 minutes to provision" risk in the brief: set
`createCluster: "false"` and provide `existingClusterName` (in the resource
group named by `resourceGroupName`) to point this stack at a cluster
provisioned before the session, skip creation, and start the live demo here
instead.
"""

import pulumi
from pulumi_azure_native import containerservice, resources

config = pulumi.Config()
location = config.get("location") or "eastus2"
resource_group_name_cfg = config.require("resourceGroupName")
create_cluster = config.get_bool("createCluster")
if create_cluster is None:
    create_cluster = True
existing_cluster_name = config.get("existingClusterName")

CLUSTER_NAME = "itops-agent-aks"

if create_cluster:
    # The resource group was created in 01-empty-program with this same
    # fixed name; look it up rather than re-creating it, since Pulumi does
    # not own a resource group it did not create in this stack.
    resource_group = resources.get_resource_group_output(
        resource_group_name=resource_group_name_cfg,
    )

    cluster = containerservice.ManagedCluster(
        "itops-agent-aks",
        resource_name_=CLUSTER_NAME,
        resource_group_name=resource_group.name,
        location=location,
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

    resource_group_name = resource_group.name
    cluster_name = cluster.name
    oidc_issuer_url = cluster.oidc_issuer_profile.issuer_url
else:
    if not existing_cluster_name:
        raise ValueError(
            "createCluster is false: set existingClusterName to point at "
            "a cluster pre-staged in the resourceGroupName resource group"
        )
    existing = containerservice.get_managed_cluster_output(
        resource_group_name=resource_group_name_cfg,
        resource_name=existing_cluster_name,
    )
    resource_group_name = pulumi.Output.from_input(resource_group_name_cfg)
    cluster_name = existing.name
    oidc_issuer_url = existing.oidc_issuer_profile.issuer_url

pulumi.export("resourceGroupName", resource_group_name)
pulumi.export("clusterName", cluster_name)
pulumi.export("oidcIssuerUrl", oidc_issuer_url)
