"""Karpenter prerequisites, the Karpenter Helm release, and a GPU NodePool.

Step 5 of the "Provisioning the AI inference platform on Kubernetes"
workshop: GPU node count tracks pending workload instead of a fixed node
group size. The Karpenter Helm chart cannot create the controller's IRSA
role, the node IAM role/instance profile, or the SQS interruption queue —
those are plain pulumi_aws resources below. See AGENTS.md in this folder.
"""

import json

import pulumi
import pulumi_aws as aws
import pulumi_kubernetes as k8s

config = pulumi.Config()
cluster_stack_ref = config.get("clusterStackRef", "ai-inference-platform-cluster")
cluster_stack = pulumi.StackReference(
    f"{pulumi.get_organization()}/{cluster_stack_ref}/{pulumi.get_stack()}"
)
kubeconfig = cluster_stack.get_output("kubeconfig")
cluster_name = cluster_stack.get_output("cluster_name")
oidc_provider_arn = cluster_stack.get_output("oidc_provider_arn")
oidc_provider_url = cluster_stack.get_output("oidc_provider_url")

provider = k8s.Provider("k8s", kubeconfig=kubeconfig)

aws_account_id = aws.get_caller_identity().account_id
aws_region = aws.get_region().name

# --- SQS interruption queue -------------------------------------------------
# Karpenter watches this queue for spot interruption and instance-health
# events so it can drain a node before AWS reclaims it.

interruption_queue = aws.sqs.Queue(
    "karpenter-interruption-queue",
    name=cluster_name.apply(lambda n: f"{n}-karpenter"),
    message_retention_seconds=300,
    sqs_managed_sse_enabled=True,
)

aws.sqs.QueuePolicy(
    "karpenter-interruption-queue-policy",
    queue_url=interruption_queue.url,
    policy=interruption_queue.arn.apply(
        lambda arn: json.dumps(
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "SqsWrite",
                        "Effect": "Allow",
                        "Principal": {
                            "Service": [
                                "events.amazonaws.com",
                                "sqs.amazonaws.com",
                            ]
                        },
                        "Action": "sqs:SendMessage",
                        "Resource": arn,
                    }
                ],
            }
        )
    ),
)

interruption_rules = {
    "spot-interruption": "aws.ec2",
    "rebalance-recommendation": "aws.ec2",
    "instance-state-change": "aws.ec2",
    "scheduled-change": "aws.health",
}
for rule_name, source in interruption_rules.items():
    rule = aws.cloudwatch.EventRule(
        f"karpenter-{rule_name}",
        event_pattern=json.dumps({"source": [source]}),
    )
    aws.cloudwatch.EventTarget(
        f"karpenter-{rule_name}-target",
        rule=rule.name,
        arn=interruption_queue.arn,
    )

# --- Karpenter controller IAM role (IRSA) -----------------------------------

controller_assume_role_policy = pulumi.Output.all(oidc_provider_arn, oidc_provider_url).apply(
    lambda args: json.dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"Federated": args[0]},
                    "Action": "sts:AssumeRoleWithWebIdentity",
                    "Condition": {
                        "StringEquals": {
                            f"{args[1].replace('https://', '')}:sub": (
                                "system:serviceaccount:kube-system:karpenter"
                            ),
                            f"{args[1].replace('https://', '')}:aud": "sts.amazonaws.com",
                        }
                    },
                }
            ],
        }
    )
)

controller_role = aws.iam.Role(
    "karpenter-controller-role",
    assume_role_policy=controller_assume_role_policy,
)

controller_policy_document = pulumi.Output.all(
    aws_account_id, aws_region, cluster_name, interruption_queue.arn
).apply(
    lambda args: json.dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "AllowScopedEC2InstanceActions",
                    "Effect": "Allow",
                    "Resource": "*",
                    "Action": [
                        "ec2:CreateFleet",
                        "ec2:CreateLaunchTemplate",
                        "ec2:CreateTags",
                        "ec2:DeleteLaunchTemplate",
                        "ec2:RunInstances",
                        "ec2:TerminateInstances",
                        "ec2:DescribeInstances",
                        "ec2:DescribeInstanceTypes",
                        "ec2:DescribeLaunchTemplates",
                        "ec2:DescribeSubnets",
                        "ec2:DescribeSecurityGroups",
                        "ec2:DescribeSpotPriceHistory",
                        "ec2:DescribeImages",
                        "pricing:GetProducts",
                        "ssm:GetParameter",
                    ],
                },
                {
                    "Sid": "AllowInterruptionQueueActions",
                    "Effect": "Allow",
                    "Resource": args[3],
                    "Action": [
                        "sqs:DeleteMessage",
                        "sqs:GetQueueUrl",
                        "sqs:ReceiveMessage",
                    ],
                },
                {
                    "Sid": "AllowPassingInstanceRole",
                    "Effect": "Allow",
                    "Resource": f"arn:aws:iam::{args[0]}:role/{args[2]}-karpenter-node",
                    "Action": "iam:PassRole",
                },
                {
                    "Sid": "AllowEKSClusterRead",
                    "Effect": "Allow",
                    "Resource": "*",
                    "Action": "eks:DescribeCluster",
                },
            ],
        }
    )
)

