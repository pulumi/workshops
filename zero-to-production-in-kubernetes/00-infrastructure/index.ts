import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";
import * as awsx from "@pulumi/awsx";
import * as k8s from "@pulumi/kubernetes";
import {SubnetType} from "@pulumi/awsx/ec2";
import {KarpenterComponent} from "./src/components/karpenterComponent";
import {KarpenterNodePoolComponent} from "./src/components/karpenterNodePoolComponent";
import {AwsLbControllerComponent} from "./src/components/awsLbControllerComponent";
import {VClusterComponent} from "./src/components/vclusterComponent";
import {FluxOperatorComponent} from "./src/components/fluxOperatorComponent";
import {FluxInstanceComponent} from "./src/components/fluxInstanceComponent";
import {FluxGitOpsComponent} from "./src/components/fluxGitOpsComponent";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const config = new pulumi.Config();
const clusterName = config.require("clusterName");
const vclusterConfigs = config.requireObject<{name: string; pool: "standard" | "gpu"}[]>("vclusters");
const currentIdentity = aws.getCallerIdentity();
const currentRegion = aws.getRegion();
const tags = {
    Environment: pulumi.getStack(),
    Project: pulumi.getProject(),
    ManagedBy: "Pulumi",
    Owner: "dirien",
};

// ---------------------------------------------------------------------------
// VPC
// ---------------------------------------------------------------------------

const eksVpc = new awsx.ec2.Vpc("eks-vpc", {
    enableDnsHostnames: true,
    cidrBlock: "10.0.0.0/16",
    numberOfAvailabilityZones: 2,
    natGateways: {strategy: "Single"},
    tags,
    subnetSpecs: [
        {
            type: SubnetType.Public,
            tags: {
                ...tags,
                [`kubernetes.io/cluster/${clusterName}`]: "shared",
                "kubernetes.io/role/elb": "1",
                "karpenter.sh/discovery": clusterName,
            },
        },
        {
            type: SubnetType.Private,
            tags: {
                ...tags,
                [`kubernetes.io/cluster/${clusterName}`]: "shared",
                "kubernetes.io/role/internal-elb": "1",
                "karpenter.sh/discovery": clusterName,
            },
        },
    ],
    subnetStrategy: "Auto",
});

// ---------------------------------------------------------------------------
// EKS Cluster
// ---------------------------------------------------------------------------

const cluster = new eks.Cluster("eks-cluster", {
    name: clusterName,
    authenticationMode: eks.AuthenticationMode.Api,
    vpcId: eksVpc.vpcId,
    publicSubnetIds: eksVpc.publicSubnetIds,
    privateSubnetIds: eksVpc.privateSubnetIds,
    skipDefaultNodeGroup: true,
    skipDefaultSecurityGroups: true,
    createOidcProvider: true,
    version: "1.32",
    tags,
});

// Tag cluster security group for Karpenter discovery
new aws.ec2.Tag("eks-cluster-sg-karpenter-tag", {
    resourceId: cluster.eksCluster.vpcConfig.clusterSecurityGroupId,
    key: "karpenter.sh/discovery",
    value: clusterName,
});

// ---------------------------------------------------------------------------
// System Node IAM Role
// ---------------------------------------------------------------------------

const nodeRole = new aws.iam.Role("system-node-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {Service: "ec2.amazonaws.com"},
        }],
    }),
    tags,
});

["arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
 "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
 "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
].forEach((policyArn, i) => {
    new aws.iam.RolePolicyAttachment(`system-node-policy-${i}`, {
        role: nodeRole.name,
        policyArn,
    });
});

// ---------------------------------------------------------------------------
// System Managed Node Group (m6i.large x2, CriticalAddonsOnly taint)
// ---------------------------------------------------------------------------

