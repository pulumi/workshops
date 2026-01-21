import * as awsx from "@pulumi/awsx";
import * as pcloud from "@pulumi/pulumiservice";
import * as pulumi from "@pulumi/pulumi";

const vpc = new awsx.ec2.Vpc("ecs-training-vpc", {
  natGateways: {
    strategy: "Single"
  }
});

const envYaml = 
`
values:
  stackRefs:
    fn::open::pulumi-stacks:
      stacks:
        vpcInfra:
          stack: esc-training-vpc-infra/dev
  pulumiConfig:
    vpcId: \${stackRefs.vpcInfra.vpcId}
    publicSubnetIds: \${stackRefs.vpcInfra.publicSubnetIds}
    privateSubnetIds: \${stackRefs.vpcInfra.privateSubnetIds}
`;

const org = pulumi.getOrganization();

new pcloud.Environment("vpc-stack", {
  organization: org,
  project: "esc-workshop",
  name: "vpc-stack",
  yaml: envYaml,
});


export const vpcId = vpc.vpcId;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateSubnetIds = vpc.privateSubnetIds;
