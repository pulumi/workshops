import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();

// Use Pulumi-provided AWSX package for easy VPC and related resource creation.
const vpc = new awsx.ec2.Vpc(`${baseName}-net`);

export const vpcId = vpc.vpcId;
export const webserverSubnetId = vpc.publicSubnetIds[0]
