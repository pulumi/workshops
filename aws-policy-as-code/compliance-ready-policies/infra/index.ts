import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const subnetId = config.require("subnetId");

const ami = aws.ec2.getAmiOutput({
  mostRecent: true,
  owners: ["amazon"],
  filters: [{
    name: "name",
    values: ["amzn2-ami-hvm-*-x86_64-gp2"],
  }],
});

new aws.ec2.Instance("my-server", {
  subnetId: subnetId,
  instanceType: aws.ec2.InstanceType.T3_Micro,
  ami: ami.id,
  vpcSecurityGroupIds: ["sg-123456"],
  associatePublicIpAddress: false,
  tags: {
    Name: "compliance-ready-policies",
  },
});

