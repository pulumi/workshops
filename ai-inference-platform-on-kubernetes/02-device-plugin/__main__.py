"""Install the NVIDIA device plugin so the scheduler sees `nvidia.com/gpu`.

Step 3 of the "Provisioning the AI inference platform on Kubernetes"
workshop. Reads the cluster's kubeconfig from the 01-cluster stack via a
StackReference; does not create any AWS resources itself.
"""

import pulumi
import pulumi_kubernetes as k8s
from pulumi_kubernetes.helm.v4 import Chart, RepositoryOptsArgs

config = pulumi.Config()
cluster_stack_ref = config.get("clusterStackRef", "ai-inference-platform-cluster")
cluster_stack = pulumi.StackReference(
    f"{pulumi.get_organization()}/{cluster_stack_ref}/{pulumi.get_stack()}"
)
kubeconfig = cluster_stack.get_output("kubeconfig")

provider = k8s.Provider("k8s", kubeconfig=kubeconfig)

device_plugin = Chart(
    "nvidia-device-plugin",
    chart="nvidia-device-plugin",
    version="0.20.0",
    namespace="kube-system",
    repository_opts=RepositoryOptsArgs(
        repo="https://nvidia.github.io/k8s-device-plugin",
    ),
    values={
        # Only schedule the plugin on nodes tainted for GPU workloads by
        # 01-cluster's GPU node group.
        "tolerations": [
            {
                "key": "nvidia.com/gpu",
                "operator": "Equal",
                "value": "true",
                "effect": "NoSchedule",
            }
        ],
        "nodeSelector": {"nvidia.com/gpu": "true"},
    },
    opts=pulumi.ResourceOptions(provider=provider),
)

pulumi.export("device_plugin_namespace", "kube-system")
pulumi.export("device_plugin_chart_version", "0.20.0")
