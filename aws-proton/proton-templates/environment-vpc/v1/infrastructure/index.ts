import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const vpcCidr = config.require("vpcCidrBlock");
const vpcName = config.require("vpcName");

const vpc = new awsx.ec2.Vpc(vpcName, {
  cidrBlock: vpcCidr
});

const cluster = new aws.ecs.Cluster("cluster");

// TODO: Add ALB, remove export of public subnet ids so that we can only deploy
// services into private subnets.

export const vpcId = vpc.vpcId;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateSubnetIds = vpc.privateSubnetIds;
export const clusterArn = cluster.arn;