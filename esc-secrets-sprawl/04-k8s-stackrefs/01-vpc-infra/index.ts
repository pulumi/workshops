import * as pulumi from "@pulumi/pulumi";
import * as pulumiservice from "@pulumi/pulumiservice";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Get the Pulumi organization name
const org = pulumi.getOrganization();
const stack = pulumi.getStack();

// Assemble resource name from context pieces
const config = new pulumi.Config();
const namespace: string = config.require("namespace")
const environment: string = config.require("environment")
const name: string = config.require("name")

const vpcName: string = [
  namespace,
  environment,
  name,
].join('-')

const defaultName: string = [
  vpcName,
  'default'
].join('-')

// Create VPC
const vpc = new awsx.ec2.Vpc(vpcName, {
  natGateways: {
    strategy: "Single"
  },
  tags: {
    Namespace: namespace,
    Environment: environment,
    Name: vpcName
  }
});

// Configure default route table
const rtb = new aws.ec2.DefaultRouteTable("defaultRouteTable", {
  defaultRouteTableId: vpc.vpc.defaultRouteTableId,
  routes: [],
  tags: {
    Namespace: namespace,
    Environment: environment,
    Name: defaultName
  },
});

// Configure default security group
const sg = new aws.ec2.DefaultSecurityGroup("defaultSecurityGroup", {
  vpcId: vpc.vpcId,
  ingress: [],
  egress: [],
  tags: {
    Namespace: namespace,
    Environment: environment,
    Name: defaultName
  },
});

// Configure default NACL
const nacl = new aws.ec2.DefaultNetworkAcl("defaultNACL", {
  defaultNetworkAclId: vpc.vpc.defaultNetworkAclId,
  ingress: [{
    protocol: "-1",
    ruleNo: 100,
    action: "allow",
    cidrBlock: "0.0.0.0/0",
    fromPort: 0,
    toPort: 0,
  }],
  egress: [{
    protocol: "-1",
    ruleNo: 100,
    action: "allow",
    cidrBlock: "0.0.0.0/0",
    fromPort: 0,
    toPort: 0,
  }],
  tags: {
    Namespace: namespace,
    Environment: environment,
    Name: defaultName
  },
});


const envJson = pulumi.jsonStringify({
  "values": {
    "stackRefs": {
      "fn::open::pulumi-stacks": {
        "stacks": {
          "net": {
            "stack": ""
          }
        },
      },
    },
    "pulumiConfig": {
      "vpcId": "${stackRefs.vpcInfra.vpcId}",
      "publicSubnetIds": "${stackRefs.vpcInfra.publicSubnetIds}",
      "privateSubnetIds": "${stackRefs.vpcInfra.privateSubnetIds}"
    }
  },
});

const envAsset = envJson.apply(json => new pulumi.asset.StringAsset(json));

// Create a new environment
const env = new pulumiservice.Environment("esc-k8s-stackrefs-net", {
  name: "net",
  project: "stackrefs",
  organization: 'HuckStream',
  yaml: envAsset,
});

// // Set team permissions
// const adminPermissions = new pulumiservice.TeamEnvironmentPermission("admin", {
//   organization: org,
//   project: env.project,
//   environment: env.name,
//   team: "Admin",
//   permission: pulumiservice.EnvironmentPermission.Admin
// });

// const platformPermissions = new pulumiservice.TeamEnvironmentPermission("platform", {
//   organization: org,
//   project: env.project,
//   environment: env.name,
//   team: "Platform",
//   permission: pulumiservice.EnvironmentPermission.Write
// });

// const cicdPermissions = new pulumiservice.TeamEnvironmentPermission("cicd", {
//   organization: org,
//   project: env.project,
//   environment: env.name,
//   team: "cicd",
//   permission: pulumiservice.EnvironmentPermission.Open
// });


export const vpcId = vpc.vpcId;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateSubnetIds = vpc.privateSubnetIds;
export const envContent = envAsset
