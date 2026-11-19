"""Namespace, ResourceQuota and LimitRange for shared GPU capacity.

Step 4 of the "Provisioning the AI inference platform on Kubernetes"
workshop. Caps a namespace to the single GPU the demo's node group provides,
so a pod asking for more is rejected by the API server before it is ever
scheduled — see manifests/oversized-gpu-pod.yaml for the pod used to prove
that live.
"""

import pulumi
import pulumi_kubernetes as k8s

config = pulumi.Config()
cluster_stack_ref = config.get("clusterStackRef", "ai-inference-platform-cluster")
cluster_stack = pulumi.StackReference(
    f"{pulumi.get_organization()}/{cluster_stack_ref}/{pulumi.get_stack()}"
)
kubeconfig = cluster_stack.get_output("kubeconfig")

provider = k8s.Provider("k8s", kubeconfig=kubeconfig)

namespace = k8s.core.v1.Namespace(
    "gpu-workloads",
    metadata=k8s.meta.v1.ObjectMetaArgs(name="gpu-workloads"),
    opts=pulumi.ResourceOptions(provider=provider),
)

# The demo's GPU node group provides exactly one GPU (g5.xlarge). Capping the
# namespace's GPU quota at 1 makes a second request fail predictably.
resource_quota = k8s.core.v1.ResourceQuota(
    "gpu-quota",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name="gpu-quota",
        namespace=namespace.metadata.name,
    ),
    spec=k8s.core.v1.ResourceQuotaSpecArgs(
        hard={
            "requests.nvidia.com/gpu": "1",
            "limits.nvidia.com/gpu": "1",
            "pods": "10",
        }
    ),
    opts=pulumi.ResourceOptions(provider=provider),
)

# Belt and suspenders: a LimitRange also caps any single container's GPU
# request, so a pod cannot ask for more than the whole namespace is allowed.
limit_range = k8s.core.v1.LimitRange(
    "gpu-limit-range",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name="gpu-limit-range",
        namespace=namespace.metadata.name,
    ),
    spec=k8s.core.v1.LimitRangeSpecArgs(
        limits=[
            k8s.core.v1.LimitRangeItemArgs(
                type="Container",
                max={"nvidia.com/gpu": "1"},
                default={"nvidia.com/gpu": "1"},
                default_request={"nvidia.com/gpu": "1"},
            )
        ]
    ),
    opts=pulumi.ResourceOptions(provider=provider),
)

pulumi.export("namespace", namespace.metadata.name)
pulumi.export("gpu_quota_hard_limit", "1")
