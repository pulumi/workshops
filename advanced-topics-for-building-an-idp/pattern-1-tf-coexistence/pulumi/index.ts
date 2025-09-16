import * as aws from "@pulumi/aws";
import * as terraform from "@pulumi/terraform";


const minecraftServer = terraform.state.getLocalReferenceOutput({
    path: "../terraform/terraform.tfstate",
});

export const serverIP = minecraftServer.outputs.minecraft_instance_public_ip;

const ssh = new aws.ec2.SecurityGroupRule("ssh", {
    type: "ingress",
    fromPort: 22,
    toPort: 22,
    protocol: "tcp",
    cidrBlocks: ["0.0.0.0/0"],
    securityGroupId: minecraftServer.outputs.minecraft_security_group_id.apply(id => id!),
});
