"""Step 3: step 2 plus an Azure OpenAI account and a GPT-4o deployment.

Cumulative: resource group (step 1), AKS cluster (step 2), and now a
Cognitive Services account of kind OpenAI plus a model deployment. Same
project, same `dev` stack. Verify with `az cognitiveservices account show`
and `az cognitiveservices account deployment list`.

`disable_local_auth=True` turns API-key auth off on the account. Step 4
grants the workload's managed identity the "Cognitive Services OpenAI User"
role instead, so no key is ever used. For the brief's curl smoke test, use
an Entra token: `az account get-access-token --resource
https://cognitiveservices.azure.com`.

Presenter fallback for the quota/approval risk: run this step's `pulumi up`
before the session in a subscription where quota is approved.
"""

import pulumi
from pulumi_azure_native import cognitiveservices, containerservice, resources

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

# --- from step 2 -----------------------------------------------------------
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

ACCOUNT_NAME = "itops-agent-openai"
DEPLOYMENT_NAME = "itops-agent-gpt-4o"
# gpt-4o 2024-11-20. The brief asks for a "GPT-4o-class" model; the 2024-05-13
# and 2024-08-06 versions are on Microsoft's retirement schedule. Confirm the
# version is deployable in your region and subscription before the session
# (see "Open questions" in the README).
MODEL_VERSION = "2024-11-20"

# --- new in step 3 ---------------------------------------------------------
account = cognitiveservices.Account(
    "itops-agent-openai",
    account_name=ACCOUNT_NAME,
    resource_group_name=resource_group.name,
    location=resource_group.location,
    kind="OpenAI",
    sku=cognitiveservices.SkuArgs(name="S0"),
    identity=cognitiveservices.IdentityArgs(
        type=cognitiveservices.ResourceIdentityType.SYSTEM_ASSIGNED,
    ),
    properties=cognitiveservices.AccountPropertiesArgs(
        custom_sub_domain_name=ACCOUNT_NAME,
        disable_local_auth=True,
    ),
    tags={
        "workshop": "itops-agent-aks-azure-openai",
        "managed-by": "pulumi",
    },
)

model_deployment = cognitiveservices.Deployment(
    "itops-agent-gpt-4o",
    account_name=account.name,
    deployment_name=DEPLOYMENT_NAME,
    resource_group_name=resource_group.name,
    properties=cognitiveservices.DeploymentPropertiesArgs(
        model=cognitiveservices.DeploymentModelArgs(
            format="OpenAI",
            name="gpt-4o",
            version=MODEL_VERSION,
        ),
    ),
    sku=cognitiveservices.SkuArgs(
        name="GlobalStandard",
        capacity=10,
    ),
    opts=pulumi.ResourceOptions(depends_on=[account]),
)

pulumi.export("resourceGroupName", resource_group.name)
pulumi.export("location", resource_group.location)
pulumi.export("clusterName", cluster.name)
pulumi.export("oidcIssuerUrl", cluster.oidc_issuer_profile.issuer_url)
pulumi.export("accountName", account.name)
pulumi.export("accountId", account.id)
pulumi.export("endpoint", account.properties.endpoint)
pulumi.export("deploymentName", model_deployment.name)
