import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";

// Optional, cloud-only step: one real GPU behind Kubernetes Dynamic Resource
// Allocation (DRA), shared by two pods via time-slicing. kind cannot provide
// a GPU, so this is a separate EKS cluster from 01-cluster's kind cluster.
// Run this well before the workshop: the node group alone takes 15-20
// minutes, and most new AWS accounts have a GPU instance quota of 0 that
// needs a support-ticket increase (see README "GPU quota" section).
//
// Cost note: g4dn.xlarge is ~$0.526/hr on-demand in us-east-1 (read from
// https://instances.vantage.sh/aws/ec2/g4dn.xlarge, 2026-09-27). One
// instance for a 90-minute workshop plus rehearsal is a few dollars; destroy
// it (06-teardown) as soon as the segment is rehearsed or delivered.

const config = new pulumi.Config();
const instanceType = config.get("gpuInstanceType") ?? "g4dn.xlarge";
const clusterName = "gpu-batch-dra";

const vpc = new awsx.ec2.Vpc(clusterName, {
    cidrBlock: "10.1.0.0/16",
    enableDnsHostnames: true,
    subnetSpecs: [
        { type: awsx.ec2.SubnetType.Public, tags: { [`kubernetes.io/cluster/${clusterName}`]: "shared" } },
        { type: awsx.ec2.SubnetType.Private, tags: { [`kubernetes.io/cluster/${clusterName}`]: "shared" } },
    ],
    subnetStrategy: "Auto",
});

// Plain EKS control plane, no auto mode: this workshop provisions its own
// GPU node group explicitly with aws.eks.NodeGroup, below, so the audience
// sees the exact resource that carries the GPU.
const cluster = new eks.Cluster(clusterName, {
    name: clusterName,
    vpcId: vpc.vpcId,
    publicSubnetIds: vpc.publicSubnetIds,
    privateSubnetIds: vpc.privateSubnetIds,
    skipDefaultNodeGroup: true,
    authenticationMode: eks.AuthenticationMode.Api,
});

const gpuNodeGroup = new aws.eks.NodeGroup(`${clusterName}-gpu`, {
    clusterName: cluster.eksCluster.name,
    nodeGroupNamePrefix: "gpu-",
    nodeRoleArn: cluster.instanceRoles[0].arn,
    subnetIds: vpc.privateSubnetIds,
    instanceTypes: [instanceType],
    amiType: "AL2_x86_64_GPU",
    scalingConfig: {
        desiredSize: 1,
        minSize: 1,
        maxSize: 1,
    },
    labels: { "workshop-role": "gpu-dra-demo" },
    tags: {
        workshop: "gpu-aware-batch-scheduling-volcano",
        "managed-by": "pulumi",
    },
}, { parent: cluster });

const k8sProvider = cluster.provider;

// NVIDIA's Kubernetes DRA driver (donated to kubernetes-sigs, April 2026).
// The chart installs both the ResourceSlice-publishing kubelet plugin and
// the DeviceClass CRDs its own config format needs.
const draDriver = new k8s.helm.v4.Chart(
    "dra-driver-nvidia-gpu",
    {
        chart: "oci://registry.k8s.io/dra-driver-nvidia/charts/dra-driver-nvidia-gpu",
        version: "0.5.0",
        namespace: "dra-driver-nvidia-gpu",
        values: {
            gpuResourcesEnabledOverride: true,
        },
    },
    { provider: k8sProvider, dependsOn: [gpuNodeGroup] },
);

// Two pods sharing the node's single GPU through time-slicing (Alpha
// feature gate `TimeSlicingSettings` on the DRA driver -- see README).
// Both request the same DeviceClass; the driver's ResourceClaimTemplate
// config tells it to interleave CUDA contexts on one physical GPU rather
// than allocate a whole GPU per claim.
const sharedGpuClaimTemplate = new k8s.apiextensions.CustomResource(
    "shared-gpu-claim-template",
    {
        apiVersion: "resource.k8s.io/v1",
        kind: "ResourceClaimTemplate",
        metadata: { name: "shared-gpu", namespace: "default" },
        spec: {
            spec: {
                devices: {
                    requests: [{ name: "gpu", exactly: { deviceClassName: "gpu.nvidia.com" } }],
                    config: [
                        {
                            requests: ["gpu"],
                            opaque: {
                                driver: "gpu.nvidia.com",
                                parameters: {
                                    apiVersion: "resource.nvidia.com/v1beta1",
                                    kind: "GpuConfig",
                                    sharing: {
                                        strategy: "TimeSlicing",
                                        timeSlicingConfig: { interval: "Long" },
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        },
    },
    { provider: k8sProvider, dependsOn: [draDriver] },
);

function sharedGpuPod(name: string) {
    return new k8s.core.v1.Pod(
        name,
        {
            metadata: { name, namespace: "default" },
            spec: {
                containers: [
                    {
                        name: "trainer",
                        image: "nvcr.io/nvidia/cuda:12.6.0-base-ubuntu22.04",
                        command: ["sleep", "3600"],
                        resources: { claims: [{ name: "gpu-claim" }] },
                    },
                ],
                resourceClaims: [{ name: "gpu-claim", resourceClaimTemplateName: sharedGpuClaimTemplate.metadata.name }],
            },
        },
        { provider: k8sProvider, dependsOn: [sharedGpuClaimTemplate] },
    );
}

const podA = sharedGpuPod("gpu-share-a");
const podB = sharedGpuPod("gpu-share-b");

export const kubeconfig = pulumi.secret(cluster.kubeconfigJson);
export const clusterNameOut = cluster.eksCluster.name;
export const gpuNodeGroupName = gpuNodeGroup.nodeGroupName;
export const podAName = podA.metadata.name;
export const podBName = podB.metadata.name;