const systemNodeGroup = new eks.ManagedNodeGroup("system-nodes", {
    cluster,
    nodeGroupName: "system-nodes",
    nodeRole,
    instanceTypes: ["m6i.large"],
    scalingConfig: {minSize: 2, maxSize: 4, desiredSize: 2},
    subnetIds: eksVpc.privateSubnetIds,
    amiType: "AL2023_x86_64_STANDARD",
    labels: {"node-role": "system"},
    taints: [{key: "CriticalAddonsOnly", value: "true", effect: "NO_SCHEDULE"}],
    tags,
});

// ---------------------------------------------------------------------------
// EKS Addons
// ---------------------------------------------------------------------------

// CoreDNS
new aws.eks.Addon("coredns", {
    clusterName: cluster.eksCluster.name,
    addonName: "coredns",
    resolveConflictsOnCreate: "OVERWRITE",
    resolveConflictsOnUpdate: "OVERWRITE",
    tags,
}, {dependsOn: [systemNodeGroup]});

// Pod Identity Agent
const podIdentityAddon = new aws.eks.Addon("eks-pod-identity-agent", {
    clusterName: cluster.eksCluster.name,
    addonName: "eks-pod-identity-agent",
    resolveConflictsOnCreate: "OVERWRITE",
    resolveConflictsOnUpdate: "OVERWRITE",
    tags,
}, {dependsOn: [systemNodeGroup]});

// EBS CSI Driver (with Pod Identity IAM role)
const ebsCsiRole = new aws.iam.Role("ebs-csi-role", {
    name: pulumi.interpolate`AmazonEKS_EBS_CSI_DriverRole-${clusterName}`,
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: {Service: "pods.eks.amazonaws.com"},
            Action: ["sts:AssumeRole", "sts:TagSession"],
        }],
    }),
    tags,
});

new aws.iam.RolePolicyAttachment("ebs-csi-policy-attachment", {
    role: ebsCsiRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy",
});

const ebsCsiPodIdentity = new aws.eks.PodIdentityAssociation("ebs-csi-pod-identity", {
    clusterName: cluster.eksCluster.name,
    namespace: "kube-system",
    serviceAccount: "ebs-csi-controller-sa",
    roleArn: ebsCsiRole.arn,
    tags,
}, {dependsOn: [podIdentityAddon]});

const ebsCsiAddon = new aws.eks.Addon("aws-ebs-csi-driver", {
    clusterName: cluster.eksCluster.name,
    addonName: "aws-ebs-csi-driver",
    resolveConflictsOnCreate: "OVERWRITE",
    resolveConflictsOnUpdate: "OVERWRITE",
    tags,
}, {dependsOn: [systemNodeGroup, ebsCsiPodIdentity]});

// ---------------------------------------------------------------------------
// K8s Provider + gp3 StorageClass
// ---------------------------------------------------------------------------

const k8sProvider = new k8s.Provider("k8s-provider", {
    kubeconfig: cluster.kubeconfigJson,
    enableServerSideApply: true,
});

new k8s.storage.v1.StorageClass("gp3-storage-class", {
    metadata: {
        name: "gp3",
        annotations: {"storageclass.kubernetes.io/is-default-class": "true"},
    },
    provisioner: "ebs.csi.aws.com",
    volumeBindingMode: "WaitForFirstConsumer",
    reclaimPolicy: "Delete",
    allowVolumeExpansion: true,
    parameters: {type: "gp3", encrypted: "true"},
}, {provider: k8sProvider, dependsOn: [ebsCsiAddon]});

// ---------------------------------------------------------------------------
// Karpenter
// ---------------------------------------------------------------------------

const karpenter = new KarpenterComponent("karpenter", {
    clusterName,
    clusterEndpoint: cluster.eksCluster.endpoint,
    clusterSecurityGroupId: cluster.eksCluster.vpcConfig.clusterSecurityGroupId,
    karpenterVersion: "1.10.0",
    namespace: "kube-system",
    awsRegion: currentRegion.then(r => r.region),
    awsAccountId: currentIdentity.then(id => id.accountId),
    tags,
}, {
    provider: k8sProvider,
    dependsOn: [podIdentityAddon, systemNodeGroup],
});

// ---------------------------------------------------------------------------
// EC2NodeClass for workload nodes — AL2023 (no gVisor)
// ---------------------------------------------------------------------------

