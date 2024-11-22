import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";

// Assemble resource name from context pieces
const config = new pulumi.Config();
const namespace: string = config.require("namespace")
const environment: string = config.require("environment")
const name: string = config.require("name")

const eksName: string = [
  namespace,
  environment,
  name,
].join('-')

// Uncomment to use regular stack references

// const stackRef = new pulumi.StackReference("vpc-stack", {
//   name: `HuckStream/ESC-K8s-Stackrefs-Net/sbx`
// });

// const vpcId = stackRef.getOutput("vpcId");
// const publicSubnetIds = stackRef.getOutput("publicSubnetIds") as pulumi.Output<string[]>;
// const privateSubnetIds = stackRef.getOutput("privateSubnetIds") as pulumi.Output<string[]>;

const vpcId = config.require("vpcId");
const publicSubnetIds = config.requireObject<string[]>("publicSubnetIds");
const privateSubnetIds = config.requireObject<string[]>("privateSubnetIds");

// Retrieve the ARN for the AWS SSO AdministratorAccess role
const adminRoles = aws.iam.getRoles({
  nameRegex: ".*AdministratorAccess.*",
});
const roleArn = adminRoles.then(role => role.arns).then(roleArns => roleArns[0]);

// Create cluster
const eksCluster = new eks.Cluster(eksName, {
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

  authenticationMode: 'API_AND_CONFIG_MAP',
  accessEntries: {
    "awsSsoAdmin": {
      principalArn: pulumi.interpolate`${roleArn}`,
      accessPolicies: {
        clusterAdmin: {
          policyArn: "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy",
          accessScope: {
            type: "cluster"
          }
        }
      },
      type: 'STANDARD',
      tags: {
        Namespace: namespace,
        Environment: environment,
        Name: eksName
      }
    }
  },

  clusterTags: {
    Namespace: namespace,
    Environment: environment,
    Name: eksName
  },
  tags: {
    Namespace: namespace,
    Environment: environment,
    Name: eksName
  }
});

export const kubeconfig = eksCluster.kubeconfig;
