import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();

const vpcCidr = config.get("vpcCidrBlock") ?? "10.0.0.0/16";

const vpc = new awsx.ec2.Vpc("vpc", {
  cidrBlock: vpcCidr,
});