import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as pcloud from "@pulumi/pulumiservice";

const vpc = new awsx.ec2.Vpc("k8s-better-together", {
  // Using a single NAT Gateway (as opposed to the default of one per AZ) helps
  // reduce cost and may improve provisioning time. In production scenarios, you
  // should typically use one per AZ.
  natGateways: {
    strategy: "Single"
  },
});

const eksCluster = new eks.Cluster("k8s-better-together", {
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
  createOidcProvider: true,
});

const assumeRolePolicy = aws.iam.getPolicyDocumentOutput({
  statements: [{
    actions: ["sts:AssumeRoleWithWebIdentity"],
    conditions: [{
      test: "StringEquals",
      values: ["system:serviceaccount:kube-system:ebs-csi-controller-sa"],
      variable: pulumi.interpolate`${eksCluster.oidcIssuer}:sub`,
    }],
    effect: "Allow",
    principals: [{
      identifiers: [eksCluster.oidcProviderArn],
      type: "Federated",
    }],
  }],
});

const csiRole = new aws.iam.Role("ebs-csi", {
  assumeRolePolicy: assumeRolePolicy.json,
});

new aws.iam.RolePolicyAttachment("ebs-csi", {
  role: csiRole.name,
  policyArn: aws.iam.ManagedPolicy.AmazonEBSCSIDriverPolicy,
});

new eks.Addon("ebs-csi-driver", {
  addonName: "aws-ebs-csi-driver",
  cluster: eksCluster,
  serviceAccountRoleArn: csiRole.arn,
});

const ecrRepo = new awsx.ecr.Repository("k8s-better-together");

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
  project: "k8s-better-together",
  name: "eks-cluster",
  yaml: envYaml,
});

export const kubeconfig = eksCluster.kubeconfig;
export const repoUrl = ecrRepo.url;