"""A Python Pulumi program"""

import pulumi
import pulumi_digitalocean as do
import pulumi_kubernetes as k8s

# grab the latest version available from DigitalOcean
ver = do.get_kubernetes_versions()

# provision a Kubernetes cluster
cluster = do.KubernetesCluster(
    "workshop-cluster",
    region="nyc3",
    version=ver.latest_version,
    node_pool=do.KubernetesClusterNodePoolArgs(
        name="default", 
        size="s-1vcpu-2gb", 
        node_count=4,
        tags=["workshop-cluster"]
    ),
)

# Set up a Kubernetes provider
k8s_provider = k8s.Provider(
    "do-k8s",
    kubeconfig=cluster.kube_configs.apply(lambda c: c[0].raw_config),
    opts=pulumi.ResourceOptions(parent=cluster),
)

ns = k8s.core.v1.Namespace(
    "platform",
    metadata=k8s.meta.v1.ObjectMetaArgs(name="platform"),
    opts=pulumi.ResourceOptions(provider=k8s_provider, parent=k8s_provider),
)

nginx_ingress = k8s.helm.v3.Chart(
    "nginx-ingress",
    k8s.helm.v3.ChartOpts(
        namespace=ns.metadata.name,
        chart="ingress-nginx",
        version="3.26.0",
        fetch_opts=k8s.helm.v3.FetchOpts(
            repo="https://kubernetes.github.io/ingress-nginx"
        ),
        values={
            "controller": {
                "publishService": {
                    "enabled": "true"
                }
            }
        }
    ),
    opts=pulumi.ResourceOptions(provider=k8s_provider, parent=ns),
)

pulumi.export("kubeconfig", cluster.kube_configs[0].raw_config)

# pulumi stack output kubeconfig --show-secrets > kubeconfig
