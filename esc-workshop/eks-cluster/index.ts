import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as pcloud from "@pulumi/pulumiservice";

const vpc = new awsx.ec2.Vpc("esc-workshop", {
  // Using a single NAT Gateway (as opposed to the default of one per AZ) helps
  // reduce cost and may improve provisioning time. In production scenarios, you
  // should typically use one per AZ.
  natGateways: {
    strategy: "Single"
  }
});

const eksCluster = new eks.Cluster("esc-workshop", {
  authenticationMode: "API",
  vpcId: vpc.vpcId,
  publicSubnetIds: vpc.publicSubnetIds,
  privateSubnetIds: vpc.privateSubnetIds,
  // The CoreDNS add-on takes a while to install (about 10 minutes). Installing
  // the add-on keeps it automatically up to date and is helpful for day 2
  // operations. Since this is just a temporary cluster, we'll leave it
  // disabled.
  corednsAddonOptions: {
    enabled: false,
  },
  createOidcProvider: true
});

// Create an ESC environment that we can use for CLI operations that require a Kubeconfig:
const envYaml = `
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