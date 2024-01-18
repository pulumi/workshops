import pulumi
import pulumi_awsx as awsx
import pulumi_eks as eks
import pulumi_kubernetes as k8s

# Get some values from the Pulumi configuration (or use defaults)
config = pulumi.Config()
min_cluster_size = config.get_float("minClusterSize", 3)
max_cluster_size = config.get_float("maxClusterSize", 6)
desired_cluster_size = config.get_float("desiredClusterSize", 3)
eks_node_instance_type = config.get("eksNodeInstanceType", "t3.medium")
vpc_network_cidr = config.get("vpcNetworkCidr", "10.0.0.0/16")

# Create a VPC for the EKS cluster
eks_vpc = awsx.ec2.Vpc("eks-vpc",
                       enable_dns_hostnames=True,
                       cidr_block=vpc_network_cidr)

# Create the EKS cluster
eks_cluster = eks.Cluster("eks-cluster",
                          # Put the cluster in the new VPC created earlier
                          vpc_id=eks_vpc.vpc_id,
                          # Public subnets will be used for load balancers
                          public_subnet_ids=eks_vpc.public_subnet_ids,
                          # Private subnets will be used for cluster nodes
                          private_subnet_ids=eks_vpc.private_subnet_ids,
                          # Change configuration values to change any of the following settings
                          instance_type=eks_node_instance_type,
                          desired_capacity=desired_cluster_size,
                          min_size=min_cluster_size,
                          max_size=max_cluster_size,
                          # Do not give worker nodes a public IP address
                          node_associate_public_ip_address=False,
                          # Change these values for a private cluster (VPN access required)
                          endpoint_private_access=False,
                          endpoint_public_access=True
                          )

# Export values to use elsewhere
pulumi.export("kubeconfig", eks_cluster.kubeconfig)
pulumi.export("vpcId", eks_vpc.vpc_id)

k8s_provider = k8s.Provider(
    "k8s-provider",
    kubeconfig=eks_cluster.kubeconfig
)

deployment = k8s.apps.v1.Deployment(
    "nginx-deployment",
    metadata={
        "name": "nginx-deployment",
        "labels": {
            "app": "nginx"
        },
    },
    spec={
        "replicas": 1,
        "selector": {"matchLabels": {"app": "nginx"}},
        "template": {
            "metadata": {"labels": {"app": "nginx"}},
            "spec": {
                "containers": [{
                    "name": "nginx",
                    "image": "nginx:1.25.2",
                    "ports": [{"containerPort": 80}],
                }]
            },
        },
    },
    opts=pulumi.ResourceOptions(
        provider=k8s_provider
    )
)

service = k8s.core.v1.Service(
    "nginx-service",
    metadata=k8s.meta.v1.ObjectMetaArgs(
        name="nginx-service"
    ),
    spec=k8s.core.v1.ServiceSpecArgs(
        ports=[k8s.core.v1.ServicePortArgs(
            port=80,
            target_port=80
        )],
        selector={
            "app": "nginx"
        },
        type="LoadBalancer"
    ),
    opts=pulumi.ResourceOptions(
        provider=k8s_provider
    )
)

pulumi.export("url", service.status.load_balancer.ingress[0].hostname)