const defaultNodeClass = karpenter.createEC2NodeClass("default-nodeclass", {
    name: "default-al2023",
    amiFamily: "AL2023",
    blockDeviceMappings: [
        {
            deviceName: "/dev/xvda",
            rootVolume: true,
            ebs: {
                volumeSize: "100Gi",
                volumeType: "gp3",
                iops: 3000,
                throughput: 125,
                encrypted: true,
                deleteOnTermination: true,
            },
        },
    ],
    tags: {
        ...tags,
        "karpenter.sh/discovery": clusterName,
        "Name": `${clusterName}-workload-node`,
    },
}, {provider: k8sProvider});

// ---------------------------------------------------------------------------
// NodePool for general workloads
// ---------------------------------------------------------------------------

new KarpenterNodePoolComponent("default-pool", {
    poolName: "default-pool",
    nodeClassName: "default-al2023",
    instanceTypes: ["m5.large", "m5.xlarge", "m5.2xlarge"],
    capacityTypes: ["on-demand"],
    limits: {cpu: 100},
    disruption: {
        consolidationPolicy: "WhenEmpty",
        consolidateAfter: "1m",
    },
}, {provider: k8sProvider, dependsOn: [defaultNodeClass]});

// ---------------------------------------------------------------------------
// AWS Load Balancer Controller (manages ALB/NLB for Ingress and Services)
// ---------------------------------------------------------------------------

new AwsLbControllerComponent("aws-lb-controller", {
    clusterName,
    vpcId: eksVpc.vpcId,
    chartVersion: "3.1.0",
    namespace: "kube-system",
    awsRegion: currentRegion.then(r => r.region),
    tags,
}, {
    provider: k8sProvider,
    dependsOn: [podIdentityAddon, systemNodeGroup],
});

// ---------------------------------------------------------------------------
// Karpenter: vCluster Standard Node Pool
// ---------------------------------------------------------------------------

const vclusterStandardNodeClass = karpenter.createEC2NodeClass("vcluster-standard-nodeclass", {
    name: "vcluster-standard-al2023",
    amiFamily: "AL2023",
    blockDeviceMappings: [
        {
            deviceName: "/dev/xvda",
            rootVolume: true,
            ebs: {
                volumeSize: "100Gi",
                volumeType: "gp3",
                iops: 3000,
                throughput: 125,
                encrypted: true,
                deleteOnTermination: true,
            },
        },
    ],
    tags: {
        ...tags,
        "karpenter.sh/discovery": clusterName,
        "Name": `${clusterName}-vcluster-standard-node`,
    },
}, {provider: k8sProvider});

new KarpenterNodePoolComponent("vcluster-standard-pool", {
    poolName: "vcluster-standard-pool",
    nodeClassName: "vcluster-standard-al2023",
    instanceTypes: ["m5.large", "m5.xlarge", "m5.2xlarge"],
    capacityTypes: ["on-demand"],
    labels: {"workload-type": "vcluster-standard"},
    limits: {cpu: 100},
    disruption: {
        consolidationPolicy: "WhenEmpty",
        consolidateAfter: "1m",
    },
}, {provider: k8sProvider, dependsOn: [vclusterStandardNodeClass]});

// ---------------------------------------------------------------------------
// Karpenter: vCluster GPU Node Pool
// ---------------------------------------------------------------------------

const vclusterGpuNodeClass = karpenter.createEC2NodeClass("vcluster-gpu-nodeclass", {
    name: "vcluster-gpu-al2023",
    amiFamily: "AL2023",
    blockDeviceMappings: [
        {
            deviceName: "/dev/xvda",
            rootVolume: true,
            ebs: {
                volumeSize: "100Gi",
                volumeType: "gp3",
                iops: 3000,
                throughput: 125,
                encrypted: true,
                deleteOnTermination: true,
            },
        },
    ],
    tags: {
        ...tags,
        "karpenter.sh/discovery": clusterName,
        "Name": `${clusterName}-vcluster-gpu-node`,
    },
}, {provider: k8sProvider});

