"""Step 5: step 4 plus the Kubernetes provider and the agent Deployment.

Cumulative: steps 1-4, plus a Kubernetes provider built from the AKS
cluster's own kubeconfig (`list_managed_cluster_user_credentials`), a
namespace, a ServiceAccount annotated with the managed identity's client ID,
a Deployment running the pre-built agent image, and a ClusterIP Service.
The identity client ID, the endpoint and the deployment name come straight
from the resources above, not from config.

No key, no secret, no `imagePullSecret` appears in the container spec: the
workload identity webhook injects AZURE_CLIENT_ID, AZURE_TENANT_ID and
AZURE_FEDERATED_TOKEN_FILE into the pod. Config needed: `agentImage`.

No LoadBalancer Service, to avoid a billable public IP: reach the agent with
`kubectl port-forward svc/itops-agent 8080:80 -n itops-agent` and `curl`.
"""

import base64

import pulumi
import pulumi_kubernetes as k8s
from pulumi_azure_native import (
    authorization,
    cognitiveservices,
    containerservice,
    managedidentity,
    resources,
)

config = pulumi.Config()
location = config.get("location") or "eastus2"
agent_image = config.require("agentImage")
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

# --- from step 4 ---------------------------------------------------------
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

# --- new in step 5 ---------------------------------------------------------
credentials = containerservice.list_managed_cluster_user_credentials_output(
    resource_group_name=resource_group.name,
    resource_name=cluster.name,
)
kubeconfig = credentials.kubeconfigs[0].value.apply(
    lambda encoded: base64.b64decode(encoded).decode("utf-8")
)

k8s_provider = k8s.Provider("itops-agent-k8s", kubeconfig=kubeconfig)

namespace = k8s.core.v1.Namespace(
    "itops-agent-namespace",
    metadata=k8s.meta.v1.ObjectMetaArgs(name=namespace_name),
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

service_account = k8s.core.v1.ServiceAccount(
    "itops-agent-service-account",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name=service_account_name,
        namespace=namespace.metadata["name"],
        annotations={
            "azure.workload.identity/client-id": identity.client_id,
        },
        labels={
            "azure.workload.identity/use": "true",
        },
    ),
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

labels = {"app": "itops-agent"}

agent_deployment = k8s.apps.v1.Deployment(
    "itops-agent-deployment",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name="itops-agent",
        namespace=namespace.metadata["name"],
    ),
    spec=k8s.apps.v1.DeploymentSpecArgs(
        replicas=1,
        selector=k8s.meta.v1.LabelSelectorArgs(match_labels=labels),
        template=k8s.core.v1.PodTemplateSpecArgs(
            metadata=k8s.meta.v1.ObjectMetaArgs(
                labels={**labels, "azure.workload.identity/use": "true"},
            ),
            spec=k8s.core.v1.PodSpecArgs(
                service_account_name=service_account.metadata["name"],
                containers=[
                    k8s.core.v1.ContainerArgs(
                        name="itops-agent",
                        image=agent_image,
                        ports=[k8s.core.v1.ContainerPortArgs(container_port=8080)],
                        env=[
                            # AZURE_CLIENT_ID, AZURE_TENANT_ID and
                            # AZURE_FEDERATED_TOKEN_FILE are injected by the
                            # AKS workload identity webhook itself, from the
                            # service account's annotations, not set here.
                            k8s.core.v1.EnvVarArgs(
                                name="AZURE_OPENAI_ENDPOINT",
                                value=account.properties.endpoint,
                            ),
                            k8s.core.v1.EnvVarArgs(
                                name="AZURE_OPENAI_DEPLOYMENT",
                                value=model_deployment.name,
                            ),
                        ],
                    ),
                ],
            ),
        ),
    ),
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

service = k8s.core.v1.Service(
    "itops-agent-service",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name="itops-agent",
        namespace=namespace.metadata["name"],
    ),
    spec=k8s.core.v1.ServiceSpecArgs(
        type="ClusterIP",
        selector=labels,
        ports=[k8s.core.v1.ServicePortArgs(port=80, target_port=8080)],
    ),
    opts=pulumi.ResourceOptions(provider=k8s_provider),
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
pulumi.export("serviceAccountName", service_account_name)
pulumi.export("namespace", namespace.metadata["name"])
pulumi.export("serviceName", service.metadata["name"])
pulumi.export(
    "portForwardCommand",
    pulumi.Output.all(namespace.metadata["name"], service.metadata["name"]).apply(
        lambda args: f"kubectl port-forward svc/{args[1]} 8080:80 -n {args[0]}"
    ),
)
