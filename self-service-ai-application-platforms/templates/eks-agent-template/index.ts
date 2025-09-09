import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as k8s from "@pulumi/kubernetes";
import * as eks from "@pulumi/eks";
import * as pulumiservice from "@pulumi/pulumiservice";

const config = new pulumi.Config();

const minClusterSize = config.getNumber("minClusterSize") || 3;
const maxClusterSize = config.getNumber("maxClusterSize") || 6;
const desiredClusterSize = config.getNumber("desiredClusterSize") || 3;
const eksNodeInstanceType = config.get("eksNodeInstanceType") || "m5.4xlarge";
const vpcNetworkCidr = config.get("vpcNetworkCidr") || "10.0.0.0/16";
const clusterName = config.require("clusterName");

const eksVpc = new awsx.ec2.Vpc("eks-vpc", {
    enableDnsHostnames: true,
    cidrBlock: vpcNetworkCidr,
    enableDnsSupport: true,
});

const cluster = new eks.Cluster("eks-cluster", {
    vpcId: eksVpc.vpcId,
    authenticationMode: eks.AuthenticationMode.Api,
    publicSubnetIds: eksVpc.publicSubnetIds,
    privateSubnetIds: eksVpc.privateSubnetIds,
    instanceType: eksNodeInstanceType,
    desiredCapacity: desiredClusterSize,
    minSize: minClusterSize,
    maxSize: maxClusterSize,
    nodeAssociatePublicIpAddress: false,
    endpointPrivateAccess: false,
    endpointPublicAccess: true,
});

const kagentCRDs = new k8s.helm.v3.Release("kagent-crds", {
    chart: "oci://ghcr.io/kagent-dev/kagent/helm/kagent-crds",
    version: "0.6.9",
    namespace: "kagent",
    createNamespace: true,
}, {provider: cluster.provider});

const kagent = new k8s.helm.v3.Release("kagent", {
    chart: "oci://ghcr.io/kagent-dev/kagent/helm/kagent",
    version: "0.6.9",
    namespace: kagentCRDs.namespace,
    name: "kagent",
    createNamespace: true,
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
- pulumi-ultimate-gitops/dev
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
    dependsOn: [cluster],
});

export const kubeconfig = pulumi.secret(cluster.kubeconfigJson)
