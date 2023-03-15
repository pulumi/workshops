import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const vpcCidr = config.require("vpcCidrBlock");
const name = config.require("name");

const vpc = new awsx.ec2.Vpc(`${name}-vpc`, {
  cidrBlock: vpcCidr,
  // In a more prod-ready scenario, this should be "OnePerAz", but we do this
  // here to avoid incurring too much cost or hitting annoying EIP limits.
  natGateways: {
    strategy: "Single",
  }
});

const cluster = new aws.ecs.Cluster("cluster");

// We allow all inbound HTTP traffic from everywhere (this would be HTTPS in a
// more production scenario, but getting certificates to work in a demo is
// complicated due to the need to prove domain ownership).
// We will add egress rules in the service templates along with the individual
// services.
// For details, see:
// https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-update-security-groups.html
const albSecurityGroup = new aws.ec2.SecurityGroup("alb-sg", {
  vpcId: vpc.vpcId,
  ingress: [{
    protocol: "tcp",
    fromPort: 80,
    toPort: 80,
    cidrBlocks: ["0.0.0.0/0"],
  }],
  egress: [{
    protocol: "tcp",
    fromPort: 80,
    toPort: 80,
    cidrBlocks: [vpcCidr],
  }]
});

const alb = new aws.lb.LoadBalancer(`${name}-alb`, {
  internal: false,
  securityGroups: [albSecurityGroup.id],
  subnets: vpc.publicSubnetIds,
});

export const vpcId = vpc.vpcId;
export const privateSubnetIds = vpc.privateSubnetIds;
export const clusterArn = cluster.arn;
export const albArn = alb.arn;
export const albDnsName = alb.dnsName;