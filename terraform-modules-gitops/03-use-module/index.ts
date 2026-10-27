import * as pulumi from "@pulumi/pulumi";
import * as vpcAws from "@pulumi/vpc-aws";

const region = new pulumi.Config("aws").require("region");
const name = `${pulumi.getProject()}-${pulumi.getStack()}`;

const tags = {
    Project: pulumi.getProject(),
    Stack: pulumi.getStack(),
    ManagedBy: "pulumi",
};

// The community terraform-aws-modules/vpc/aws module, pinned in Pulumi.yaml.
// Inputs use the module's variable names in camelCase.
const vpc = new vpcAws.Module("vpc", {
    name,
    cidr: "10.0.0.0/16",
    azs: [`${region}a`, `${region}b`],
    publicSubnets: ["10.0.101.0/24", "10.0.102.0/24"],
    enableNatGateway: false, // no NAT gateway: nothing in this stack bills by the hour
    tags,
});

// The module's outputs are typed properties on the component.
export const vpcId = vpc.vpcId;
export const publicSubnets = vpc.publicSubnets;
