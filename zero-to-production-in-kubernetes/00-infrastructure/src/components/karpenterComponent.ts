import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";

/**
 * Arguments for creating a Karpenter component
 */
export interface KarpenterComponentArgs {
    /**
     * The EKS cluster name
     */
    clusterName: pulumi.Input<string>;

    /**
     * The EKS cluster endpoint
     */
    clusterEndpoint: pulumi.Input<string>;

    /**
     * Security group ID for the EKS cluster (for node communication)
     */
    clusterSecurityGroupId: pulumi.Input<string>;

    /**
     * Karpenter Helm chart version
     * @default "1.10.0"
     */
    karpenterVersion?: string;

    /**
     * Namespace to deploy Karpenter
     * @default "kube-system"
     */
    namespace?: string;

    /**
     * AWS region
     */
    awsRegion: pulumi.Input<string>;

    /**
     * AWS account ID
     */
    awsAccountId: pulumi.Input<string>;

    /**
     * Tags to apply to taggable AWS resources managed by this component
     */
    tags?: pulumi.Input<Record<string, pulumi.Input<string>>>;
}

/**
 * AMI selector term for EC2NodeClass
 */
export interface AMISelectorTerm {
    /**
     * AMI ID to use
     */
    id?: string;

    /**
     * AMI name pattern (supports wildcards)
     */
    name?: string;

    /**
     * AMI owner (e.g., "amazon", "self", or AWS account ID)
     */
    owner?: string;

    /**
     * Tags to filter AMIs
     */
    tags?: Record<string, string>;

    /**
     * Alias for Karpenter built-in AMI discovery (e.g., "al2023@latest", "al2023-nvidia@latest")
     */
    alias?: string;
}

/**
 * EC2NodeClass configuration for GPU nodes with EBS snapshot support
 */
export interface EC2NodeClassArgs {
    /**
     * Name of the EC2NodeClass
     */
    name: string;

    /**
     * AMI family (AL2023, Bottlerocket, etc.)
     * @default "Bottlerocket"
     */
    amiFamily?: string;

    /**
     * AMI selector terms for selecting AMIs
     * Required for Karpenter v1.x
     * If not provided, defaults to alias for the AMI family
     */
    amiSelectorTerms?: AMISelectorTerm[];

    /**
     * Block device mappings with optional EBS snapshot
     */
    blockDeviceMappings?: BlockDeviceMapping[];

    /**
     * Instance store policy (RAID0 for NVMe)
     */
    instanceStorePolicy?: "RAID0";

    /**
     * Additional tags to apply to instances
     */
    tags?: Record<string, string>;

    /**
     * User data (base64 encoded or plain text depending on AMI family)
     */
    userData?: string;
}

export interface BlockDeviceMapping {
    deviceName: string;
    rootVolume?: boolean;
    ebs: {
        volumeSize: string;
        volumeType: string;
        iops?: number;
        throughput?: number;
        encrypted?: boolean;
        deleteOnTermination?: boolean;
        snapshotID?: string;
    };
}

/**
 * Internal spec shape for the EC2NodeClass CRD
 */
interface EC2NodeClassSpec {
    amiFamily: string;
    amiSelectorTerms: (AMISelectorTerm | { alias: string })[];
    role: pulumi.Output<string>;
    subnetSelectorTerms: { tags: Record<string, pulumi.Input<string>> }[];
    securityGroupSelectorTerms: { tags: Record<string, pulumi.Input<string>> }[];
    blockDeviceMappings: {
        deviceName: string;
        rootVolume?: boolean;
        ebs: {
            volumeSize: string;
            volumeType: string;
            iops?: number;
            throughput?: number;
            encrypted: boolean;
            deleteOnTermination: boolean;
            snapshotID?: string;
        };
    }[];
    instanceStorePolicy?: "RAID0";
    tags?: Record<string, string>;
    userData?: string;
}

export class KarpenterComponent extends pulumi.ComponentResource {
    /**
     * The Karpenter controller IAM role ARN
     */
    public readonly controllerRoleArn: pulumi.Output<string>;

    /**
     * The Karpenter node IAM role ARN
     */
    public readonly nodeRoleArn: pulumi.Output<string>;

    /**
     * The Karpenter node IAM role name (used by EC2NodeClass)
     */
    public readonly nodeRoleName: pulumi.Output<string>;

    /**
     * The node instance profile ARN
     */
    public readonly nodeInstanceProfileArn: pulumi.Output<string>;

    /**
     * The EKS cluster name (stored for use in createEC2NodeClass)
     */
    private readonly clusterName: pulumi.Input<string>;

