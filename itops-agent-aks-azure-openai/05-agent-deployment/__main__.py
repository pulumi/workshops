"""Step 5: deploy the agent onto the cluster.

Builds a Kubernetes provider from the AKS cluster's own kubeconfig (via
`containerservice.list_managed_cluster_user_credentials`, the pattern from
pulumi.com/blog/top-5-things-for-azure-devs-kubernetes-infrastructure/, read
2026-09-22) and deploys the pre-built agent image from ./agent-app.

The ServiceAccount carries the two workload-identity labels/annotations AKS
requires (`azure.workload.identity/use: "true"` on the pod spec,
`azure.workload.identity/client-id` on the service account); together with
the federated credential from step 4 they are what let the pod exchange its
Kubernetes token for a short-lived Azure AD token — no key, no secret, no
`imagePullSecret` carrying a static credential either.

Presenter note: this file does not create a `LoadBalancer` Service, to avoid
an extra billable public IP for a short workshop session. Reach the agent
with `kubectl port-forward svc/itops-agent 8080:80 -n <namespace>` and a
`curl`, exactly as the root README's "Run the demo" section describes.
"""

import base64

import pulumi
import pulumi_kubernetes as k8s
from pulumi_azure_native import containerservice

config = pulumi.Config()
resource_group_name = config.require("resourceGroupName")
cluster_name = config.require("clusterName")
namespace_name = config.get("namespace") or "itops-agent"
service_account_name = config.get("serviceAccountName") or "itops-agent"
identity_client_id = config.require("identityClientId")
openai_endpoint = config.require("openaiEndpoint")
openai_deployment_name = config.get("openaiDeploymentName") or "itops-agent-gpt-4o"
agent_image = config.require("agentImage")

credentials = containerservice.list_managed_cluster_user_credentials_output(
    resource_group_name=resource_group_name,
    resource_name=cluster_name,
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
            "azure.workload.identity/client-id": identity_client_id,
        },
        labels={
            "azure.workload.identity/use": "true",
        },
    ),
    opts=pulumi.ResourceOptions(provider=k8s_provider),
)

labels = {"app": "itops-agent"}

deployment = k8s.apps.v1.Deployment(
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
                            # service account's annotations — not set here.
                            k8s.core.v1.EnvVarArgs(
                                name="AZURE_OPENAI_ENDPOINT",
                                value=openai_endpoint,
                            ),
                            k8s.core.v1.EnvVarArgs(
                                name="AZURE_OPENAI_DEPLOYMENT",
                                value=openai_deployment_name,
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

pulumi.export("namespace", namespace.metadata["name"])
pulumi.export("serviceName", service.metadata["name"])
pulumi.export(
    "portForwardCommand",
    pulumi.Output.all(namespace.metadata["name"], service.metadata["name"]).apply(
        lambda args: f"kubectl port-forward svc/{args[1]} 8080:80 -n {args[0]}"
    ),
)