new KarpenterNodePoolComponent("vcluster-gpu-pool", {
    poolName: "vcluster-gpu-pool",
    nodeClassName: "vcluster-gpu-al2023",
    instanceTypes: ["g4dn.xlarge", "g4dn.2xlarge", "g5.xlarge", "g5.2xlarge"],
    capacityTypes: ["on-demand"],
    labels: {"workload-type": "vcluster-gpu"},
    limits: {cpu: 100},
    disruption: {
        consolidationPolicy: "WhenEmpty",
        consolidateAfter: "1m",
    },
}, {provider: k8sProvider, dependsOn: [vclusterGpuNodeClass]});

// ---------------------------------------------------------------------------
// NVIDIA Device Plugin (makes GPUs visible on GPU nodes)
// ---------------------------------------------------------------------------

new k8s.helm.v3.Release("nvidia-device-plugin", {
    name: "nvidia-device-plugin",
    namespace: "kube-system",
    chart: "nvidia-device-plugin",
    repositoryOpts: {repo: "https://nvidia.github.io/k8s-device-plugin"},
    values: {
        nodeSelector: {
            "workload-type": "vcluster-gpu",
        },
        tolerations: [{
            key: "nvidia.com/gpu",
            operator: "Exists",
            effect: "NoSchedule",
        }],
        affinity: {
            nodeAffinity: {
                requiredDuringSchedulingIgnoredDuringExecution: {
                    nodeSelectorTerms: [{
                        matchExpressions: [{
                            key: "workload-type",
                            operator: "In",
                            values: ["vcluster-gpu"],
                        }],
                    }],
                },
            },
        },
    },
}, {provider: k8sProvider, dependsOn: [systemNodeGroup]});

// ---------------------------------------------------------------------------
// vClusters: Multi-team topology (driven by ESC simulation environment)
// ---------------------------------------------------------------------------

const vclusterComponents: Record<string, VClusterComponent> = {};

// ---------------------------------------------------------------------------
// Flux Operator on Host Cluster
// ---------------------------------------------------------------------------

const gitRepoUrl = config.require("gitRepoUrl");
const gitRepoBranch = config.get("gitRepoBranch") ?? "main";

const hostFluxOperator = new FluxOperatorComponent("host-flux-operator", {
    tolerations: [{key: "CriticalAddonsOnly", operator: "Exists"}],
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
    webEnabled: true,
}, {provider: k8sProvider, dependsOn: [systemNodeGroup]});

const hostFluxInstance = new FluxInstanceComponent("host-flux-instance", {
}, {provider: k8sProvider, dependsOn: [hostFluxOperator]});

new FluxGitOpsComponent("host-gitops", {
    repoUrl: gitRepoUrl,
    repoBranch: gitRepoBranch,
    clusterPath: "zero-to-production-in-kubernetes/01-gitops/clusters/host",
}, {provider: k8sProvider, dependsOn: [hostFluxInstance]});

// ---------------------------------------------------------------------------
// vClusters + Flux Operator on Each vCluster
// ---------------------------------------------------------------------------

for (const vc of vclusterConfigs) {
    const vcComp = new VClusterComponent(vc.name, {
        vclusterName: vc.name,
        pool: vc.pool,
        flux: {
            gitRepoUrl,
            gitRepoBranch,
            clusterPath: `zero-to-production-in-kubernetes/01-gitops/clusters/${vc.name}`,
        },
    }, {
        provider: k8sProvider,
        dependsOn: [systemNodeGroup],
    });
    vclusterComponents[vc.name] = vcComp;
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

export const kubeconfig = pulumi.secret(cluster.kubeconfigJson);
export const clusterNameOutput = cluster.eksCluster.name;
export const vpcId = eksVpc.vpcId;
export const vclusterKubeconfigs = Object.fromEntries(
    Object.entries(vclusterComponents).map(([name, comp]) => [
        name,
        pulumi.interpolate`${comp.namespaceName}/${comp.kubeconfigSecretName}`,
    ]),
);
