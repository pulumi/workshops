import json
import pulumi
import pulumi_civo as civo
import pulumi_kubernetes as kubernetes

network = civo.Network("network-two", label="pulumi-workshop")

firewall = civo.Firewall("firewall-two", network_id=network.id)

cluster = civo.KubernetesCluster('cluster', name='cluster',
                                 num_target_nodes=2, target_nodes_size='g3.k3s.medium',
                                 network_id=network.id, firewall_id=firewall.id)

kubernetes_provider = kubernetes.Provider(
    "kubernetes-provider", kubeconfig=cluster.kubeconfig)

kubernetes.apps.v1.Deployment(
    "nginx",
    metadata=kubernetes.meta.v1.ObjectMetaArgs(
        labels={
            "app": "nginx",
        },
    ),
    spec=kubernetes.apps.v1.DeploymentSpecArgs(
        replicas=3,
        selector=kubernetes.meta.v1.LabelSelectorArgs(
            match_labels={
                "app": "nginx",
            },
        ),
        template=kubernetes.core.v1.PodTemplateSpecArgs(
            metadata=kubernetes.meta.v1.ObjectMetaArgs(
                labels={
                    "app": "nginx",
                },
            ),
            spec=kubernetes.core.v1.PodSpecArgs(
                containers=[kubernetes.core.v1.ContainerArgs(
                    name="nginx",
                    image="nginx:1.14.2",
                    ports=[kubernetes.core.v1.ContainerPortArgs(
                        container_port=80,
                    )],
                )],
            ),
        ),
    ), opts=pulumi.ResourceOptions(provider=kubernetes_provider))

service = kubernetes.core.v1.Service(
    "nginx",
    spec=kubernetes.core.v1.ServiceSpecArgs(
        selector={
            "app": "nginx",
        },
        type="NodePort",
        ports=[kubernetes.core.v1.ServicePortArgs(
            protocol="TCP",
            port=80,
        )],
    ), opts=pulumi.ResourceOptions(provider=kubernetes_provider))

nginx_url = pulumi.Output.all(cluster.master_ip, service.spec.ports).apply(
    lambda args: pulumi.Output.concat("http://", args[0], ":", str(args[1][0]['node_port'])))

pulumi.export("nginxUrl", nginx_url)
pulumi.export("kubeconfig", cluster.kubeconfig)
