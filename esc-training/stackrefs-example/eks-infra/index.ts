import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";

const stackRef = new pulumi.StackReference("vpc-stack", {
  name: `${pulumi.getOrganization()}/ecs-training-vpc-infra/dev`
});

const vpcId = stackRef.getOutput("vpcId");
const publicSubnetIds = stackRef.getOutput("publicSubnetIds");
const privateSubnetIds = stackRef.getOutput("privateSubnetIds");

// const config = new pulumi.Config();
// const vpcId = config.require("vpcId");
// const publicSubnetIds = config.requireObject<string[]>("publicSubnetIds");
// const privateSubnetIds = config.requireObject<string[]>("privateSubnetIds");

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

export const kubeconfig = eksCluster.kubeconfig;
