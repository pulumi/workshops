import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();

//////
// Need to create a stack reference that points to the dev stack for the "base-infra" project.
// And then get the applicable outputs from the "base-infra" stack and use them when creating the "app" stack resources.
/////
// The app stack can't run without the base infra stack, so require this configuration item.
const baseInfraProjectName = config.require("baseInfraProjectName");
// Using the base infra project name, build a full stack name based on the current app stack running.
const baseInfraStackName = `${pulumi.getOrganization()}/${baseInfraProjectName}/${pulumi.getStack()}`;
// Now create a stack reference using the base infra stack name.
const baseInfraStackRef = new pulumi.StackReference(baseInfraStackName);
// And now get the applicable outputs from the base stack needed to deploy the app stack.
const vpcId = baseInfraStackRef.getOutput("vpcId");
const webserverSubnetId = baseInfraStackRef.getOutput("webserverSubnetId");

// Create an EC2 instance running a simple web server.
// Get the id for the latest Amazon Linux AMI
const ami = aws.ec2.getAmi({
  filters: [
      { name: "name", values: ["amzn-ami-hvm-*-x86_64-ebs"] },
  ],
  owners: ["137112412989"], // Amazon
  mostRecent: true,
}).then(result => result.id);

// create a new security group for port 80
const group = new aws.ec2.SecurityGroup(`${baseName}-secgrp`, {
  vpcId: vpcId,
  ingress: [
      { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

// create a simple web server using the startup script for the instance
const userData =
`#!/bin/bash
echo "Hello, World!" > index.html
nohup python -m SimpleHTTPServer 80 &`;

const serverName = `${baseName}-web-server`;
const server = new aws.ec2.Instance(serverName, {
  subnetId: webserverSubnetId,
  tags: { "Name": serverName },
  instanceType: aws.ec2.InstanceType.T3_Micro, 
  vpcSecurityGroupIds: [ group.id ], // reference the group object above
  ami: ami,
  userData: userData,              // start a simple web server
  associatePublicIpAddress: true,
});

export const url = pulumi.interpolate`http://${server.publicIp}`;
