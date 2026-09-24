"""VPC, EKS cluster, system node group and a config-gated GPU node group.

Steps 1-2 of the "Provisioning the AI inference platform on Kubernetes"
workshop. See AGENTS.md in this folder for why both steps live in one
Pulumi program.
"""

import pulumi
import pulumi_aws as aws
import pulumi_eks as eks

config = pulumi.Config()
gpu_node_group_enabled = config.get_bool("gpuNodeGroupEnabled", False)

project = pulumi.get_project()
stack = pulumi.get_stack()
name = f"{project}-{stack}"
tags = {"workshop": "ai-inference-platform-on-kubernetes"}

# --- VPC -------------------------------------------------------------------
# Hand-rolled and deliberately minimal: two public subnets, no NAT gateway.
# This keeps the workshop's on-demand cost down; it is a workshop
# simplification, not a production network design.

vpc = aws.ec2.Vpc(
    "vpc",
    cidr_block="10.0.0.0/16",
    enable_dns_hostnames=True,
    enable_dns_support=True,
    tags={**tags, "Name": f"{name}-vpc"},
)

igw = aws.ec2.InternetGateway(
    "igw",
    vpc_id=vpc.id,
    tags={**tags, "Name": f"{name}-igw"},
)

route_table = aws.ec2.RouteTable(
    "public-rt",
    vpc_id=vpc.id,
    routes=[
        aws.ec2.RouteTableRouteArgs(
            cidr_block="0.0.0.0/0",
            gateway_id=igw.id,
        )
    ],
    tags={**tags, "Name": f"{name}-public-rt"},
)

azs = aws.get_availability_zones(state="available")
public_subnets = []
for i, cidr in enumerate(["10.0.0.0/24", "10.0.1.0/24"]):
    subnet = aws.ec2.Subnet(
        f"public-subnet-{i}",
        vpc_id=vpc.id,
        cidr_block=cidr,
        availability_zone=azs.names[i],
        map_public_ip_on_launch=True,
        tags={
            **tags,
            "Name": f"{name}-public-{i}",
            # Karpenter discovers subnets by this tag in 04-autoscaling.
            "karpenter.sh/discovery": name,
        },
    )
    aws.ec2.RouteTableAssociation(
        f"public-rta-{i}",
        subnet_id=subnet.id,
        route_table_id=route_table.id,
    )
    public_subnets.append(subnet)

public_subnet_ids = [s.id for s in public_subnets]

# --- Node IAM role -----------------------------------------------------
# Shared by the system and GPU node groups. Created explicitly (rather than
# relying on eks.Cluster defaults) so attendees see the exact policies a
# GPU-capable worker node needs.

node_role = aws.iam.Role(
    "node-role",
    assume_role_policy=aws.iam.get_policy_document(
        statements=[
            aws.iam.GetPolicyDocumentStatementArgs(
                actions=["sts:AssumeRole"],
                principals=[
                    aws.iam.GetPolicyDocumentStatementPrincipalArgs(
                        type="Service",
                        identifiers=["ec2.amazonaws.com"],
                    )
                ],
            )
        ]
    ).json,
    tags=tags,
)

for i, policy_arn in enumerate(
    [
        "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    ]
):
    aws.iam.RolePolicyAttachment(
        f"node-role-policy-{i}",
        role=node_role.name,
        policy_arn=policy_arn,
    )

# --- EKS cluster -------------------------------------------------------
# skip_default_node_group=True: node groups are created explicitly below so
# the system and GPU pools are two distinct, inspectable resources.

cluster = eks.Cluster(
    "cluster",
    vpc_id=vpc.id,
    public_subnet_ids=public_subnet_ids,
    version="1.34",
    authentication_mode=eks.AuthenticationMode.API_AND_CONFIG_MAP,
    skip_default_node_group=True,
    create_oidc_provider=True,
    tags=tags,
)

aws.ec2.Tag(
    "cluster-sg-karpenter-discovery",
    resource_id=cluster.cluster_security_group_id,
    key="karpenter.sh/discovery",
    value=name,
)

# --- System node group ---------------------------------------------------
# Runs cluster-critical add-ons so they never compete with GPU capacity.

system_node_group = eks.ManagedNodeGroup(
    "system-node-group",
    cluster=cluster,
    node_group_name=f"{name}-system",
    node_role_arn=node_role.arn,
    subnet_ids=public_subnet_ids,
    instance_types=["t3.large"],
    scaling_config=aws.eks.NodeGroupScalingConfigArgs(
        min_size=2,
        desired_size=2,
        max_size=3,
    ),
    labels={"workshop-role": "system"},
    tags=tags,
)

# --- GPU node group (step 2, config-gated) --------------------------------

gpu_node_group = None
if gpu_node_group_enabled:
    gpu_node_group = eks.ManagedNodeGroup(
        "gpu-node-group",
        cluster=cluster,
        node_group_name=f"{name}-gpu",
        node_role_arn=node_role.arn,
        subnet_ids=public_subnet_ids,
        instance_types=["g5.xlarge"],
        ami_type=eks.AmiType.AL2023_X86_64_NVIDIA,
        scaling_config=aws.eks.NodeGroupScalingConfigArgs(
            min_size=1,
            desired_size=1,
            max_size=2,
        ),
        labels={"workshop-role": "gpu", "nvidia.com/gpu": "true"},
        taints=[
            aws.eks.NodeGroupTaintArgs(
                key="nvidia.com/gpu",
                value="true",
                effect="NO_SCHEDULE",
            )
        ],
        tags=tags,
    )

# --- Exports ---------------------------------------------------------------

pulumi.export("kubeconfig", cluster.kubeconfig)
pulumi.export("cluster_name", cluster.eks_cluster.name)
pulumi.export("oidc_provider_arn", cluster.core.oidc_provider.arn)
pulumi.export("oidc_provider_url", cluster.core.oidc_provider.url)
pulumi.export("public_subnet_ids", public_subnet_ids)
pulumi.export("cluster_security_group_id", cluster.cluster_security_group_id)
pulumi.export("node_role_arn", node_role.arn)
pulumi.export("region", aws.get_region().name)
pulumi.export("gpu_node_group_enabled", gpu_node_group_enabled)