controller_policy = aws.iam.Policy(
    "karpenter-controller-policy",
    policy=controller_policy_document,
)

aws.iam.RolePolicyAttachment(
    "karpenter-controller-policy-attachment",
    role=controller_role.name,
    policy_arn=controller_policy.arn,
)

# --- Karpenter node IAM role + instance profile -----------------------------
# Karpenter launches nodes directly via EC2 (not through a managed node
# group), so it needs its own instance profile to hand new instances.

node_role = aws.iam.Role(
    "karpenter-node-role",
    name=cluster_name.apply(lambda n: f"{n}-karpenter-node"),
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
)

for i, policy_arn in enumerate(
    [
        "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
        "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
    ]
):
    aws.iam.RolePolicyAttachment(
        f"karpenter-node-role-policy-{i}",
        role=node_role.name,
        policy_arn=policy_arn,
    )

node_instance_profile = aws.iam.InstanceProfile(
    "karpenter-node-instance-profile",
    role=node_role.name,
)

# --- Karpenter Helm release --------------------------------------------------
# The CRD chart must exist before the controller chart; Pulumi resource
# dependency (opts.depends_on) makes that ordering explicit.

karpenter_crds = k8s.helm.v4.Chart(
    "karpenter-crd",
    chart="karpenter-crd",
    version="1.14.1",
    namespace="kube-system",
    repository_opts=k8s.helm.v4.RepositoryOptsArgs(
        repo="oci://public.ecr.aws/karpenter",
    ),
    opts=pulumi.ResourceOptions(provider=provider),
)

karpenter = k8s.helm.v4.Chart(
    "karpenter",
    chart="karpenter",
    version="1.14.1",
    namespace="kube-system",
    repository_opts=k8s.helm.v4.RepositoryOptsArgs(
        repo="oci://public.ecr.aws/karpenter",
    ),
    values={
        "settings": {
            "clusterName": cluster_name,
            "interruptionQueue": interruption_queue.name,
        },
        "serviceAccount": {
            "annotations": {
                "eks.amazonaws.com/role-arn": controller_role.arn,
            }
        },
    },
    opts=pulumi.ResourceOptions(provider=provider, depends_on=[karpenter_crds]),
)

# --- EC2NodeClass and NodePool ----------------------------------------------
# Discovers the subnets and security group tagged `karpenter.sh/discovery` in
# 01-cluster, launches g5.xlarge instances tainted the same way as the
# static GPU node group so GPU pods scheduled by either path behave alike.

ec2_node_class = k8s.apiextensions.CustomResource(
    "gpu-ec2-node-class",
    api_version="karpenter.k8s.aws/v1",
    kind="EC2NodeClass",
    metadata=k8s.meta.v1.ObjectMetaArgs(name="gpu-workshop"),
    spec={
        "amiFamily": "AL2023",
        "role": node_role.name,
        "subnetSelectorTerms": [{"tags": {"karpenter.sh/discovery": cluster_name}}],
        "securityGroupSelectorTerms": [{"tags": {"karpenter.sh/discovery": cluster_name}}],
    },
    opts=pulumi.ResourceOptions(provider=provider, depends_on=[karpenter, node_instance_profile]),
)

node_pool = k8s.apiextensions.CustomResource(
    "gpu-node-pool",
    api_version="karpenter.sh/v1",
    kind="NodePool",
    metadata=k8s.meta.v1.ObjectMetaArgs(name="gpu-workshop"),
    spec={
        "template": {
            "metadata": {"labels": {"workshop-role": "gpu-autoscaled"}},
            "spec": {
                "requirements": [
                    {
                        "key": "node.kubernetes.io/instance-type",
                        "operator": "In",
                        "values": ["g5.xlarge"],
                    },
                    {
                        "key": "kubernetes.io/arch",
                        "operator": "In",
                        "values": ["amd64"],
                    },
                    {
                        "key": "karpenter.sh/capacity-type",
                        "operator": "In",
                        "values": ["on-demand"],
                    },
                ],
                "taints": [
                    {"key": "nvidia.com/gpu", "value": "true", "effect": "NoSchedule"}
                ],
                "nodeClassRef": {
                    "group": "karpenter.k8s.aws",
                    "kind": "EC2NodeClass",
                    "name": "gpu-workshop",
                },
            },
        },
        "limits": {"cpu": "16"},
        "disruption": {"consolidationPolicy": "WhenEmptyOrUnderutilized"},
    },
    opts=pulumi.ResourceOptions(provider=provider, depends_on=[ec2_node_class]),
)

pulumi.export("karpenter_controller_role_arn", controller_role.arn)
pulumi.export("karpenter_node_role_arn", node_role.arn)
pulumi.export("interruption_queue_name", interruption_queue.name)
