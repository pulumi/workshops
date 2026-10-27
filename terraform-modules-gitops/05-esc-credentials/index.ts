import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as vpcAws from "@pulumi/vpc-aws";

const config = new pulumi.Config();
const allowedCidr = config.require("allowedCidr"); // your own public IP, e.g. 203.0.113.10/32
const region = new pulumi.Config("aws").require("region");
const name = `${pulumi.getProject()}-${pulumi.getStack()}`;

const tags = {
    Project: pulumi.getProject(),
    Stack: pulumi.getStack(),
    ManagedBy: "pulumi",
};

const vpc = new vpcAws.Module("vpc", {
    name,
    cidr: "10.0.0.0/16",
    azs: [`${region}a`, `${region}b`],
    publicSubnets: ["10.0.101.0/24", "10.0.102.0/24"],
    enableNatGateway: false,
    tags,
});

// The module declares vpcId as optional; fail early if it is ever missing.
const vpcId = vpc.vpcId.apply(id => {
    if (!id) {
        throw new Error("the vpc module returned no vpc_id");
    }
    return id;
});

// A native Pulumi resource wired to a Terraform module output. Both live in
// one stack state, so Pulumi orders the SecurityGroup after the module's VPC.
const web = new aws.ec2.SecurityGroup("web", {
    vpcId,
    description: "HTTPS from the workshop participant only",
    ingress: [{
        protocol: "tcp",
        fromPort: 443,
        toPort: 443,
        cidrBlocks: [allowedCidr],
        description: "HTTPS from allowedCidr",
    }],
    tags,
});

// Publishes the VPC id for other stacks and scripts, named after the stack.
const vpcIdParameter = new aws.ssm.Parameter("vpc-id", {
    name: `/${pulumi.getProject()}/${pulumi.getStack()}/vpc-id`,
    type: "String",
    value: vpcId,
    tags,
});

export { vpcId };
export const publicSubnets = vpc.publicSubnets;
export const securityGroupId = web.id;
export const vpcIdParameterName = vpcIdParameter.name;
