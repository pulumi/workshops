import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as awsx from "@pulumi/awsx";
import * as k8s from "@pulumi/kubernetes";
import {SubnetType} from "@pulumi/awsx/ec2";
import * as pulumiservice from "@pulumi/pulumiservice";

const config = new pulumi.Config();
const clusterName = config.require("clusterName");
const gpuInstanceGeneration = config.get("gpuInstanceGeneration") || "4"; // Default to 4th generation GPU instances (e.g., G4dn, G5)
const gpuInstanceArch = config.get("gpuInstanceArch") || "amd64"; // Default to amd64 architecture

const eksVpc = new awsx.ec2.Vpc("eks-auto-mode", {
    enableDnsHostnames: true,
    cidrBlock: "10.0.0.0/16",
    subnetSpecs: [
        // Necessary tags for EKS Auto Mode to identify the subnets for the load balancers.
        // See: https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.1/deploy/subnet_discovery/
        {
            type: SubnetType.Public,
            tags: {[`kubernetes.io/cluster/${clusterName}`]: "shared", "kubernetes.io/role/elb": "1"}
        },
        {
            type: SubnetType.Private,
            tags: {[`kubernetes.io/cluster/${clusterName}`]: "shared", "kubernetes.io/role/internal-elb": "1"}
        },
    ],
    subnetStrategy: "Auto"
});

const cluster = new eks.Cluster("eks-auto-mode", {
    name: clusterName,
    // EKS Auto Mode requires Access Entries, use either the `Api` or `ApiAndConfigMap` authentication mode.
    authenticationMode: eks.AuthenticationMode.Api,
    vpcId: eksVpc.vpcId,
    publicSubnetIds: eksVpc.publicSubnetIds,
    privateSubnetIds: eksVpc.privateSubnetIds,
    // Enables compute, storage and load balancing for the cluster.
    autoMode: {
        enabled: true,
    },
    corednsAddonOptions: {
        enabled: false, // Disable CoreDNS addon to avoid a conflict with the default CoreDNS installed by EKS Auto Mode.
    }
});

export const kubeconfig = pulumi.secret(cluster.kubeconfigJson)

const gpuKarpeterNodePool = new k8s.apiextensions.CustomResource("gpu-node-pool", {
    apiVersion: "karpenter.sh/v1",
    kind: "NodePool",
    metadata: {
        name: "gpu-node-pool",
    },
    spec: {
        template: {
            metadata: {
                labels: {
                    type: "karpenter",
                    NodeGroupType: "gpu-node-pool",
                },
            },
            spec: {
                nodeClassRef: {
                    group: "eks.amazonaws.com",
                    kind: "NodeClass",
                    name: "default",
                },
                taints: [
                    {
                        key: "nvidia.com/gpu",
                        value: "Exists",
                        effect: "NoSchedule",
                    },
                ],
                requirements: [
                    {
                        key: "karpenter.sh/capacity-type",
                        operator: "In",
                        values: ["spot", "on-demand"],
                    },
                    {
                        key: "topology.kubernetes.io/zone",
                        operator: "In",
                        values: ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1e", "us-east-1f"],
                    },
                    {
                        key: "eks.amazonaws.com/instance-category",
                        operator: "In",
                        values: ["g", "p"],
                    },
                    {
                        key: "eks.amazonaws.com/instance-generation",
                        operator: "Gt",
                        values: [gpuInstanceGeneration],
                    },
                    {
                        key: "kubernetes.io/arch",
                        operator: "In",
                        values: [gpuInstanceArch],
                    }
                ],
            },
        },
        limits: {
            cpu: "4000",
            memory: "40000Gi",
        },
    }
}, {provider: cluster.provider});

const lwsChart = new k8s.helm.v3.Release("lws", {
    chart: "oci://registry.k8s.io/lws/charts/lws",
    version: "0.7.0",
    namespace: "lws-system",
    createNamespace: true,
}, {provider: cluster.provider, dependsOn: [gpuKarpeterNodePool]});


const storageClass = new k8s.storage.v1.StorageClass("prometheus-storage-class", {
    metadata: {
        name: "auto-ebs-sc",
        annotations: {
            "storageclass.kubernetes.io/is-default-class": "true",
        },
    },
    provisioner: "ebs.csi.eks.amazonaws.com",
    volumeBindingMode: "WaitForFirstConsumer",
    parameters: {
        type: "gp3",
        encrypted: "true",
    }
}, {provider: cluster.provider});

const prometheus = new k8s.helm.v3.Release("prometheus", {
    chart: "oci://ghcr.io/prometheus-community/charts/prometheus",
    version: "27.36.0",
    namespace: "monitoring",
    createNamespace: true,
    values: {
        alertmanager: {
            enabled: false,
        },
        "prometheus-pushgateway": {
            enabled: false,
        },
        "prometheus-node-exporter": {
            enabled: false,
        },
        server: {
            persistentVolume: {
                storageClass: storageClass.metadata.name,
            }
        }
    }
}, {provider: cluster.provider, dependsOn: [storageClass, lwsChart]});

const huggingFaceSecret = new k8s.core.v1.Secret("huggingface-secret", {
    metadata: {
        name: "huggingface-token",
        namespace: "lws-system",
    },
    stringData: {
        token: config.requireSecret("huggingface-token")
    },
}, {provider: cluster.provider, dependsOn: [lwsChart]});


const kagentCRDs = new k8s.helm.v3.Release("kagent-crds", {
    chart: "oci://ghcr.io/kagent-dev/kagent/helm/kagent-crds",
    version: "0.6.9",
    namespace: "kagent",
    createNamespace: true,
}, {provider: cluster.provider, dependsOn: [lwsChart]});

const kagent = new k8s.helm.v3.Release("kagent", {
    chart: "oci://ghcr.io/kagent-dev/kagent/helm/kagent",
    version: "0.6.9",
    name: "kagent",
    namespace: kagentCRDs.namespace,
    createNamespace: false,
    values: {
        providers: {
            openAI: {
                apiKey: config.requireSecret("open-ai-token")
            }
        }
    }
}, {provider: cluster.provider, dependsOn: [kagentCRDs]});

const environmentResource = new pulumiservice.Environment("environmentResource", {
    name: clusterName + "-cluster",
    project: "self-service-ai-application-platforms",
    organization: pulumi.getOrganization(),
    yaml: new pulumi.asset.StringAsset(`
imports:
- pulumi-idp/auth
values:
  stackRefs:
    fn::open::pulumi-stacks:
      stacks:
        aws:
          stack: ${pulumi.getProject()}/${pulumi.getStack()}
  pulumiConfig:
    kubernetes:kubeconfig: \${stackRefs.aws.kubeconfig}
`),
}, {
    dependsOn: [cluster, gpuKarpeterNodePool, lwsChart],
});
