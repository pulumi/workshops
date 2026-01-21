import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as pcloud from "@pulumi/pulumiservice";

const config = new pulumi.Config();
const vpcId = config.require("vpcId");
const publicSubnetIds = config.requireObject<string[]>("publicSubnetIds");
const privateSubnetIds = config.requireObject<string[]>("privateSubnetIds");

const eksCluster = new eks.Cluster("eks-cluster", {
  vpcId: vpcId,
  publicSubnetIds: publicSubnetIds,
  privateSubnetIds: privateSubnetIds,

  instanceType: "t3.medium",
  desiredCapacity: 3,
  minSize: 3,
  maxSize: 3,
  nodeAssociatePublicIpAddress: false,
  endpointPrivateAccess: false,
  endpointPublicAccess: true,
});

const envYaml = `
imports:
  - aws/aws-oidc-admin
values:
  stacks:
    fn::open::pulumi-stacks:
      stacks:
        eks-cluster:
          stack: ${pulumi.getProject()}/${pulumi.getStack()}
  kubeconfig: {'fn::toJSON': "\${stacks.eks-cluster.kubeconfig}"}
  files:
    KUBECONFIG: \${kubeconfig}
`;

new pcloud.Environment("esc-environment", {
  organization: pulumi.getOrganization(),
  project: "esc-workshop",
  name: "eks-cluster",
  yaml: envYaml,
});


export const kubeconfig = eksCluster.kubeconfig;
