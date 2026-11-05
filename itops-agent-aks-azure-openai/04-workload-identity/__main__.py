"""Step 4: step 3 plus workload identity. No static secret anywhere.

Cumulative: steps 1-3, plus three resources that let the AKS workload call
Azure OpenAI without a key:

1. `UserAssignedIdentity`: the identity the agent pod presents as.
2. `FederatedIdentityCredential`: trusts tokens from the cluster's OIDC
   issuer (from step 2, referenced directly, no copy-paste) for one
   Kubernetes service account.
3. `RoleAssignment`: grants that identity "Cognitive Services OpenAI User"
   (built-in role 5e0bd9bd-7b93-4f28-af87-19fc36ad61bd) on the account
   from step 3.

Pulumi's own access to Azure uses the Pulumi ESC `azure-login` provider
over OIDC, not a client secret: see `esc/azure-login.yaml` and the README.

End state: `az role assignment list --assignee <identityClientId>` shows
the role, and a grep of this folder (and 05-agent-deployment/) for
a credential keyword finds nothing (see the README for the exact command).
"""

import pulumi
from pulumi_azure_native import (
    authorization,
    cognitiveservices,
    containerservice,
    managedidentity,
    resources,
)

config = pulumi.Config()
location = config.get("location") or "eastus2"
namespace_name = config.get("namespace") or "itops-agent"
service_account_name = config.get("serviceAccountName") or "itops-agent"

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

# --- from step 3 ---------------------------------------------------------
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

# --- new in step 4 ---------------------------------------------------------
COGNITIVE_SERVICES_OPENAI_USER_ROLE_ID = "5e0bd9bd-7b93-4f28-af87-19fc36ad61bd"

identity = managedidentity.UserAssignedIdentity(
    "itops-agent-identity",
    resource_name_="itops-agent-identity",
    resource_group_name=resource_group.name,
    location=resource_group.location,
    tags={
        "workshop": "itops-agent-aks-azure-openai",
        "managed-by": "pulumi",
    },
)

federated_credential = managedidentity.FederatedIdentityCredential(
    "itops-agent-federated-credential",
    resource_name_=identity.name,
    federated_identity_credential_resource_name="itops-agent-federated-credential",
    resource_group_name=resource_group.name,
    issuer=cluster.oidc_issuer_profile.issuer_url,
    subject=f"system:serviceaccount:{namespace_name}:{service_account_name}",
    audiences=["api://AzureADTokenExchange"],
)

client_config = authorization.get_client_config_output()

role_assignment = authorization.RoleAssignment(
    "itops-agent-openai-role",
    principal_id=identity.principal_id,
    principal_type=authorization.PrincipalType.SERVICE_PRINCIPAL,
    role_definition_id=client_config.subscription_id.apply(
        lambda sub_id: (
            f"/subscriptions/{sub_id}/providers/Microsoft.Authorization/"
            f"roleDefinitions/{COGNITIVE_SERVICES_OPENAI_USER_ROLE_ID}"
        )
    ),
    scope=account.id,
    opts=pulumi.ResourceOptions(depends_on=[identity, federated_credential]),
)

pulumi.export("resourceGroupName", resource_group.name)
pulumi.export("location", resource_group.location)
pulumi.export("clusterName", cluster.name)
pulumi.export("oidcIssuerUrl", cluster.oidc_issuer_profile.issuer_url)
pulumi.export("accountName", account.name)
pulumi.export("accountId", account.id)
pulumi.export("endpoint", account.properties.endpoint)
pulumi.export("deploymentName", model_deployment.name)
pulumi.export("identityClientId", identity.client_id)
pulumi.export("identityPrincipalId", identity.principal_id)
pulumi.export("namespace", namespace_name)
pulumi.export("serviceAccountName", service_account_name)