    /**
     * The Karpenter controller IAM role
     */
    private readonly controllerRole: aws.iam.Role;

    /**
     * The Karpenter node IAM role
     */
    private readonly nodeRole: aws.iam.Role;

    /**
     * The Karpenter Helm release
     */
    private readonly helmRelease: k8s.helm.v3.Release;

    /**
     * The node instance profile
     */
    private readonly nodeInstanceProfile: aws.iam.InstanceProfile;

    /**
     * The Pod Identity Association for Karpenter controller
     */
    private readonly podIdentityAssociation: aws.eks.PodIdentityAssociation;

    constructor(name: string, args: KarpenterComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:infrastructure:KarpenterComponent", name, args, opts);

        const karpenterVersion = args.karpenterVersion || "1.10.0";
        const namespace = args.namespace || "kube-system";
        const tags = args.tags;

        // Store cluster name for use in createEC2NodeClass
        this.clusterName = args.clusterName;

        // Get current AWS region and account
        const awsRegion = args.awsRegion;
        const awsAccountId = args.awsAccountId;

        // Create Karpenter Node Role
        this.nodeRole = new aws.iam.Role(`${name}-node-role`, {
            name: pulumi.interpolate`KarpenterNodeRole-${args.clusterName}`,
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: {
                        Service: "ec2.amazonaws.com",
                    },
                    Action: "sts:AssumeRole",
                }],
            }),
            managedPolicyArns: [
                "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
                "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
                "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
                "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
            ],
            tags: tags,
        }, { parent: this });

        // Create instance profile for node role
        this.nodeInstanceProfile = new aws.iam.InstanceProfile(`${name}-node-instance-profile`, {
            name: pulumi.interpolate`KarpenterNodeInstanceProfile-${args.clusterName}`,
            role: this.nodeRole.name,
            tags: tags,
        }, { parent: this });

        // Create Karpenter Controller Role with Pod Identity trust policy
        this.controllerRole = new aws.iam.Role(`${name}-controller-role`, {
            name: pulumi.interpolate`KarpenterControllerRole-${args.clusterName}`,
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: {
                        Service: "pods.eks.amazonaws.com",
                    },
                    Action: [
                        "sts:AssumeRole",
                        "sts:TagSession",
                    ],
                }],
            }),
            tags: tags,
        }, { parent: this });

        // Create Karpenter Controller Policy
        const controllerPolicy = new aws.iam.Policy(`${name}-controller-policy`, {
            name: pulumi.interpolate`KarpenterControllerPolicy-${args.clusterName}`,
            policy: pulumi.all([args.clusterName, awsRegion, awsAccountId, this.nodeRole.arn]).apply(
                ([clusterName, region, accountId, nodeRoleArn]) => JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Sid: "AllowScopedEC2InstanceAccessActions",
                            Effect: "Allow",
                            Resource: [
                                `arn:aws:ec2:${region}::image/*`,
                                `arn:aws:ec2:${region}::snapshot/*`,
                                `arn:aws:ec2:${region}:*:security-group/*`,
                                `arn:aws:ec2:${region}:*:subnet/*`,
                                `arn:aws:ec2:${region}:*:capacity-reservation/*`,
                            ],
                            Action: ["ec2:RunInstances", "ec2:CreateFleet"],
                        },
                        {
                            Sid: "AllowScopedEC2LaunchTemplateAccessActions",
                            Effect: "Allow",
                            Resource: `arn:aws:ec2:${region}:*:launch-template/*`,
                            Action: ["ec2:RunInstances", "ec2:CreateFleet"],
                            Condition: {
                                StringEquals: {
                                    [`aws:ResourceTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                },
                                StringLike: {
                                    "aws:ResourceTag/karpenter.sh/nodepool": "*",
                                },
                            },
                        },
                        {
                            Sid: "AllowScopedEC2InstanceActionsWithTags",
                            Effect: "Allow",
                            Resource: [
                                `arn:aws:ec2:${region}:*:fleet/*`,
                                `arn:aws:ec2:${region}:*:instance/*`,
                                `arn:aws:ec2:${region}:*:volume/*`,
                                `arn:aws:ec2:${region}:*:network-interface/*`,
                                `arn:aws:ec2:${region}:*:launch-template/*`,
                                `arn:aws:ec2:${region}:*:spot-instances-request/*`,
                            ],
                            Action: ["ec2:RunInstances", "ec2:CreateFleet", "ec2:CreateLaunchTemplate"],
                            Condition: {
                                StringEquals: {
                                    [`aws:RequestTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                    [`aws:RequestTag/eks:eks-cluster-name`]: clusterName,
                                },
                                StringLike: {
                                    "aws:RequestTag/karpenter.sh/nodepool": "*",
                                },
                            },
                        },
                        {
                            Sid: "AllowScopedResourceCreationTagging",
                            Effect: "Allow",
                            Resource: [
                                `arn:aws:ec2:${region}:*:fleet/*`,
                                `arn:aws:ec2:${region}:*:instance/*`,
                                `arn:aws:ec2:${region}:*:volume/*`,
                                `arn:aws:ec2:${region}:*:network-interface/*`,
                                `arn:aws:ec2:${region}:*:launch-template/*`,
                                `arn:aws:ec2:${region}:*:spot-instances-request/*`,
                            ],
                            Action: "ec2:CreateTags",
                            Condition: {
                                StringEquals: {
                                    [`aws:RequestTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                    [`aws:RequestTag/eks:eks-cluster-name`]: clusterName,
                                    "ec2:CreateAction": ["RunInstances", "CreateFleet", "CreateLaunchTemplate"],
                                },
                                StringLike: {
                                    "aws:RequestTag/karpenter.sh/nodepool": "*",
                                },
                            },
                        },
                        {
                            Sid: "AllowScopedResourceTagging",
                            Effect: "Allow",
                            Resource: `arn:aws:ec2:${region}:*:instance/*`,
                            Action: "ec2:CreateTags",
                            Condition: {
                                StringEquals: {
                                    [`aws:ResourceTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                },
                                StringLike: {
                                    "aws:ResourceTag/karpenter.sh/nodepool": "*",
                                },
                                StringEqualsIfExists: {
                                    [`aws:RequestTag/eks:eks-cluster-name`]: clusterName,
                                },
                                "ForAllValues:StringEquals": {
                                    "aws:TagKeys": ["eks:eks-cluster-name", "karpenter.sh/nodeclaim", "Name"],
                                },
                            },
                        },
                        {
                            Sid: "AllowScopedDeletion",
                            Effect: "Allow",
                            Resource: [
                                `arn:aws:ec2:${region}:*:instance/*`,
                                `arn:aws:ec2:${region}:*:launch-template/*`,
                            ],
                            Action: ["ec2:TerminateInstances", "ec2:DeleteLaunchTemplate"],
                            Condition: {
                                StringEquals: {
                                    [`aws:ResourceTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                },
                                StringLike: {
                                    "aws:ResourceTag/karpenter.sh/nodepool": "*",
                                },
                            },
                        },
                        {
                            Sid: "AllowRegionalReadActions",
                            Effect: "Allow",
                            Resource: "*",
                            Action: [
                                "ec2:DescribeCapacityReservations",
                                "ec2:DescribeImages",
                                "ec2:DescribeInstances",
                                "ec2:DescribeInstanceTypeOfferings",
                                "ec2:DescribeInstanceTypes",
                                "ec2:DescribeLaunchTemplates",
                                "ec2:DescribeSecurityGroups",
                                "ec2:DescribeSpotPriceHistory",
                                "ec2:DescribeSubnets",
                            ],
                            Condition: {
                                StringEquals: {
                                    "aws:RequestedRegion": region,
                                },
                            },
                        },
                        {
                            Sid: "AllowSSMReadActions",
                            Effect: "Allow",
                            Resource: `arn:aws:ssm:${region}::parameter/aws/service/*`,
                            Action: "ssm:GetParameter",
                        },
                        {
                            Sid: "AllowPricingReadActions",
                            Effect: "Allow",
                            Resource: "*",
                            Action: "pricing:GetProducts",
                        },
                        {
                            Sid: "AllowPassingInstanceRole",
                            Effect: "Allow",
                            Resource: nodeRoleArn,
                            Action: "iam:PassRole",
                            Condition: {
                                StringEquals: {
                                    "iam:PassedToService": ["ec2.amazonaws.com", "ec2.amazonaws.com.cn"],
                                },
                            },
                        },
                        {
                            Sid: "AllowScopedInstanceProfileCreationActions",
                            Effect: "Allow",
                            Resource: `arn:aws:iam::${accountId}:instance-profile/*`,
                            Action: ["iam:CreateInstanceProfile"],
                            Condition: {
                                StringEquals: {
                                    [`aws:RequestTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                    [`aws:RequestTag/eks:eks-cluster-name`]: clusterName,
                                    "aws:RequestTag/topology.kubernetes.io/region": region,
                                },
                                StringLike: {
                                    "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass": "*",
                                },
                            },
                        },
                        {
                            Sid: "AllowScopedInstanceProfileTagActions",
                            Effect: "Allow",
                            Resource: `arn:aws:iam::${accountId}:instance-profile/*`,
                            Action: ["iam:TagInstanceProfile"],
                            Condition: {
                                StringEquals: {
                                    [`aws:ResourceTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                    "aws:ResourceTag/topology.kubernetes.io/region": region,
                                    [`aws:RequestTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                    [`aws:RequestTag/eks:eks-cluster-name`]: clusterName,
                                    "aws:RequestTag/topology.kubernetes.io/region": region,
                                },
                                StringLike: {
                                    "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass": "*",
                                    "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass": "*",
                                },
                            },
                        },
                        {
                            Sid: "AllowScopedInstanceProfileActions",
                            Effect: "Allow",
                            Resource: `arn:aws:iam::${accountId}:instance-profile/*`,
                            Action: [
                                "iam:AddRoleToInstanceProfile",
                                "iam:RemoveRoleFromInstanceProfile",
                                "iam:DeleteInstanceProfile",
                            ],
                            Condition: {
                                StringEquals: {
                                    [`aws:ResourceTag/kubernetes.io/cluster/${clusterName}`]: "owned",
                                    "aws:ResourceTag/topology.kubernetes.io/region": region,
                                },
                                StringLike: {
                                    "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass": "*",
                                },
                            },
                        },
                        {
                            Sid: "AllowInstanceProfileReadActions",
                            Effect: "Allow",
                            Resource: `arn:aws:iam::${accountId}:instance-profile/*`,
                            Action: "iam:GetInstanceProfile",
                        },
                        {
                            Sid: "AllowUnscopedInstanceProfileListAction",
                            Effect: "Allow",
                            Resource: "*",
                            Action: "iam:ListInstanceProfiles",
                        },
                        {
                            Sid: "AllowAPIServerEndpointDiscovery",
                            Effect: "Allow",
                            Resource: `arn:aws:eks:${region}:${accountId}:cluster/${clusterName}`,
                            Action: "eks:DescribeCluster",
                        },
                    ],
                })
            ),
            tags: tags,
        }, { parent: this });

        // Attach the policy to the controller role
        new aws.iam.RolePolicyAttachment(`${name}-controller-policy-attachment`, {
            role: this.controllerRole.name,
            policyArn: controllerPolicy.arn,
        }, { parent: this });

        // Tag subnets for Karpenter discovery
        // Note: This is handled in the VPC setup with karpenter.sh/discovery tag

        // Tag security group for Karpenter discovery
        new aws.ec2.Tag(`${name}-sg-tag`, {
            resourceId: args.clusterSecurityGroupId,
            key: "karpenter.sh/discovery",
            value: args.clusterName,
        }, { parent: this });

        // Create EKS Access Entry for Karpenter node role
        // This allows Karpenter-provisioned nodes to join the cluster
        // Required when using EKS API authentication mode (AuthenticationMode.Api)
        new aws.eks.AccessEntry(`${name}-node-access-entry`, {
            clusterName: args.clusterName,
            principalArn: this.nodeRole.arn,
            type: "EC2_LINUX",  // For Linux/Bottlerocket nodes managed by Karpenter
            tags: tags,
        }, { parent: this });

        // Create Pod Identity Association for Karpenter controller
        // This links the IAM role to the Karpenter service account using EKS Pod Identity
        this.podIdentityAssociation = new aws.eks.PodIdentityAssociation(`${name}-pod-identity`, {
            clusterName: args.clusterName,
            namespace: namespace,
            serviceAccount: "karpenter",
            roleArn: this.controllerRole.arn,
            tags: tags,
        }, { parent: this });

        // Install Karpenter via Helm
        // Note: No service account annotation needed - Pod Identity handles auth
        this.helmRelease = new k8s.helm.v3.Release(`${name}-helm`, {
            name: "karpenter",
            namespace: namespace,
            chart: "oci://public.ecr.aws/karpenter/karpenter",
            version: karpenterVersion,
            values: {
                settings: {
                    clusterName: args.clusterName,
                    clusterEndpoint: args.clusterEndpoint,
                    interruptionQueue: "", // Optional: SQS queue for spot interruption handling
                },
                controller: {
                    env: [
                        {
                            name: "AWS_REGION",
                            value: args.awsRegion,
                        },
                    ],
                    resources: {
                        requests: {
                            cpu: "1",
                            memory: "1Gi",
                        },
                        limits: {
                            cpu: "1",
                            memory: "1Gi",
                        },
                    },
                },
                // Tolerate the CriticalAddonsOnly taint on system nodes
                tolerations: [
                    {
                        key: "CriticalAddonsOnly",
                        operator: "Exists",
                    },
                ],
                // Prefer scheduling on system nodes
                affinity: {
                    nodeAffinity: {
                        requiredDuringSchedulingIgnoredDuringExecution: {
                            nodeSelectorTerms: [{
                                matchExpressions: [{
                                    key: "node-role",
                                    operator: "In",
                                    values: ["system"],
                                }],
                            }],
                        },
                    },
                },
            },
        }, { parent: this, dependsOn: [this.podIdentityAssociation] });

        // Derive public output properties from private resources
        this.controllerRoleArn = this.controllerRole.arn;
        this.nodeRoleArn = this.nodeRole.arn;
        this.nodeRoleName = this.nodeRole.name;
        this.nodeInstanceProfileArn = this.nodeInstanceProfile.arn;

        this.registerOutputs({
            controllerRoleArn: this.controllerRoleArn,
            nodeRoleArn: this.nodeRoleArn,
            nodeRoleName: this.nodeRoleName,
            nodeInstanceProfileArn: this.nodeInstanceProfileArn,
        });
    }

    /**
     * Create an EC2NodeClass for Karpenter.
     * Uses the cluster name from the component constructor for subnet/security group discovery.
     */
    createEC2NodeClass(
        name: string,
        args: EC2NodeClassArgs,
        opts?: pulumi.CustomResourceOptions
    ): k8s.apiextensions.CustomResource {
        const amiFamily = args.amiFamily || "Bottlerocket";

        // Default block device mappings based on AMI family
        let blockDeviceMappings = args.blockDeviceMappings;
        if (!blockDeviceMappings) {
            if (amiFamily === "Bottlerocket") {
                blockDeviceMappings = [
                    {
                        deviceName: "/dev/xvda",
                        rootVolume: true,
                        ebs: {
                            volumeSize: "4Gi",
                            volumeType: "gp3",
                            encrypted: true,
                            deleteOnTermination: true,
                        },
                    },
                    {
                        deviceName: "/dev/xvdb",
                        ebs: {
                            volumeSize: "100Gi",
                            volumeType: "gp3",
                            iops: 10000,
                            throughput: 500,
                            encrypted: true,
                            deleteOnTermination: true,
                        },
                    },
                ];
            } else {
                blockDeviceMappings = [
                    {
                        deviceName: "/dev/xvda",
                        rootVolume: true,
                        ebs: {
                            volumeSize: "100Gi",
                            volumeType: "gp3",
                            iops: 10000,
                            throughput: 500,
                            encrypted: true,
                            deleteOnTermination: true,
                        },
                    },
                ];
            }
        }

        // Default AMI selector terms based on AMI family using alias
        // This uses Karpenter's built-in AMI discovery via SSM parameters
        const amiSelectorTerms = args.amiSelectorTerms || [
            {
                alias: `${amiFamily.toLowerCase()}@latest`,
            },
        ];

        const spec: EC2NodeClassSpec = {
            amiFamily: amiFamily,
            amiSelectorTerms: amiSelectorTerms,
            role: this.nodeRole.name,
            subnetSelectorTerms: [
                {
                    tags: {
                        "karpenter.sh/discovery": this.clusterName,
                    },
                },
            ],
            securityGroupSelectorTerms: [
                {
                    tags: {
                        "karpenter.sh/discovery": this.clusterName,
                    },
                },
            ],
            blockDeviceMappings: blockDeviceMappings.map(bdm => ({
                deviceName: bdm.deviceName,
                rootVolume: bdm.rootVolume,
                ebs: {
                    volumeSize: bdm.ebs.volumeSize,
                    volumeType: bdm.ebs.volumeType,
                    iops: bdm.ebs.iops,
                    throughput: bdm.ebs.throughput,
                    encrypted: bdm.ebs.encrypted ?? true,
                    deleteOnTermination: bdm.ebs.deleteOnTermination ?? true,
                    snapshotID: bdm.ebs.snapshotID,
                },
            })),
        };

        // Add instance store policy if specified (for NVMe instances)
        if (args.instanceStorePolicy) {
            spec.instanceStorePolicy = args.instanceStorePolicy;
        }

        // Add tags if specified
        if (args.tags) {
            spec.tags = args.tags;
        }

        // Add userData if specified
        if (args.userData) {
            spec.userData = args.userData;
        }

        return new k8s.apiextensions.CustomResource(`${name}-ec2nodeclass`, {
            apiVersion: "karpenter.k8s.aws/v1",
            kind: "EC2NodeClass",
            metadata: {
                name: args.name,
            },
            spec,
        }, { parent: this, ...opts });
    }
}
