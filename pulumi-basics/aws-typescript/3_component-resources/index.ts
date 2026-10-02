import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();
const baseName = config.get("baseName") || `${pulumi.getOrganization()}-${pulumi.getStack()}`.toLowerCase();

// Use Pulumi-provided AWSX package for easy VPC and related resource creation.
const vpc = new awsx.ec2.Vpc(`${baseName}-net`)

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
  vpcId: vpc.vpcId,
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
  subnetId: vpc.publicSubnetIds[0],
  tags: { "Name": serverName },
  instanceType: aws.ec2.InstanceType.T3_Micro, 
  vpcSecurityGroupIds: [ group.id ], // reference the group object above
  ami: ami,
  userData: userData,              // start a simple web server
  associatePublicIpAddress: true,
});

export const url = pulumi.interpolate`http://${server.publicIp}`;
