import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();

const vpcCidr = config.require("vpcCidrBlock");
const name = config.require("name");

const vpc = new awsx.ec2.Vpc("vpc", {
  cidrBlock: vpcCidr,
  name,
});

export const vpcId = vpc.vpcId;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateSubnetIds = vpc.privateSubnetIds;